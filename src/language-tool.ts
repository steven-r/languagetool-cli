#!/usr/bin/env ts-node-esm

import axios from "axios";
import { Command, Option } from "commander";
import { findUpSync } from "find-up";
import fs from "fs";
import { TransformableInfo } from "logform";
import path from "path";
import * as qs from "qs";
import { VFile } from "vfile";
import { location, Point } from "vfile-location";
import { reporter } from "vfile-reporter";
import { createLogger, format, transports } from "winston";
import * as annotationBuilder from "./annotation-builder.js";
import { VimReporter } from "./vim-reporter.js";
import {
  IAnnotationBuilderOptions,
  ILanguageToolMatch,
  ILanguageToolRequest,
} from "./interfaces";

const myformat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.splat(),
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, ...args } = info;

    const ts = timestamp.slice(0, 19).replace("T", " ");
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
    }`;
  })
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let argv: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let options:  any;
let verbose = false;
let url:URL = new URL('http://localhost:8081/v2/check')
let outputChannel: (vfile: VFile|VFile[]) => string = reporter;

const logger = createLogger({
  transports: [
    new transports.Console({
      level: verbose ? "debug" : "info",
      format: myformat,
    }),
  ],
});

const remarkBuilderOptions: IAnnotationBuilderOptions =
  annotationBuilder.defaults;
remarkBuilderOptions.interpretmarkup = customMarkdownInterpreter;
// Regular expression for matching the start of inline disable/enable comments (from https://github.com/DavidAnson/markdownlint/blob/main/helpers/helpers.js)
const inlineCommentStartRe =
  /(<!--\s*languagetool-(disable-file|enable-file|disable-line|disable-next-line|configure-file))(?:\s|-->)/gi;
const configFileStartRe =
  /^\s*(languagetool-)?(?<command>disable|enable)(?<parameter>(\s+([A-Z_0-9]+)(\([^)]+\))?)+)/gi;
const inlineCommentRuleRe = /\s*([A-Z_0-9]+)(\((.+?)\))?/gi;
let enabledRules: Record<string, boolean> = {};
let enabledRulesPerLineNumber: Record<number, Record<string, boolean>> = {};

let globalRules: Record<string, boolean> = {};

let body: ILanguageToolRequest;

mainline();

export function processFile(fileName: string) {
  logger.debug("Processing " + fileName);
  const fileContents = fs.readFileSync(fileName, { encoding: "utf8" });
  const annotatedMarkdown: string = JSON.stringify(
    annotationBuilder.build(fileContents, remarkBuilderOptions)
  );
  body.data = annotatedMarkdown;
  return axios
    .post(url.href, qs.stringify(body))
    .then((res) => processResponse(fileName, fileContents, res.data.matches))
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error(error.response.status);
        logger.error(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        logger.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error("Error:", error);
      }
    });
}

function parseCommandLine(commandLine?: string[]) {
  const program = new Command();
  program
    .argument("[files...]", "Input files")
    .option("-v, --verbose", "Debug output", false)
    .option("--enabled-rules <rules...>")
    .option("--disabled-rules <rules...>")
    .option("--enabled-categories <categories...>")
    .option("--disabled-categories <categories...>")
    .option("--only-enabled", "Use enabled rules only", false)
    .option("-r, --rule-config <files...>")
    .option("--url <url>")
    .addOption(new Option("--output-format <format>", 'Output format').choices(['pretty', 'vim', 'reviewdog']).default('pretty'))
    .option("-l, --language <language>", "Sprache", "auto")
    .option("-m, --mother-tongue <mother-tongue>", "Mother tongue");

  const argv = program.parse(commandLine ?? process.argv);
  return argv;
}

// Custom markdown interpretation
export function customMarkdownInterpreter(text: string): string {
  // Default of preserve line breaks
  let interpretation = "\n".repeat((text.match(/\n/g) || []).length);
  if (text.match(/^(?!\s*`{3})\s*`{1,2}/)) {
    // Treat inline code as redacted text
    interpretation = "`" + "#".repeat(text.length - 2) + "`";
  } else if (text.match(/::+[^:]+::+/)) {
    // block comments
    interpretation += "# ";
  } else if (text.match(/#\s+$/)) {
    // Preserve Headers
    interpretation += "# ";
  } else if (text.match(/\*\s+$/)) {
    // Preserve bullets without leading spaces
    interpretation += "* ";
  } else if (text.match(/\d+\.\s+$/)) {
    // Treat as bullets without leading spaces
    interpretation += "** ";
  }
  return interpretation;
}

// See: https://forum.languagetool.org/t/identify-spelling-rules/4775/3
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isSpellingRule(ruleId: string): boolean {
  return (
    ruleId.indexOf("MORFOLOGIK_RULE") !== -1 ||
    ruleId.indexOf("SPELLER_RULE") !== -1 ||
    ruleId.indexOf("HUNSPELL_NO_SUGGEST_RULE") !== -1 ||
    ruleId.indexOf("HUNSPELL_RULE") !== -1 ||
    ruleId.indexOf("GERMAN_SPELLER_RULE") !== -1 ||
    ruleId.indexOf("FR_SPELLING_RULE") !== -1
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildBody(options: Record<string, any>): ILanguageToolRequest {
  const data: ILanguageToolRequest = {
    language: options.language,
  };
  if (options.onlyEnabled) {
    data.onlyEnabled = options.onlyEnabled;
  }
  if (options.enabledRules) {
    data.enabledRules = buildSet(options.enabledRules);
  }
  if (options.enabledCategories) {
    data.enabledRules = buildSet(options.enabledCategories);
  }
  if (options.disabledRules) {
    data.disabledRules = buildSet(options.disabledRules);
  }
  if (options.disabledCategories) {
    data.disabledCategories = buildSet(options.disabledCategories);
  }
  if (options.motherTongue) {
    data.motherTongue = options.motherTongue;
  }
  return data;
}

export function buildSet(set?: string[]) {
  if (!set) return "";
  return set.join(",");
}

export function processResponse(
  filename: string,
  fileContents: string,
  matches: ILanguageToolMatch[]
) {
  filename = path.resolve(filename);
  const vfile = new VFile(fileContents);
  parseCommands(filename, fileContents);
  const loc = location(vfile);
  vfile.path = filename;
  // logger.debug("Line-Rules", enabledRulesPerLineNumber);
  // logger.debug("global-fules", enabledRules);
  matches.forEach((match: ILanguageToolMatch) => {
    let word: string | undefined = undefined;
    if (match.context) {
      word = match.context.text.substring(
        match.context.offset,
        match.context.offset + match.context.length
      );
    }
    const key = match.rule.id;
    let key2 = key;
    if (word) {
      key2 = key2 + `(${word})`;
    }
    const point = loc.toPoint(match.offset);
    let result = isEnabled(key2, point);
    if (result == undefined) {
      result = isEnabled(key, point, false);
    }
    if (result === true) {
      let message = match.message;
      if (word) {
        message += ` (${word})`;
      }
      vfile.message(message, point, match.rule.id);
    }
  });
  console.log(outputChannel(vfile));
}

export function isEnabled(
  key: string,
  point: Point,
  returnUndefinedOnMiss = true
): boolean | undefined {
  let data: boolean | undefined = enabledRules[key];
  if (data === undefined) {
    data = enabledRulesPerLineNumber[point.line]
      ? enabledRulesPerLineNumber[point.line][key]
      : undefined;
  }
  if (returnUndefinedOnMiss) {
    return data;
  }
  return data === undefined ? true : data;
}

const commandMap: Record<
  string,
  (
    action: string,
    parameter: string,
    filename: string,
    lineIndex: number
  ) => void
> = {
  "ENABLE-FILE": handleEnableDisableFile,
  "DISABLE-FILE": handleEnableDisableFile,
  "DISABLE-LINE": handleEnableDisableLine,
  "ENABLE-LINE": handleEnableDisableLine,
  "DISABLE-NEXT-LINE": handleEnableDisableLine,
  "ENABLE-NEXT-LINE": handleEnableDisableLine,
  "CONFIGURE-FILE": handleConfigureFile,
};

export function applyEnableDisable(
  parameter: string,
  enabled: boolean,
  state: Record<string, boolean>
) {
  state = { ...state };
  const trimmed = parameter && parameter.trim();

  let match: RegExpExecArray | null;
  while ((match = inlineCommentRuleRe.exec(trimmed))) {
    let key = match[1].toUpperCase();
    if (match[2]) {
      key = key + match[2];
    }
    state[key] = enabled;
  }
  return state;
}

export function parseCommands(filename: string, fileContents: string): void {
  const lines = fileContents.split("\n");
  let lineIndex = 1;
  enabledRules = globalRules;
  enabledRulesPerLineNumber = {};
  lines.forEach((line) => {
    let match: RegExpExecArray | null;
    while ((match = inlineCommentStartRe.exec(line))) {
      const action = match[2].toUpperCase();
      const startIndex = match.index + match[1].length;
      const endIndex = line.indexOf("-->", startIndex);
      if (endIndex === -1) {
        break;
      }
      const parameter = line.slice(startIndex, endIndex);
      const cmd = commandMap[action];
      if (cmd) {
        cmd(action, parameter, filename, lineIndex);
      }
    }
    lineIndex++;
  });
}

export function handleEnableDisableFile(action: string, parameter: string) {
  const enabled = action === "ENABLE-FILE";
  enabledRules = applyEnableDisable(parameter, enabled, enabledRules);
}

export function handleConfigureFile(
  _action: string,
  parameter: string,
  filename: string
) {
  const files = parameter.split(/\s+/);
  const folder = path.parse(path.resolve(filename)).dir;
  files.forEach((file: string) => {
    if (!file) return;
    const configFile = findUpSync(file, { cwd: folder });
    if (configFile) {
      logger.debug(`Reading configuration file ${configFile}`);
      const content = fs.readFileSync(configFile, { encoding: "utf8" });
      const lines = content.split("\n");
      lines.forEach((line: string) => {
        if (/^#/.test(line)) return;
        let match: RegExpExecArray | null;
        while ((match = configFileStartRe.exec(line))) {
          if (match.groups) {
            const enabled = match.groups.command.toUpperCase() === "ENABLE";
            enabledRules = applyEnableDisable(
              match.groups.parameter,
              enabled,
              enabledRules
            );
          }
        }
      });
    } else {
      logger.warn(`Configuration file ${configFile} not found`);
    }
  });
}

export function handleEnableDisableLine(
  action: string,
  parameter: string,
  _filename: string,
  lineIndex: number
) {
  const enabled = action === "ENABLE-LINE" || action === "ENABLE-NEXT-LINE";
  const lineno = lineIndex + (action.indexOf("-NEXT-LINE") > 0 ? 1 : 0);
  enabledRulesPerLineNumber[lineno] = applyEnableDisable(
    parameter,
    enabled,
    enabledRulesPerLineNumber[lineno] ?? {}
  );
}

function mainline() {
  argv = parseCommandLine();
  options = argv.optsWithGlobals();
  verbose = options.verbose;
  if (options.url) {
    url = new URL(options.url);
  }
  if (options.outputFormat !== 'pretty') {
    outputChannel = VimReporter;
  }
  body = buildBody(options);
  if (options.ruleConfig) {
    options.ruleConfig.forEach((filename: string) => {
      if (!fs.existsSync(filename)) {
        logger.warn(`Regeldatei ${filename} nicht gefunden`);
        return;
      }
      handleConfigureFile("", filename, filename);
      globalRules = Object.assign(enabledRules, globalRules);
    });
  }

  argv.args.forEach((file: string) => processFile(file));
}

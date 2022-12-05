/* mainly from vscode-languagetool-linter */
export interface ILanguageToolReplacement {
  value: string;
  shortDescription: string;
}

export interface ILanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: ILanguageToolReplacement[];
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  type: {
    typeName: string;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  ignoreForIncompleteSentence: boolean;
  contextForSureMatch: number;
}

export type ProcessingLevel = 'default'|'picky';

export interface ILanguageToolRequest {
  language: string;
  data?: string;
  text?: string;
  motherTongue?: string;
  enabledRules?: string;
  disabledRules?: string;
  enabledCategories?: string;
  disabledCategories?: string;
  onlyEnabled?: boolean;
  level?: ProcessingLevel;
}

export interface IAnnotationBuilderOptions {
  remarkoptions: Options;
  children(node: INode): INode[];
  annotatetextnode(node: INode, text: string): IAnnotation | null;
  interpretmarkup(text?: string): string;
}

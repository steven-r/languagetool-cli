# languagetool-cli

Command line interface towards languagetool (<https://languagetool.org>)

This is some kind of work in progress as a side-kick besides writing a book. For a list of open issues, please refer to the [to-dos](TODOs.md).

## Dependencies

You have to have a running LanguageTool-Server (see <https://dev.languagetool.org/http-server>) on port 8081

## usage

```plaintext
Usage: language-tool [options] [files...]

Arguments:
  files                                  Input files

Options:
  -v, --verbose                          Debug output (default: false)
  --enabled-rules <rules...>
  --disabled-rules <rules...>
  --enabled-categories <categories...>
  --disabled-categories <categories...>
  --only-enabled                         Use enabled rules only (default: false)
  -r, --rule-config <files...>
  --url <url>
  --output-format <format>               Output format (choices: "pretty", "vim", "reviewdog", default: "pretty")
  -l, --language <language>              Sprache (default: "auto")
  -m, --mother-tongue <mother-tongue>    Mother tongue
  -h, --help                             display help for command
  ```

### -language, -l

Sets the language to be used.

### -mother-tongue, -m

The mother tongue. If set, some more grammar checks are performed

### --rule-file, -r

Adds rules that are processed for all files.
The syntax is described in [Configuration Files](README.md) below.

You can add as many files as needed

### --enabled-rules, --disabled-rules

Enables/disables rules given by rule-id.

### --enable-categories, --disable-categories

Enables/disables rules given by rule-id.

### --output-format

Output messages a `pretty` (user friedly) or computer readable (`vim`, `reviewdog`) format.

## Line and file inline comments

```html
<!-- languagetool-disable-file german_grammar_rule(atembar) -->
<!-- languagetool-enable-file german_grammar_rule(atembar) -->
<!-- languagetool-disable-line german_grammar_rule(atembar) -->
<!-- languagetool-enable-line german_grammar_rule(atembar) -->
<!-- languagetool-disable-next-line german_grammar_rule(atembar) -->
<!-- languagetool-enable-next-line german_grammar_rule(atembar) -->
```

This needs **\<\<TBD\>\>**

### Configuration Files

The file contains a simple syntax:

* Every line can contain a command, which is either `disabled` or `enabled`, followed by rules in the for
`rule-id`, followed by an optional token in parens.

* A line starting with a hash sign ('#') represents a comment

An example:

```plaintext
# missing in lexicon
disable german_grammar_rule(atembar) german_grammar_rule(atembare)

# A Name
disable GERMAN_SPELLER_RULE(Brom)

# This book contains a lot of repeating starts
disable GERMAN_WORD_REPEAT_BEGINNING_RULE
```

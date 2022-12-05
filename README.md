# languagetool-cli

Command line interface towards languagetool (<https://languagetool.org>)

This is some kind of work in progress as a side-kick besides writing a book. For a list of open issues, please refer to the [to-dos](TODOs.md).

## Dependencies

You have to have a running LanguageTool-Server (see <https://dev.languagetool.org/http-server>) on port 8081

## usage

```plaintext
Usage: language-tool [options] [files...]

Arguments:
  files                                  Eingabedateien

Options:
  -v, --verbose                          Debug output (default: false)
  --enabled-rules <rules...>
  --disabled-rules <rules...>
  --enabled-categories <categories...>
  --disabled-categories <categories...>
  --onlyEnabled                          Nur eingeschaltete Prüfungen nutzen (default: false)
  -r, --rule-config <files...>
  -l, --language                         Sprache
  -m, --mother-Tongue                    Muttersprache
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

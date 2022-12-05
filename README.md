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

## Configuration files

This needs **\<\<TBD\>\>**

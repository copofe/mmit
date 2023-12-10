# mmit

A command tool to quickly generate files from templates directory. 

## Prerequisites

You need to create a `templates` folder in your project root and add your template files to it, structured like this:

```
root:.
├─templates
│  ├─component
│  │  ├─index.tsx
```

## Usage

```sh 
mmit [template] [-o <path>] [-r <name>]
```

### Example

```sh
mmit component -o components -r button
```

## Options

> If you do not specify any options, you will be prompted to input them interactively.

- `<template>` - Specify template directory
- `-o <path>` - Specify output path, default is `./`
- `-r <name>` - Specify new file name. If you do not include this option, the file will retain its original name.

Of course, you can use `-h` or `--help` to display help information.

I recommend adding a shortcut command in scripts like this:

```json
{
  "scripts": {
    "gen:component": "mmit component -o components -r button" 
  }
}
```

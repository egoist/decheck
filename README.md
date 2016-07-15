# decheck [![NPM version](https://img.shields.io/npm/v/decheck.svg)](https://npmjs.com/package/decheck) [![NPM downloads](https://img.shields.io/npm/dm/decheck.svg)](https://npmjs.com/package/decheck)

> Checkout the dependencies an NPM module depends on.

## Purpose

I always need to browse a module's `package.json` to find new modules that are used by it. [octo-link](https://github.com/octo-linker/chrome-extension) and [npm-hub](https://github.com/zeke/npm-hub) both are good but not enough for me, cuz I often use terminal.

[![asciicast](https://asciinema.org/a/79811.png)](https://asciinema.org/a/79811)

## Install

```bash
$ npm install -g decheck
```

## Usage

In the program screen you can use arrow keys or your mouse to scroll content, `Vi mode` is also supported. Press `q` or `ESC` or `Ctrl-C` to exit program.

```bash
$ decheck express

# or check current working project
$ decheck .
```

```bash
$ decheck -h

  Usage:
  
    decheck <moduleName> [moduleVersion]

    -d/--dev:        Check the devDependencies
    -r/--registry:   Set custom npm registry
    -c/--cn:         Set npm registry to China mirror
    -v/--version:    Print version
    -h/--help:       Print help
```

## License

MIT © [EGOIST](https://github.com/egoist)

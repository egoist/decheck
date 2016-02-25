# decheck [![NPM version](https://img.shields.io/npm/v/decheck.svg)](https://npmjs.com/package/decheck) [![NPM downloads](https://img.shields.io/npm/dm/decheck.svg)](https://npmjs.com/package/decheck)

> Checkout the dependencies an NPM module depends on.

## Purpose

I always want to browse a module's `package.json` to find new modules that are used by it. With [octo-link](https://github.com/octo-linker/chrome-extension) I can click to know what the module is all about, but click every time? Nope, I want all in one time.

![preview](https://ooo.0o0.ooo/2016/02/24/56ce762bd0b80.png)

## Install

```bash
$ npm install -g decheck
```

## Usage

```bash
$ decheck -h

  Usage:

    decheck <moduleName> [version]

    -v/--version:    Print version
    -h/--help:       Print help
    -r/--registry:   Set custom npm registry
```

## License

MIT © [EGOIST](https://github.com/egoist)

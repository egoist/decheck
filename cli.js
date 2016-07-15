#!/usr/bin/env node
'use strict'

const co = require('co')
const fetch = require('node-fetch')
const minimist = require('minimist')
const toArray = require('object2array')
const isTaken = require('is-taken')
const update = require('update-notifier')
const blessed = require('blessed')
const giturl = require('giturl')

const pkg = require('./package')
require('colorful').toxic()

let screen
let spin

function isModule(name) {
  return name !== '.' && name !== './'
}

function getRepoURL(repo) {
  if (repo.repository) {
    return giturl.parse(repo.repository.url)
  }
  return `https://npmjs.org/package/${repo.name}`
}

function leave(msg, code) {
  if (screen) {
    screen.destroy()
  }
  console.log(msg)
  process.exit(code || 0)
}

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    r: 'registry',
    c: 'cn',
    d: 'dev'
  }
})

// update notify
update({pkg}).notify()

if (argv.help) {
  console.log(`
  Usage:

    decheck <moduleName> [moduleVersion]

    -d/--dev:        Check the devDependencies
    -r/--registry:   Set custom npm registry
    -c/--cn:         Set npm registry to China mirror
    -v/--version:    Print version
    -h/--help:       Print help
  `)
  process.exit()
}

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

let moduleName = argv._[0] || '.'
const moduleVersion = argv._[1]
const field = argv.dev ? 'devDependencies' : 'dependencies'

let registry = argv.registry || 'https://registry.npmjs.org/'
if (argv.cn) {
  registry = 'https://registry.npm.taobao.org/'
}

co(function* () {
  let deps
  let version
  let packageName = moduleName
  if (!isModule(moduleName)) {
    try {
      const pkg = require(process.cwd() + '/package.json')
      packageName = pkg.name
      version = pkg.version
      deps = pkg[field]
    } catch (e) {}
  }

  screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    warnings: true
  })

  spin = blessed.loading({
    parent: screen,
    hidden: true,
    border: {
      type: 'line'
    },
    top: 'center',
    left: 'center',
    width: 'half',
    height: 'shrink',
    label: ` {green-fg}${packageName}{/green-fg} `,
    tags: true,
    keys: true
  })
  spin.load('Retriving data...')

  if (isModule(moduleName)) {
    const pkg = yield isTaken(moduleName, {version: moduleVersion})
    if (pkg) {
      if (pkg.version) {
        version = pkg.version
        deps = pkg[field]
      } else {
        version = pkg['dist-tags'] && pkg['dist-tags']['latest']
        deps = pkg.versions[version][field]
      }
    } else {
      leave(`Sorry, package ${moduleName} is not registered on npm.`, 1)
    }
  }

  if (!deps) {
    leave(`Sorry, but this package has no ${field}`, 1)
  }

  deps = toArray(deps)

  const depsData = yield deps.map(dep => {
    return isTaken(dep.key, {
      version: dep.value,
      registry,
      timeout: 10000
    })
  })
  spin.stop()
  // display screen
  screen.title = packageName
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '80%',
    height: '80%',
    scrollable: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
    vi: true,
    padding: 1,
    keys: true,
    content: `${`${packageName}${version ? `(${version})` : ''} has ${deps.length} ${field}`.yellow}\n` + depsData.map(dep => {
      return `
${dep.name.white.bold} ${'v'.gray}${dep.version.gray}
${dep.description.cyan}
${getRepoURL(dep).gray}
    `
    }).join(''),
    tags: true,
    border: {
      type: 'line'
    },
    alwaysScroll: true,
    style: {
      fg: 'black',
      bg: 'black',
      border: {
        fg: '#f0f0f0'
      },
      scrollbar: {
        bg: '#ccc',
        fg: 'blue'
      }
    }
  })

  screen.append(box)
  screen.key(['escape', 'q', 'C-c'], (ch, key) => {
    return process.exit(0)
  })

  box.focus()

  screen.render()
}).catch(e => {
  leave(e.stack)
})

#!/usr/bin/env node
'use strict'

const co = require('co')
const fetch = require('node-fetch')
const minimist = require('minimist')
const toArray = require('object2array')
const isTaken = require('is-taken')
const Spin = require('io-spin')
const update = require('update-notifier')
const pkg = require('./package')
require('colorful').toxic()

const argv = minimist(process.argv.slice(2), {
	alias: {
		h: 'help',
		v: 'version',
		r: 'registry',
		c: 'cn'
	}
})

const spin = new Spin('Box1', 'Checking')

// update notify
update({pkg}).notify()

if (argv.help) {
	console.log(`
  Usage:

    decheck <moduleName> [version]

    -v/--version:    Print version
    -h/--help:       Print help
    -r/--registry:   Set custom npm registry
    -c/--cn:         Set npm registry to China mirror
	`)
	process.exit()
}

if (argv.version) {
	console.log(pkg.version)
	process.exit()
}

const moduleName = argv._[0]
const moduleVersion = argv._[1]

if (!moduleName) {
	console.log('Required a module name')
	process.exit(1)
}

let registry = argv.registry || 'https://registry.npmjs.org/'
if (argv.cn) {
	registry = 'https://registry.npm.taobao.org/'
}

co(function* () {
	spin.start()
	const pkg = yield fetch(`${registry}${moduleName}`).then(data => data.json())
	const version = moduleVersion || pkg['dist-tags']['latest']
	let deps = pkg.versions[version].dependencies

	if (!deps) {
		spin.stop()
		console.log('Sorry, but this package depends on nothing.')
		process.exit()
	}
	deps = toArray(deps)

	const depsData = yield deps.map(dep => {
		return isTaken(dep.key, {registry, timeout: 10000}).then(data => data.versions[data['dist-tags'].latest])
	})
	spin.stop()
	console.log(depsData.map(dep => {
		return `
  ${dep.name.bold} ${'v'.gray}${dep.version.gray}
  ${dep.description.cyan}
  ${`https://npmjs.org/package/${dep.name}`.gray}
	`
	}).join(''))
}).catch(e => console.log(e.stack))

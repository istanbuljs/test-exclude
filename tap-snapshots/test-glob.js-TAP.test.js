/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/glob.js TAP allows negated exclude patterns > must match snapshot 1`] = `
Array [
  "file1.js",
]
`

exports[`test/glob.js TAP allows negated include patterns > must match snapshot 1`] = `
Array [
  "file1.js",
]
`

exports[`test/glob.js TAP allows node_modules folder to be included, if !node_modules is explicitly provided > must match snapshot 1`] = `
Array [
  "file1.js",
  "file2.js",
  "node_modules/something/index.js",
  "node_modules/something/other.js",
]
`

exports[`test/glob.js TAP allows specific node_modules folder to be included, if !node_modules is explicitly provided > must match snapshot 1`] = `
Array [
  "file1.js",
  "file2.js",
  "node_modules/something/other.js",
]
`

exports[`test/glob.js TAP applies exclude rule ahead of include rule > must match snapshot 1`] = `
Array [
  "file2.js",
]
`

exports[`test/glob.js TAP handles case insensitive matches on windows > must match snapshot 1`] = `
Array [
  "file1.js",
  "file2.js",
]
`

exports[`test/glob.js TAP should exclude the node_modules folder by default > absolute constructor cwd 1`] = `
Array [
  "file1.js",
  "file2.js",
]
`

exports[`test/glob.js TAP should exclude the node_modules folder by default > js and json files 1`] = `
Array [
  "file1.js",
  "file2.js",
  "package.json",
]
`

exports[`test/glob.js TAP should exclude the node_modules folder by default > js files 1`] = `
Array [
  "file1.js",
  "file2.js",
]
`

exports[`test/glob.js TAP should exclude the node_modules folder by default > json files 1`] = `
Array [
  "package.json",
]
`

exports[`test/glob.js TAP should exclude the node_modules folder by default > no extension 1`] = `
Array [
  ".nycrc",
  "file1.js",
  "file2.js",
  "package.json",
]
`

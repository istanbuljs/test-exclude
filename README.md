# test-exclude

The file include/exclude logic used by [nyc](https://github.com/istanbuljs/nyc).

[![Build Status](https://travis-ci.org/istanbuljs/test-exclude.svg)](https://travis-ci.org/istanbuljs/test-exclude)
[![Coverage Status](https://coveralls.io/repos/github/istanbuljs/test-exclude/badge.svg?branch=master)](https://coveralls.io/github/istanbuljs/test-exclude?branch=master)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![Greenkeeper badge](https://badges.greenkeeper.io/istanbuljs/test-exclude.svg)](https://greenkeeper.io/)

## Usage

```js
const exclude = require('test-exclude');
if (exclude().shouldInstrument('./foo.js')) {
    // let's instrument this file for test coverage!
}
```

## Including node_modules folder

by default the `node_modules` folder is added to all groups of
exclude rules. In the rare case that you wish to instrument files
stored in `node_modules`, a negative glob can be used:

```js
const exclude = require('test-exclude');
const e = exclude({
    exclude: ['!**/node_modules/**']
});
```

## `test-exclude` for enterprise

Available as part of the Tidelift Subscription.

The maintainers of `test-exclude` and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-test-exclude?utm_source=npm-test-exclude&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

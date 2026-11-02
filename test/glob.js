'use strict';
const path = require('path');
const t = require('tap');
const { deepEqual } = require('assert');

const TestExclude = require('../');

async function testHelper(t, { options, args = [], label }) {
    const e = new TestExclude(options);
    const sync = e.globSync(...args).sort();
    const pr = (await e.glob(...args)).sort();

    deepEqual(sync, pr, 'glob and globSync should find the same files');
    t.matchSnapshot(sync, label);
}

const cwd = path.resolve(__dirname, 'fixtures/glob');
const extension = '.js';
const options = { cwd, extension };

t.test('glob and globSync preserve include, exclude and negated patterns', async t => {
    const cwd = t.testdir({
        src: {
            'index.js': '',
            'index.test.js': '',
            '.hidden.ts': '',
            ignored: { 'keep.ts': '', 'omit.js': '' }
        },
        other: { 'outside.js': '' }
    });
    const exclude = new TestExclude({
        cwd,
        extension: ['.js', '.ts'],
        include: ['src/**/*.{js,ts}'],
        exclude: ['**/*.test.js', 'src/ignored/**', '!src/ignored/keep.ts']
    });
    const expected = ['src/.hidden.ts', 'src/ignored/keep.ts', 'src/index.js'];

    t.same(exclude.globSync().sort(), expected);
    t.same((await exclude.glob()).sort(), expected);
    for (const file of expected) {
        t.equal(exclude.shouldInstrument(path.join(cwd, file)), true, file);
    }
    for (const file of ['src/index.test.js', 'src/ignored/omit.js', 'other/outside.js']) {
        t.equal(exclude.shouldInstrument(path.join(cwd, file)), false, file);
    }
});

t.test('should exclude the node_modules folder by default', async t =>
    Promise.all(
        [
            { options, label: 'js files' },
            {
                options: { cwd, extension: ['.json'] },
                label: 'json files'
            },
            {
                options: { cwd, extension: [] },
                label: 'no extension'
            },
            {
                options: { cwd, extension: ['.js', '.json'] },
                label: 'js and json files'
            },
            {
                options: { cwd: path.join(process.cwd(), 'test') },
                args: [cwd],
                label: 'absolute constructor cwd'
            }
        ].map(opts => testHelper(t, opts))
    )
);

t.test('applies exclude rule ahead of include rule', t =>
    testHelper(t, {
        options: {
            cwd,
            extension,
            include: ['file1.js', 'file2.js'],
            exclude: ['file1.js']
        }
    })
);

t.test(
    'allows node_modules folder to be included, if !node_modules is explicitly provided',
    t =>
        testHelper(t, {
            options: {
                cwd,
                extension,
                exclude: ['!node_modules']
            }
        })
);

t.test(
    'allows specific node_modules folder to be included, if !node_modules is explicitly provided',
    t =>
        testHelper(t, {
            options: {
                cwd,
                extension,
                exclude: ['!node_modules/something/other.js']
            }
        })
);

t.test('allows negated exclude patterns', t =>
    testHelper(t, {
        options: {
            cwd,
            extension,
            exclude: ['*.js', '!file1.js']
        }
    })
);

t.test('allows negated include patterns', t =>
    testHelper(t, {
        options: {
            cwd,
            include: ['*.js', '!file2.js']
        }
    })
);

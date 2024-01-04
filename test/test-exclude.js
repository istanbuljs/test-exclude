'use strict';
const path = require('path');
const t = require('tap');

const TestExclude = require('../');

async function testHelper(t, { options, no = [], yes = [] }) {
    const e = new TestExclude(options);

    no.forEach(file => {
        t.notOk(e.shouldInstrument(file));
    });

    yes.forEach(file => {
        t.ok(e.shouldInstrument(file));
    });
}

t.test('should exclude the node_modules folder by default', t =>
    testHelper(t, {
        no: ['./banana/node_modules/cat.js', 'node_modules/cat.js']
    })
);

t.test('ignores ./', t =>
    testHelper(t, {
        no: [
            './test.js',
            './test.cjs',
            './test.mjs',
            './test.ts',
            './foo.test.js',
            './foo.test.cjs',
            './foo.test.mjs',
            './foo.test.ts'
        ]
    })
);

t.test('ignores ./test and ./tests', t =>
    testHelper(t, {
        no: ['./test/index.js', './tests/index.js']
    })
);

t.test('matches files in root with **/', t =>
    testHelper(t, {
        no: ['__tests__/**']
    })
);

t.test('does not instrument files outside cwd', t =>
    testHelper(t, {
        options: {
            include: ['../foo.js']
        },
        no: ['../foo.js']
    })
);

if (process.platform === 'win32') {
    t.test('does not instrument files on different drive (win32)', t =>
        testHelper(t, {
            options: {
                cwd: 'C:\\project'
            },
            no: ['D:\\project\\foo.js']
        })
    );
}

t.test('can instrument files outside cwd if relativePath=false', t =>
    testHelper(t, {
        options: {
            include: ['../foo.js'],
            relativePath: false
        },
        yes: ['../foo.js']
    })
);

t.test('does not instrument files in the coverage folder by default', t =>
    testHelper(t, {
        no: ['coverage/foo.js']
    })
);

t.test('applies exclude rule ahead of include rule', t =>
    testHelper(t, {
        options: {
            include: ['test.js', 'foo.js'],
            exclude: ['test.js']
        },
        no: ['test.js', 'banana.js'],
        yes: ['foo.js']
    })
);

t.test('should handle gitignore-style excludes', t =>
    testHelper(t, {
        options: {
            exclude: ['dist']
        },
        no: ['dist/foo.js', 'dist/foo/bar.js'],
        yes: ['src/foo.js']
    })
);

t.test('should handle gitignore-style includes', t =>
    testHelper(t, {
        options: {
            include: ['src']
        },
        no: ['src/foo.test.js'],
        yes: ['src/foo.js', 'src/foo/bar.js']
    })
);

t.test("handles folder '.' in path", t =>
    testHelper(t, {
        no: ['test/fixtures/basic/.next/dist/pages/async-props.js']
    })
);

t.test(
    'excludes node_modules folder, even when empty exclude group is provided',
    t =>
        testHelper(t, {
            options: {
                exclude: []
            },
            no: [
                './banana/node_modules/cat.js',
                'node_modules/some/module/to/cover.js'
            ],
            yes: ['__tests__/a-test.js', 'src/a.test.js', 'src/foo.js']
        })
);

t.test(
    'allows node_modules folder to be included, if !node_modules is explicitly provided',
    t =>
        testHelper(t, {
            options: {
                exclude: ['!**/node_modules/**']
            },
            yes: [
                './banana/node_modules/cat.js',
                'node_modules/some/module/to/cover.js',
                '__tests__/a-test.js',
                'src/a.test.js',
                'src/foo.js'
            ]
        })
);

t.test(
    'allows specific node_modules folder to be included, if !node_modules is explicitly provided',
    t =>
        testHelper(t, {
            options: {
                exclude: ['!**/node_modules/some/module/to/cover.js']
            },
            no: ['./banana/node_modules/cat.js'],
            yes: [
                'node_modules/some/module/to/cover.js',
                '__tests__/a-test.js',
                'src/a.test.js',
                'src/foo.js'
            ]
        })
);

t.test(
    'allows node_modules default exclusion glob to be turned off, if excludeNodeModules === false',
    t =>
        testHelper(t, {
            options: {
                excludeNodeModules: false,
                exclude: ['node_modules/**', '**/__test__/**']
            },
            no: [
                'node_modules/cat.js',
                './banana/node_modules/__test__/cat.test.js',
                './banana/node_modules/__test__/cat.js'
            ],
            yes: ['./banana/node_modules/cat.js']
        })
);

t.test('allows negated exclude patterns', t =>
    testHelper(t, {
        options: {
            exclude: ['foo/**', '!foo/bar.js']
        },
        no: ['./foo/fizz.js'],
        yes: ['./foo/bar.js']
    })
);

t.test('allows negated include patterns', t =>
    testHelper(t, {
        options: {
            include: ['batman/**', '!batman/robin.js']
        },
        no: ['./batman/robin.js'],
        yes: ['./batman/joker.js']
    })
);

t.test(
    'negated exclude patterns only works for files that are covered by the `include` pattern',
    t =>
        testHelper(t, {
            options: {
                include: ['index.js'],
                exclude: ['!index2.js']
            },
            no: ['index2.js'],
            yes: ['index.js']
        })
);

t.test('no extension option', t =>
    testHelper(t, {
        options: {
            extension: []
        },
        yes: ['file.js', 'package.json']
    })
);

t.test('handles extension option string', t =>
    testHelper(t, {
        options: {
            extension: '.js'
        },
        no: ['package.json'],
        yes: ['file.js']
    })
);

t.test('handles extension option array', t =>
    testHelper(t, {
        options: {
            extension: ['.js', '.json']
        },
        no: ['file.ts'],
        yes: ['file.js', 'package.json']
    })
);

t.test(
    'negated exclude patterns unrelated to node_modules do not affect default node_modules exclude behavior',
    t =>
        testHelper(t, {
            options: {
                exclude: ['!foo/**']
            },
            no: ['node_modules/cat.js']
        })
);

// see: https://github.com/istanbuljs/babel-plugin-istanbul/issues/71
t.test('allows exclude/include rule to be a string', t =>
    testHelper(t, {
        options: {
            exclude: 'src/**/*.spec.js',
            include: 'src/**'
        },
        no: ['src/batman/robin/foo.spec.js'],
        yes: ['src/batman/robin/foo.js']
    })
);

t.test('tolerates undefined exclude/include', t =>
    testHelper(t, {
        options: {
            exclude: undefined,
            include: undefined
        },
        no: ['test.js'],
        yes: ['index.js']
    })
);

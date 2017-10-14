module.exports = function (grunt) {
    'use strict';

    var copy      = grunt.config('copy') || {};
    var ext;
    var itemRuntime;
    var libs      = grunt.option('mainlibs');
    var out       = 'output';
    var paths;
    var requirejs = grunt.config('requirejs') || {};
    var root      = grunt.option('root');
    var taoItems;
    var taoTests;
    var testPlugins;
    var testRuntime;

    ext   = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    paths = {
        qtiCustomInteractionContext: root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
        qtiInfoControlContext:       root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext',
        taoItems:                    root + '/taoItems/views/js',
        taoItemsCss:                 root + '/taoItems/views/css',
        taoQtiItem:                  root + '/taoQtiItem/views/js',
        taoQtiItemCss:               root + '/taoQtiItem/views/css',
        taoQtiTest:                  root + '/taoQtiTest/views/js',
        taoQtiTestCss:               root + '/taoQtiTest/views/css',
        taoTests:                    root + '/taoTests/views/js',
        taoTestsCss:                 root + '/taoTests/views/css',
    };

    itemRuntime = ext.getExtensionSources('taoQtiItem', ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js',  'views/js/qtiCommonRenderer/helpers/**/*.js'], true);
    taoItems    = ext.getExtensionSources('taoItems', ['views/js/**/*.js']);
    taoTests    = ext.getExtensionSources('taoTests', ['views/js/**/*.js']);
    testPlugins = ext.getExtensionSources('taoQtiTest', ['views/js/runner/plugins/**/*.js'], true);
    testRuntime = ext.getExtensionSources('taoQtiTest', ['views/js/runner/**/*.js'], true);

    /**
     * Compile into a bundle
     */
    requirejs.taoqtitest_bundle = {
        options: {
            exclude: ['mathJax','taoQtiTest/controller/runner/runner'].concat(libs),
            include: ext.getExtensionsControllers(['taoQtiTest']),
            out: out + '/taoQtiTest/controllers.min.js',
            paths: paths,
        }
    };

    requirejs.taoqtitest_runner_bundle = {
        options: {
            exclude: ['json!i18ntr/messages.json', 'mathJax'].concat(libs).concat(itemRuntime).concat(taoItems).concat(taoTests),
            excludeShallow: testPlugins,
            include: ['lib/require', 'loader/bootstrap', 'taoQtiTest/controller/runner/runner'].concat(testRuntime),
            out: out + '/taoQtiTest/qtiTestRunner.min.js',
            paths: paths,
        }
    };

    requirejs.taoqtitest_plugins_bundle = {
        options: {
            exclude: ['json!i18ntr/messages.json', 'mathJax'].concat(libs).concat(['taoTests/runner/plugin']),
            include: testPlugins,
            out: out + '/taoQtiTest/testPlugins.min.js',
            paths: paths,
        }
    };

    /**
     * Copy bundles to /dist
     */
    copy.taoqtitest_bundle = {
        files: [
            { src: [out + '/taoQtiTest/controllers.min.js'],       dest: root + '/taoQtiTest/views/dist/controllers.min.js' },
            { src: [out + '/taoQtiTest/controllers.min.js.map'],   dest: root + '/taoQtiTest/views/dist/controllers.min.js.map' },
            { src: [out + '/taoQtiTest/qtiTestRunner.min.js'],     dest: root + '/taoQtiTest/views/dist/qtiTestRunner.min.js' },
            { src: [out + '/taoQtiTest/qtiTestRunner.min.js.map'], dest: root + '/taoQtiTest/views/dist/qtiTestRunner.min.js.map' },
            { src: [out + '/taoQtiTest/testPlugins.min.js'],       dest: root + '/taoQtiTest/views/dist/testPlugins.min.js' },
            { src: [out + '/taoQtiTest/testPlugins.min.js.map'],   dest: root + '/taoQtiTest/views/dist/testPlugins.min.js.map' }
        ]
    };

    grunt.config('requirejs', requirejs);
    grunt.config('copy', copy);

    // bundle task
    grunt.registerTask('taoqtitestbundle', [
        'clean:bundle',
        'requirejs:taoqtitest_bundle',
        'requirejs:taoqtitest_runner_bundle',
        'requirejs:taoqtitest_plugins_bundle',
        'copy:taoqtitest_bundle'
    ]);
};

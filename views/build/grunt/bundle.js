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
    var testPlugins;
    var testRuntime;

    ext   = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    paths = {
        taoTests:                    root + '/taoTests/views/js',
        taoQtiTest:                  root + '/taoQtiTest/views/js',
        taoQtiTestCss:               root + '/taoQtiTest/views/css',
        taoQtiItem:                  root + '/taoQtiItem/views/js',
        taoQtiItemCss:               root + '/taoQtiItem/views/css',
        taoItems:                    root + '/taoItems/views/js',
        qtiCustomInteractionContext: root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
        qtiInfoControlContext:       root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext',
    };

    itemRuntime = ext.getExtensionSources('taoQtiItem', ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js',  'views/js/qtiCommonRenderer/helpers/**/*.js'], true);
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
            exclude: ['json!i18ntr/messages.json'],
            excludeShallow: ['mathJax', 'ckeditor'].concat(testPlugins),
            include: ['lib/require', 'loader/bootstrap', 'taoQtiTest/controller/runner/runner'].concat(testRuntime).concat(itemRuntime),
            out: out + '/taoQtiTest/qtiTestRunner.min.js',
            paths: paths,
        }
    };

    requirejs.taoqtitest_plugins_bundle = {
        options: {
            exclude: ['json!i18ntr/messages.json'].concat(libs),
            excludeShallow: ['mathJax'],
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
            { src: [out + '/taoQtiTest/controller/routes.js'],     dest: root + '/taoQtiTest/views/dist/controllers.min.js' },
            { src: [out + '/taoQtiTest/controller/routes.js.map'], dest: root + '/taoQtiTest/views/dist/controllers.min.js.map' },
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

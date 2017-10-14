module.exports = function (grunt) {
    'use strict';

    var ext;
    var itemRuntime;
    var libs = grunt.option('mainlibs');
    var out  = 'output';
    var paths;
    var root = grunt.option('root');
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

    grunt.config.merge({

        /**
         * Compile into a bundle
         */
        requirejs : {
            taoqtitestbundle : {
                options: {
                    paths : paths,
                    dir : out,
                    modules : [{
                        name: 'taoQtiTest/controller/routes',
                        include : ext.getExtensionsControllers(['taoQtiTest']),
                        exclude : ['mathJax','taoQtiTest/controller/runner/runner'].concat(libs)
                    }]
                }
            },
            qtitestrunner : {
                options: {
                    paths : paths,
                    include: ['lib/require', 'loader/bootstrap'].concat(testRuntime).concat(itemRuntime),
                    excludeShallow : ['mathJax', 'ckeditor'].concat(testPlugins),
                    exclude : ['json!i18ntr/messages.json'],
                    name: "taoQtiTest/controller/runner/runner",
                    out: out + "/qtiTestRunner.min.js"
                }
            },
            taoqtitestplugins : {
                options: {
                    paths : paths,
                    include: testPlugins,
                    excludeShallow : ['mathJax'],
                    exclude : ['json!i18ntr/messages.json'].concat(libs),
                    out: out + "/testPlugins.min.js"
                }
            }
        },

        /**
         * Copy bundles to /dist
         */
        copy : {
            taoqtitestbundle : {
                files: [
                    { src: [out + '/taoQtiTest/controller/routes.js'],  dest: root + '/taoQtiTest/views/js/controllers.min.js' },
                    { src: [out + '/taoQtiTest/controller/routes.js.map'],  dest: root + '/taoQtiTest/views/js/controllers.min.js.map' },
                    { src: [out + '/qtiTestRunner.min.js'],  dest: root + '/taoQtiTest/views/js/loader/qtiTestRunner.min.js' },
                    { src: [out + '/qtiTestRunner.min.js.map'],  dest: root + '/taoQtiTest/views/js/loader/qtiTestRunner.min.js.map' },
                    { src: [out + '/testPlugins.min.js'],  dest: root + '/taoQtiTest/views/js/loader/testPlugins.min.js' },
                    { src: [out + '/testPlugins.min.js.map'],  dest: root + '/taoQtiTest/views/js/loader/testPlugins.min.js.map' }
                ]
            }
        }
    });

    // bundle task
    grunt.registerTask('taoqtitestbundle', [
        'clean:bundle',
        'requirejs:taoqtitestbundle',
        'requirejs:qtitestrunner',
        'requirejs:taoqtitestplugins',
        'copy:taoqtitestbundle'
    ]);
};

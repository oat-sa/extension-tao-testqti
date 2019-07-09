module.exports = function(grunt) {
    'use strict';

    var root    = grunt.option('root') + '/taoQtiTest/views/';
    var pluginDir = root + 'js/runner/plugins/';

    grunt.config.merge({
        sass : {
            options: {
                includePaths : [ root + 'node_modules/@oat-sa/tao-test-runner-qti/scss' ]
            },
            taoqtitest: {
                files : [
                    { dest : root + 'css/creator.css', src : root + 'scss/creator.scss' },
                    { dest : root + 'css/test-runner.css', src : root + 'scss/test-runner.scss' },
                    { dest : root + 'css/new-test-runner.css', src : root + 'node_modules/@oat-sa/tao-test-runner-qti/scss/new-test-runner.css'},
                    { dest : pluginDir + 'controls/timer/component/css/countdown.css', src : pluginDir + 'controls/timer/component/scss/countdown.scss'},
                    { dest : pluginDir + 'controls/timer/component/css/timerbox.css', src : pluginDir + 'controls/timer/component/scss/timerbox.scss'}
                ]
            },
        },
        watch : {
            taoqtitestsass : {
                files : [root + 'scss/**/*.scss', pluginDir + '**/*.scss'],
                tasks : ['sass:taoqtitest'],
                options : {
                    debounceDelay : 1000
                }
            }
        },
        notify : {
            taoqtitestsass : {
                options: {
                    title: 'Grunt SASS',
                    message: 'SASS files compiled to CSS'
                }
            }
        }
    });

    //register an alias for main build
    grunt.registerTask('taoqtitestsass', ['sass:taoqtitest']);
};

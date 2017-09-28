module.exports = function(grunt) {
    'use strict';

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/taoQtiTest/views/';

    sass.taoqtitest = { };
    sass.taoqtitest.files = { };
    sass.taoqtitest.files[root + 'css/creator.css'] = root + 'scss/creator.scss';
    sass.taoqtitest.files[root + 'css/test-runner.css'] = root + 'scss/test-runner.scss';
    sass.taoqtitest.files[root + 'css/new-test-runner.css'] = root + 'scss/new-test-runner.scss';
    sass.taoqtitest.files[root + 'css/plugins/key-navigation.css'] = root + 'scss/plugins/key-navigation.scss';

    sass.taoqtitestplugins = {};
    sass.taoqtitestplugins.files = {};
    sass.taoqtitestplugins.files[root + 'js/runner/plugins/tools/textToSpeech/textToSpeech.css'] = root + 'js/runner/plugins/tools/textToSpeech/textToSpeech.scss';

    watch.taoqtitestsass = {
        files : [root + 'scss/**/*.scss'],
        tasks : ['sass:taoqtitest', 'notify:taoqtitestsass'],
        options : {
            debounceDelay : 1000
        }
    };

    watch.taoqtitestpluginssass = {
        files: [root + 'js/runner/plugins/tools/textToSpeech/textToSpeech.scss'],
        tasks: ['sass:taoqtitestplugins', 'notify:taoqtitestsass'],
        options: {
            debounceDelay: 1000
        }
    };

    notify.taoqtitestsass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    //register an alias for main build
    grunt.registerTask('taoqtitestsass', ['sass:taoqtitest', 'sass:taoqtitestplugins']);
};

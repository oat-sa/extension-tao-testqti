/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA;
 */

const path = require('path');

/**
 * configure the extension sass compilation
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 * @param {Object} grunt - the grunt object (by convention)
 */
module.exports = function(grunt) {
    'use strict';

    const sassConfig = grunt.config('sass') || {};
    const root       = path.join(grunt.option('root'), '/taoQtiTest/views/');
    const runnerScssPath = path.join(root, 'node_modules/@oat-sa/tao-test-runner-qti/scss');

    grunt.config.merge({
        sass : {
            taoqtitest: {
                options: {
                    includePaths : [
                        ...sassConfig.options.includePaths,
                        runnerScssPath
                    ]
                },
                files : [
                    {
                        dest : path.join(root, 'css/creator.css'),
                        src : path.join(root, 'scss/creator.scss')
                    }, {
                        dest : path.join(root, 'css/test-runner.css'),
                        src : path.join(root, 'scss/test-runner.scss')
                    }, {
                        dest : path.join(root, 'css/new-test-runner.css'),
                        src : path.join(runnerScssPath, 'new-test-runner.scss')
                    },{
                        dest : path.join(root, 'css/xml-editor.css'),
                        src : path.join(root, 'scss/xml-editor.scss')
                    },
                ]
            },
        },
        watch : {
            taoqtitestsass : {
                files : [path.join(root, 'scss/**/*.scss')],
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

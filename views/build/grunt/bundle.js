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
 * Copyright (c) 2014-2020 (original work) Open Assessment Technologies SA;
 */

/**
 * configure the extension bundles
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 * @param {Object} grunt - the grunt object (by convention)
 */
module.exports = function(grunt) {
    'use strict';

    grunt.config.merge({
        bundle : {
            taoqtitest : {
                options : {
                    extension : 'taoQtiTest',
                    outputDir : 'loader',
                    paths: require('./paths.json'),
                    dependencies : ['taoItems', 'taoQtiItem', 'taoTests'],
                    packages: [
                        {
                            name: 'codemirror',
                            location: '../../../tao/views/node_modules/codemirror',
                            main: 'lib/codemirror'
                        }
                    ],
                    bundles : [{
                        name : 'taoQtiTest',
                        default : true,
                        babel : true,
                        excludeNested: ['taoQtiTest/controller/content/edit']
                    }, {
                        name : 'taoQtiTestRunner',
                        entryPoint : 'taoQtiTest/controller/runner/runner',
                        bootstrap : true,
                        babel : true,
                        include : [
                            //everything in the runner folder but plugins
                            'taoQtiTest/runner/{config,helpers,navigator,provider,proxy,ui}/**/*'
                        ],
                        dependencies : [
                            'taoItems/loader/taoItemsRunner.min',
                            'taoTests/loader/taoTestsRunner.min',
                            'taoQtiItem/loader/taoQtiItemRunner.min'
                        ]
                    }, {
                        name : 'testPlugins',
                        babel : true,
                        include : [
                            //everything in runner/plugins
                            'taoQtiTest/runner/plugins/**/*'
                        ],
                        dependencies : []
                    }, {
                        name: 'taoQtiTestXMLEditor',
                        entryPoint: 'taoQtiTest/controller/content/edit',
                        babel: true
                    }
                ]}
            }
        }
    });

    // bundle task
    grunt.registerTask('taoqtitestbundle', ['bundle:taoqtitest']);
};

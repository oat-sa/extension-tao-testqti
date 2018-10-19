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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
/**
 * Test Runner Content Plugin: Focus the first element if possible
 *
 * @author Dieter Raber <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoTests/runner/plugin',
    'ckeditor'
], function ($, _, pluginFactory, ckEditor) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'focusOnFirstField',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            this.getTestRunner()
                .after('renderitem', function() {
                    //We focus first interaction in itemBody
                    var $input = self.getAreaBroker().getContentArea().find('.qti-itemBody')
                        //.find('.qti-simpleChoice,.qti-choice.qti-gap,textarea,li.qti-choice,.qti-choice.qti-hottext,input[type=file],input[type=text],td label input[type=checkbox],.noUi-handle,div.target')
                        //.not(':input[type=button], :input[type=submit], :input[type=reset]')
                        .first();

                    var $cke = $input.closest('.qti-interaction').find('.cke');

                    if($cke.length) {
                        _.delay(function() {
                            ckEditor.instances[$cke.attr('id').replace(/^cke_/, '')].focus();
                        }, 100);
                    } else {
                        $input.focus();

                        //We add extra listener for focused field to highlight whole interaction. As for we cannot
                        //identify KeyNavigation from here, we add separate listener for focus and blur
                        $input.on('blur', function (){
                            $input.parents('[class^="col-"]').removeClass('focusin');
                        });
                        $input.parents('[class^="col-"]').addClass('focusin');
                    }
                });
        }
    });
});

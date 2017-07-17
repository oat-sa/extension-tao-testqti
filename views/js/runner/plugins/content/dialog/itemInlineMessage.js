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
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

/**
 * Create form with message in test runner and replace all control buttons on his personal
 */

define([
    'jquery',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function($, __, hider, pluginFactory, buttonTpl) {
    'use strict';

    /**
     * The display of the next button
     */
    var buttonData = {
        next : {
            control : 'move-forward',
            title   : __('Submit and go to the next item'),
            icon    : 'forward',
            text    : __('OK')
        },
        end : {
            control : 'move-end',
            title   : __('Submit and go to the end of the test'),
            icon    : 'fast-forward',
            text    : __('OK & End test')
        }
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'itemInlineMessage',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            /**
             * Create the button based on the current context
             * @returns {*|jQuery|HTMLElement} the button
             */
            var createOkButton = function createElement(){
                var dataType = !!testRunner.getTestContext().isLast ? 'end' : 'next';
                var $btn = $(buttonTpl(buttonData[dataType]));
                $btn.addClass('modalFeedback-button');

                //plugin behavior
                $btn.on('click', function(e){
                    e.preventDefault();

                    self.disable();
                    if($(this).data('control') === 'move-end'){
                        self.trigger('end');
                    }

                    $btn.remove();
                    self.$element.remove();

                    self.trigger('resume', self);
                });

                return $btn;
            };

            this.$button = createOkButton();
            this.$element = $(this.getContent().dom);
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var $navigationContainer = this.getAreaBroker().getNavigationArea();
            var testRunner = this.getTestRunner();
            var itemRunner = testRunner.itemRunner;
            var $inlineContainer = this.getContent().$container;
            if (!$inlineContainer && itemRunner._item.container) {
                $inlineContainer = $('.qti-itemBody', itemRunner._item.container);
            }

            $inlineContainer.append(this.$element);

            // hide all navigation buttons, create new instead of
            if (!$('.modalFeedback-button', $navigationContainer).length){
                $navigationContainer.append(this.$button);
            }
        },

        /**
         * Enable the button
         */
        enable : function enable (){
            this.$button.removeProp('disabled')
                .removeClass('disabled');
        },

        disable: function disable (){
            this.$button.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            this.$button.click();
        }
    });
});

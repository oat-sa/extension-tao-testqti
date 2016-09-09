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
 * Create dialog form with message, with overlapped content
 */
define([
    'jquery',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin'
], function($, __, hider, pluginFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'itemAlertMessage',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            this.$element = $(this.getContent().dom);

            this.$element
                // for GUI actions
                .on('closed.modal', function(){
                    $(this).modal('destroy');
                })
                .on('destroyed.modal', function(){
                    self.$element = null;
                    self.trigger('resume', self);
                });
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var testRunner = this.getTestRunner();
            var itemRunner = testRunner.itemRunner;
            var $modalsContainer = this.getContent().$container;
            if (!$modalsContainer) {
                $modalsContainer = $('#modalFeedbacks', itemRunner._item.container);
            }
            $modalsContainer.append(this.$element);

            this.$element.modal();
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            if (this.$element && this.$element.length){
                this.$element.modal('close');
            }
        }
    });
});

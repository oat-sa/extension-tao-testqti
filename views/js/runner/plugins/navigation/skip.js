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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Navigation Plugin : Skip
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/navigation/button'
], function ($, __, pluginFactory, buttonTpl){
    'use strict';

    var buttonData = {
        skip : {
            control : 'skip',
            title   : __('Skip  and go to the next item'),
            icon    : 'external',
            text    : __('Skip')
        },
        end : {
            control : 'skip-end',
            title   : __('Skip and go to the end of the test'),
            icon    : 'external',
            text    : __('Skip and end test')
        }
    };

    var createElement = function createElement(context){
        var dataType = context.isLast ? 'end' : 'skip';
        return $(buttonTpl(buttonData[dataType]));
    };

    var updateElement = function updateElement($element, context){
        var dataType = context.isLast ? 'end' : 'skip';
        if($element.data('control') !== buttonData[dataType].control){

            $element.data('control', buttonData[dataType].control)
                    .attr('title', buttonData[dataType].title)
                    .find('.text').text(buttonData[dataType].title);
        }
    };

    return pluginFactory({
        name : 'skip',
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            var toggle = function toggle(){
                var context = testRunner.getTestContext();
                if(context.allowSkipping === true){
                    self.show();
                    return true;
                }

                self.hide();
                return false;
            };

            this.$element = createElement(testRunner.getTestContext());

            this.$element.on('click', function(e){
                e.preventDefault();

                if(self.getState('enabled') !== false){
                    self.disable();

                    testRunner.skip();
                }
            });

            toggle();

            testRunner
                .on('ready', function(){
                    self.enable();
                })
                .after('move', function(){
                    if(toggle()){
                        updateElement(self.$element, testRunner.getTestContext());
                    }
                });
        },
        render : function render(){
            var $container = this.getAreaBroker().getNavigationArea();
            $container.append(this.$element);
        },
        destroy : function destroy (){
            this.$element.remove();
        },
        enable : function enable (){
            this.$element.removeProp('disabled');
        },
        disable : function disable (){
            this.$element.prop('disabled', true);
        },
        show: function show(){
            this.$element.show();
        },
        hide: function hide(){
            this.$element.hide();
        },
    });
});

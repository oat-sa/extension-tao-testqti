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
 * Test Runner Navigation Plugin : Next
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
        next : {
            control : 'move-forward',
            title   : __('Submit and go to the next item'),
            icon    : 'forward',
            text    : __('Next')
        },
        end : {
            control : 'move-end',
            title   : __('Submit and go to the end of the test'),
            icon    : 'fast-forward',
            text    : __('End test')
        }
    };

    var createElement = function createElement(context){
        var dataType = !!context.isLast ? 'end' : 'next';
        return $(buttonTpl(buttonData[dataType]));
    };

    var updateElement = function updateElement($element, context){
        var dataType = !!context.isLast ? 'end' : 'next';
        if($element.data('control') !== buttonData[dataType].control){

            $element.data('control', buttonData[dataType].control)
                    .attr('title', buttonData[dataType].title)
                    .find('.text').text(buttonData[dataType].title);

            if(dataType === 'next'){
                $element.find('.icon-' + buttonData.end.icon)
                        .removeClass('icon-' + buttonData.end.icon)
                        .addClass('icon-' + buttonData.next.icon);
            } else {
                $element.find('.icon-' + buttonData.next.icon)
                        .removeClass('icon-' + buttonData.next.icon)
                        .addClass('icon-' + buttonData.end.icon);
            }
        }
    };

    return pluginFactory({
        name : 'next',
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            this.$element = createElement(testRunner.getTestContext());

            this.$element.on('click', function(e){
                e.preventDefault();

                if(self.getState('enabled') !== false){
                    self.disable();

                    if(testRunner.getTestContext().isLast){
                        testRunner.finish();
                    } else {
                        testRunner.next();
                    }
                }
            });

            testRunner
                .on('ready', function(){
                    self.enable();
                })
                .after('move', function(){
                    updateElement(self.$element, testRunner.getTestContext());
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
            this.$element.removeProp('disabled')
                         .removeClass('disabled');
        },
        disable : function disable (){
            this.$element.prop('disabled', true)
                         .addClass('disabled');
        },
        show: function show(){
            this.$element.show();
        },
        hide: function hide(){
            this.$element.hide();
        },
    });
});

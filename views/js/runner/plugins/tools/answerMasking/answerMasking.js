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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'core/statifier',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/answerMasking/tpl/mask'
], function(_, $, statifier, componentFactory, maskTpl) {
    'use strict';

    return function answerMaskingFactory($contentArea) {
        var answerMasking,
            allMasks = [],

            maskApi = {
                toggle: function toggle() {
                    if (this.is('masked')) {
                        return this.reveal();
                    } else {
                        return this.mask();
                    }
                },

                reveal: function reveal() {
                    var $container = this.getContainer();
                    $container.removeClass('masked');

                    this.setState('masked', false);

                    this.trigger('reveal');

                    return this;
                },

                mask: function hide() {
                    var $container = this.getContainer();
                    $container.addClass('masked');

                    this.setState('masked', true);

                    this.trigger('mask');

                    return this;
                }
            };

        function createMask($container) {
            return componentFactory(maskApi)
                .setTemplate(maskTpl)
                .on('render', function() {
                    var self = this,
                        $component = this.getElement();

                    $component.on('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        self.toggle();
                    });
                })
                .init()
                .render($container)
                .mask();
        }

        answerMasking = {
            enable: function enable() {
                var $choiceInteractions = $contentArea.find('.qti-choiceInteraction'),
                    $qtiChoices = $contentArea.find('.qti-choice');

                allMasks = [];

                $choiceInteractions.addClass('maskable');

                $qtiChoices.each(function () {
                    var $choice = $(this);
                    allMasks.push(createMask($choice));
                });

                this.setState('enabled', true);
            },

            disable: function disable() {
                var $choiceInteractions = $contentArea.find('.qti-choiceInteraction');
                $choiceInteractions.removeClass('maskable');

                allMasks.forEach(function(mask) {
                    mask.reveal(); // remove class on container
                    mask.destroy();
                });

                allMasks = [];

                this.setState('enabled', false);
            },

            getMasksState: function getMasksState() {
                var state = allMasks.map(function (mask) {
                    return mask.is('masked');
                });
                return state;
            },

            setMasksState: function setMasksState(state) {
                state.forEach(function (masked, index) {
                    var mask = allMasks[index];

                    if (_.isObject(mask) && _.isFunction(mask.reveal) && ! masked) {
                        mask.reveal();
                    }
                });
            }
        };

        statifier(answerMasking);

        return answerMasking;
    };
});
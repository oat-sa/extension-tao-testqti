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
    'jquery',
    'core/statifier',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/answerMasking/tpl/mask'
], function($, statifier, componentFactory, maskTpl) {
    'use strict';

    return function answerMaskingFactory($contentArea) {
        var answerMasking,
            allMasks = [],

            maskApi = {
                toggle: function toggle() {
                    if (this.is('masked')) {
                        this.reveal();
                    } else {
                        this.mask();
                    }
                },

                reveal: function reveal() {
                    var $container = this.getContainer();
                    $container.removeClass('masked');

                    this.setState('masked', false);

                    this.trigger('reveal');
                },

                mask: function hide() {
                    var $container = this.getContainer();
                    $container.addClass('masked');

                    this.setState('masked', true);

                    this.trigger('mask');
                }
            };

        function createMask($container) {
            var mask = componentFactory(maskApi)
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

            allMasks.push(mask);
        }

        answerMasking = {
            enable: function enable() {
                var $choiceInteractions = $contentArea.find('.qti-choiceInteraction'),
                    $qtiChoices = $contentArea.find('.qti-choice');

                $choiceInteractions.addClass('maskable');

                $qtiChoices.each(function () {
                    createMask($(this)); // todo: move in init
                });

                this.setState('enabled', true);
            },

            disable: function disable() {
                var $choiceInteractions = $contentArea.find('.qti-choiceInteraction');
                $choiceInteractions.removeClass('maskable');

                allMasks.forEach(function(mask) {
                    mask.destroy(); // todo: move in destroy
                });

                this.setState('enabled', false);
            }
        };

        statifier(answerMasking);

        return answerMasking;
    };
});
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
 * Test Runner Tool Plugin : Magnifier
 *
 * @author Dieter Raber <dieter@taotesting.com>
 */

define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/navigation/button-group',
    'css!lib/anythingZoomer2/css/anythingZoomer',
    'lib/anythingZoomer2/js/jquery.anythingzoomer'
], function ($, _, __, hider, pluginFactory, buttonGroupTpl){
    'use strict';


    var li = $('<div id="lipsum"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eget ullamcorper ipsum, in vehicula arcu. In sed viverra velit, et egestas dolor. Sed in sapien at metus fermentum dignissim a quis odio. Praesent quis cursus magna, id molestie nibh. Etiam at rutrum tellus, vel faucibus magna. Suspendisse potenti. <textarea name="ta">In efficitur ullamcorper elit, et ultrices massa volutpat eget. </textarea> lobortis hendrerit augue at auctor. Duis ornare, diam id eleifend efficitur, mi leo lacinia lectus, et viverra sapien nulla sed risus. Suspendisse interdum mi vitae nunc gravida, vitae convallis nibh luctus. Sed dapibus dolor in tristique molestie. Etiam vitae lacinia purus. Aliquam sit amet lacus sollicitudin, dignissim nisl id, egestas augue. Nunc semper arcu felis. <input type="text" value="Maecenas" name="in"> vitae eros mi. Aliquam nec pretium nunc, placerat pulvinar lorem.</p><p>Aliquam commodo ex eu massa tincidunt, a egestas massa vestibulum. Vestibulum commodo cursus metus eget posuere. Nam id imperdiet augue. Nunc pulvinar dignissim quam, vitae dapibus ipsum dignissim nec. Phasellus semper pulvinar arcu, a eleifend ipsum eleifend a. Nullam lorem neque, tristique et sollicitudin ut, fermentum in dui. Phasellus placerat eleifend augue sit amet suscipit. Suspendisse varius sollicitudin ligula, sed cursus turpis tristique a. Sed tempus ex a viverra condimentum. Aenean eleifend maximus nunc sed facilisis. Suspendisse placerat augue bibendum, ornare purus hendrerit, vulputate elit.</p><p>Phasellus tempor arcu a odio imperdiet imperdiet. Fusce porttitor neque eu neque ornare aliquet. Curabitur placerat finibus turpis et finibus. Nunc porttitor pellentesque ligula, id posuere urna. Pellentesque eget arcu vel sem vehicula interdum. Morbi id turpis quam. Etiam lacus metus, eleifend luctus neque maximus, malesuada rutrum sapien. Mauris at aliquam felis, in interdum felis. Morbi nec eros condimentum, elementum diam sed, malesuada leo. Donec eu ultricies magna, sed semper justo. Maecenas fringilla viverra pretium. Aenean velit nisl, imperdiet id lectus vitae, volutpat congue tellus. Proin ut libero eget nisl tristique imperdiet id eu nulla.</p><p>Sed libero eros, rutrum dictum ex a, vehicula blandit risus. In ornare dapibus congue. Nulla congue urna metus, ultrices malesuada tellus sagittis et. Maecenas id egestas nisl. In et est in mauris volutpat posuere et in felis. Duis pulvinar tincidunt dolor quis mollis. Aenean scelerisque erat nunc, ut commodo neque egestas at.</p><p>Morbi nec metus vel mi imperdiet interdum. Sed vel odio sit amet lacus porttitor sodales et in augue. Nulla tristique quam convallis justo elementum iaculis. Donec vitae tortor vel lorem pharetra faucibus quis quis neque. Sed lacinia, lorem at laoreet semper, odio odio sagittis leo, vel dignissim neque massa in nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin quam est, bibendum sit amet metus vitae, efficitur euismod turpis. Curabitur consequat eros vitae eros mollis, a venenatis mauris blandit.</p></div>');

    /**
     * Current magnification factor, also default
     *
     * @type {Number}
     */
    var factor = 1.5;

    /**
     * Smallest magnification factor
     * @type {Number}
     */
    var minFactor = factor;

    /**
     * Biggest magnification factor
     * @type {Number}
     */
    var maxFactor = 4;

    /**
     * Increment between min an max
     *
     * @type {Number}
     */
    var increment = .5;

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'magnifier',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();


            //init magnifier instance var, it will be created only necessary
            this.magnifier = null;

            /**
             * Get the greater clickable area for a a form element
             *
             * @param $element
             * @returns {*}
             */
            function getClickZone($element) {

                var $clickZone;

                // in the first two cases click zone is parent to element
                // discard click on element to avoid recursion
                // order of .pseudo-label-box and label matters!
                $clickZone = $element.parents('.pseudo-label-box');
                if($clickZone.length) {
                    return $clickZone;//
                }

                $clickZone = $element.parents('label');
                if($clickZone.length) {
                    return $clickZone;
                }

                // nothing found, so the label is probably somewhere outside
                if($element.attr('id')) {
                    $clickZone = self.$item.find('label[for="' + id + '"]');
                    if($clickZone.length) {
                        return $element.add($clickZone);
                    }
                }

                // no label present, return element only
                return $element;
            }


            /**
             * Toggle various styles to allow the magnifier to show up outside the item's borders
             *
             * @param zoomer
             * @param factor
             * @param state
             */
            function setupZoomer(zoomer, factor, state) {
                var $azSmall = $('.az-wrap-inner');

                if(!$azSmall.prop('cssToggle')) {
                    $azSmall.prop('cssToggle', {
                        width: {
                            regular: $azSmall.width(),
                            zoom: $azSmall.width()
                        },
                        height: {
                            regular: $azSmall.height(),
                            zoom: self.$testRunnerScope.find('.test-runner-sections').height()
                        },
                        overflow: {
                            regular: $azSmall.css('overflow'),
                            zoom: 'hidden'
                        }
                    });
                    self.$modifiables = self.$modifiables.add($azSmall);
                }
                self.$modifiables.each(function() {
                    var $element  = $(this);
                    var cssToggle = $element.prop('cssToggle');
                    console.log(this.className, cssToggle)
                    _.forOwn(cssToggle, function(values, property) {
                        if(state === 'zoom')
                        $element.css(property, values[state]);
                    });
                });
                zoomer.$zoom.css({
                    transform: 'scale(' + factor + ')'
                });
            }


            /**
             * When any of the buttons is clicked
             *
             * @param dir
             */
            function magnify(dir) {

                if (!self.$item) {
                    return;
                }

                factor = !dir ? minFactor : factor + (increment * dir);
                factor = Math.min(factor, maxFactor);
                factor = Math.max(factor, minFactor);

                var zoomer = self.$item.data('zoomer');

                // initialise
                if(!zoomer) {
                    self.$item.anythingZoomer({
                        clone: true,
                        switchEvent: 'none',
                        smallArea: 'qti-itemBody',
                        initialized: function(event, zoomer){
                            var $smallInputs = zoomer.$small.find(':input');
                            zoomer.$large.find(':input').each(function(i) {
                                var $element = $(this);
                                var $partner = $($smallInputs[i]);

                                // this avoids unchecked radio buttons in zoom
                                var name = $element.attr('name');
                                if(name) {
                                    $element.attr('name', 'az-' + name);
                                }
                                if($element.is(':text') || $element.is('textarea')) {
                                    $element.on('keypress', function() {
                                        $partner.val($element.val());
                                    });
                                }
                                else if($element.is(':checkbox') || $element.is(':radio')) {
                                    getClickZone($element).on('click', function() {
                                        $element[0].checked = !$element[0].checked;
                                        $partner.trigger('click');
                                    });
                                }
                                else {
                                    $element.on('change', function() {
                                        $partner.trigger('click');
                                    });
                                }
                            })
                        },
                        zoom: function(event, zoomer){
                            setupZoomer(zoomer, factor, 'zoom');
                        },
                        unzoom: function(event, zoomer) {
                            setupZoomer(zoomer, factor, 'regular');
                        }
                    });
                }
                else {
                    setupZoomer(zoomer, factor, 'zoom');
                }


                $('.az-large').css({
                    width: self.$item.width() * factor
                });
                
                self.$item.getAnythingZoomer().options.clone = false;
                self.$item.anythingZoomer();
            }

            this.$buttonGroup = $(buttonGroupTpl({
                control : 'magnify',
                buttons: {
                    less: {
                        title : __('Magnify less'),
                        icon : 'remove'
                    },
                    main: {
                        title : __('Magnify'),
                        text: __('Magnify'),
                        icon : 'find'
                    },
                    more: {
                        title : __('Magnify more'),
                        icon : 'add'
                    }
                }
            }));

            this.$buttonMagnifyMain = this.$buttonGroup.find('[data-key="main"]');
            this.$buttonMagnifyLess = this.$buttonGroup.find('[data-key="less"]');
            this.$buttonMagnifyMore = this.$buttonGroup.find('[data-key="more"]');
            this.$buttons           = this.$buttonGroup.find('a.li-inner');

            //attach behavior
            this.$buttonMagnifyMain.on('click', function (e){
                e.preventDefault();
                if(!!self.getState('enabled')) {
                    self.$item.anythingZoomer('disable');
                }
                magnify();
            });

            this.$buttonMagnifyLess.on('click', function (e){
                e.preventDefault();
                magnify(-1);
            });

            //attach behavior
            this.$buttonMagnifyMore.on('click', function (e){
                e.preventDefault();
                magnify(1);
            });

            //start disabled
            this.show();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function (){
                    self.factor = factor;
                    self.show();
                    self.disable();
                })
                .on('renderitem', function (){
                    var scopeWrapper;
                    var $element;
                    var overflow;
                    var paddingTop;
                    var marginTop;
                    var cssToggle;
                    var modify = false;
                    var $contentWrapper;
                    var oldOverflow;
                    var withScrollWidth;
                    var withoutScrollWidth;

                    self.$testRunnerScope = $('.test-runner-scope');
                    scopeWrapper = self.$testRunnerScope.parent()[0];
                    self.$modifiables = $();
                    self.$item = self.$testRunnerScope.find('.qti-item');

                    if(self.$item[0].scrollHeight > self.$item.height()) {
                        $contentWrapper = self.$testRunnerScope.find('.content-wrapper');
                        oldOverflow = $contentWrapper.css('overflow');
                        withScrollWidth = $contentWrapper.width();
                        $contentWrapper.css('overflow', 'hidden');
                        withoutScrollWidth = $contentWrapper.width();
                        $contentWrapper.css('overflow', oldOverflow);
                        cssToggle = {
                            left: {
                                regular: 'auto',
                                zoom: withoutScrollWidth - withScrollWidth
                            }
                        };
                        $contentWrapper.prop('cssToggle', cssToggle);
                        self.$modifiables = self.$modifiables.add($contentWrapper);
                    }

                    $element = self.$item;

                    //@todo remove lorem ipsum
                    self.$item.find('.qti-itemBody').append(li)

                    // all these elements need temporarily to be modified to display the magnifier
                    // outside the item (overflow issue)
                    while($element[0] !== scopeWrapper) {
                        overflow   = $element.css('overflow');
                        paddingTop = parseInt($element.css('padding-top'));
                        marginTop  = parseInt($element.css('margin-top'));
                        cssToggle  = $element.prop('cssToggle') || {};
                        if(overflow !== 'visible') {
                            cssToggle.overflow = {
                                regular: overflow,
                                zoom: 'visible'
                            };
                            modify = true;
                        }
                        if(paddingTop > 0) {
                            cssToggle.paddingTop = {
                                regular: paddingTop,
                                zoom: 0
                            };
                            cssToggle.marginTop = {
                                regular: marginTop,
                                zoom: marginTop + paddingTop
                            };
                            modify = true;
                        }
                        if(modify) {
                            $element.prop('cssToggle', cssToggle);
                            self.$modifiables = self.$modifiables.add($element);
                            modify = false;
                        }
                        $element = $element.parent();
                    }
                    self.enable();
                })
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                });
        },
        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var areaBroker = this.getAreaBroker();
            areaBroker.getToolboxArea().append(this.$buttonGroup);
        },
        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            this.$buttonGroup.remove();
        },
        /**
         * Enable the button
         */
        enable : function enable(){
            this.$buttonGroup.removeProp('disabled').removeClass('disabled');
        },
        /**
         * Disable the button
         */
        disable : function disable(){
            this.$buttonGroup.prop('disabled', true).addClass('disabled');
        },
        /**
         * Show the button
         */
        show : function show(){
            hider.show(this.$buttonGroup);
        },
        /**
         * Hide the button
         */
        hide : function hide(){
            hider.hide(this.$buttonGroup);
        }
    });
});

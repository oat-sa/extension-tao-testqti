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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/views/actions',
    'taoQtiTest/controller/creator/helpers/categorySelector',
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/templates/index'
],
function(
    $,
    _,
    __,
    actions,
    categorySelectorFactory,
    sectionCategory,
    qtiTestHelper,
    templates
){
    'use strict';

    /**
     * We need to resize the itemref in case of long labels
     */
    var resize = _.throttle(function resize(){
        var $refs = $('.itemrefs').first();
        var $actions = $('.itemref .actions').first();
        var width = $refs.innerWidth() - $actions.outerWidth();
        $('.itemref > .title').width(width);
    }, 100);

    /**
     * Set up an item ref: init action behaviors. Called for each one.
     *
     * @param {Object} creatorContext
     * @param {Object} refModel - the data model to bind to the item ref
     * @param {Object} sectionModel - the parent data model to inherit
     * @param {Object} partModel - the model of the parent's test part
     * @param {jQueryElement} $itemRef - the itemRef element to set up
     */
    function setUp (creatorContext, refModel, sectionModel, partModel, $itemRef) {

        var modelOverseer = creatorContext.getModelOverseer();
        var config = modelOverseer.getConfig()  || {};
        var $actionContainer = $('.actions', $itemRef);

        // set item session control to use test part options if section level isn't set
        if (!refModel.itemSessionControl) {
            refModel.itemSessionControl = {};
        }
        _.defaults(refModel.itemSessionControl, sectionModel.itemSessionControl);

        refModel.isLinear = partModel.navigationMode === 0;

        actions.properties($actionContainer, 'itemref', refModel, propHandler);
        actions.move($actionContainer, 'itemrefs', 'itemref');

        resize();

        /**
         * Set up the time limits behaviors :
         *  - linear test part: display the minTime field
         *  - linear + guided nav option : display the minTime field + the lock
         *  - otherwise only the maxTime field
         * @param {propView} propView - the view object
         */
        function timeLimitsProperty(propView){
            var $view = propView.getView();

            //target elements
            var $minTimeContainer    = $('.mintime-container', $view);
            var $maxTimeContainer    = $('.maxtime-container', $view);
            var $lockedTimeContainer = $('.lockedtime-container', $view);
            var $locker              = $('.locker button', $lockedTimeContainer);
            var $durationFields      = $(':text[data-duration]', $lockedTimeContainer);
            var $minTimeField        = $(':text[name="min-time"]', $lockedTimeContainer);
            var $maxTimeField        = $(':text[name="max-time"]', $lockedTimeContainer);

            /**
             * Sync min value to max value, trigger change to sync the component.
             * Need to temporally remove the other handler to prevent infinite loop
             */
            var minToMaxHandler = _.throttle(function minToMax(){
                $maxTimeField.off('change.sync');
                $maxTimeField.val($minTimeField.val()).trigger('change');
                _.defer(function(){
                    $maxTimeField.on('change.sync', minToMaxHandler);
                });
            }, 200);

            /**
             * Sync max value to min value, trigger change to sync the component.
             * Need to temporally remove the other handler to prevent infinite loop
             */
            var maxToMinHandler = _.throttle(function maxToMin(){
                $minTimeField.off('change.sync');
                $minTimeField.val($maxTimeField.val()).trigger('change');
                _.defer(function(){
                    $minTimeField.on('change.sync', minToMaxHandler);
                });
            }, 200);

            /**
             * Lock the timers
             */
            var lockTimers = function lockTimers(){
                $locker.removeClass('unlocked')
                       .addClass('locked')
                       .attr('title', __('Unlink to use separated durations'));

                //sync min to max
                $minTimeField.val($maxTimeField.val()).trigger('change');

                //keep both in sync
                $minTimeField.on('change.sync', minToMaxHandler);
                $maxTimeField.on('change.sync', maxToMinHandler);
            };

            /**
             * Unlock the timers
             */
            var unlockTimers = function unlockTimers(){
                $locker.removeClass('locked')
                       .addClass('unlocked')
                       .attr('title', __('Link durations to activate the guided navigation'));

                $durationFields.off('change.sync');
                $minTimeField.val('00:00:00').trigger('change');
            };

            /**
             * Toggle the timelimits modes max, min + max, min + max + locked
             */
            var toggleTimeContainers = function toggleTimeContainers(){
                refModel.isLinear = partModel.navigationMode === 0;
                if(refModel.isLinear && config.guidedNavigation){
                    $minTimeContainer.addClass('hidden');
                    $maxTimeContainer.addClass('hidden');
                    $lockedTimeContainer.removeClass('hidden');
                    if($minTimeField.val() === $maxTimeField.val() && $maxTimeField.val() !== '00:00:00'){
                        lockTimers();
                    }
                    $locker.on('click', function(e){
                        e.preventDefault();

                        if($locker.hasClass('locked')){
                            unlockTimers();
                        } else {
                            lockTimers();
                        }
                    });
                } else if (refModel.isLinear){
                    $lockedTimeContainer.addClass('hidden');
                    $minTimeContainer.removeClass('hidden');
                    $maxTimeContainer.removeClass('hidden');
                } else {
                    $lockedTimeContainer.addClass('hidden');
                    $minTimeContainer.addClass('hidden');
                    $maxTimeContainer.removeClass('hidden');
                }
            };

            //if the testpart changes it's navigation mode
            modelOverseer.on('testpart-change', function(){
                toggleTimeContainers();
            });

            toggleTimeContainers();

            //chek if min <= maw
            $durationFields.on('change.check', function(){
                if( refModel.timeLimits.minTime > 0 &&
                    refModel.timeLimits.maxTime > 0 &&
                    refModel.timeLimits.minTime > refModel.timeLimits.maxTime ) {

                    $minTimeField.parent('div').find('.duration-ctrl-wrapper').addClass('brd-danger');
                } else {
                    $minTimeField.parent('div').find('.duration-ctrl-wrapper').removeClass('brd-danger');
                }
            });
        }

        /**
         * Set up the category property
         * @private
         * @param {jQueryElement} $view - the $view object containing the $select
         */
        function categoriesProperty($view){
            var categorySelector = categorySelectorFactory($view),
                $categoryField = $view.find('[name="itemref-category"]');

            categorySelector.createForm();
            categorySelector.updateFormState(refModel.categories);

            $view.on('propopen.propview', function(){
                categorySelector.updateFormState(refModel.categories);
            });

            categorySelector.on('category-change', function(selected) {
                // Let the binder update the model by going through the category hidden field
                $categoryField.val(selected.join(','));
                $categoryField.trigger('change');

                modelOverseer.trigger('category-change', selected);
            });
        }

        /**
         * Setup the weights properties
         */
        function weightsProperty(propView) {
            var $view = propView.getView(),
                $weightList = $view.find('[data-bind-each="weights"]'),
                weightTpl = templates.properties.itemrefweight;

            $view.find('.itemref-weight-add').on('click', function(e) {
                var defaultData = {
                    value: 1,
                    'qti-type' : 'weight',
                    identifier: (refModel.weights.length === 0) ? 'WEIGHT' : qtiTestHelper.getAvailableIdentifier(refModel, 'weight', 'WEIGHT')
                };
                e.preventDefault();

                $weightList.append(weightTpl(defaultData));
                refModel.weights.push(defaultData);
                $weightList.trigger('add.internalbinder'); // trigger model update

                $view.groupValidator();
            });
        }

        /**
         * Perform some binding once the property view is create
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler (propView) {

            var removePropHandler = function removePropHandler(){
                if(propView !== null){
                    propView.destroy();
                }
            };

            categoriesProperty(propView.getView());
            weightsProperty(propView);
            timeLimitsProperty(propView);

            $itemRef.parents('.testpart').on('delete', removePropHandler);
            $itemRef.parents('.section').on('delete', removePropHandler);
            $itemRef.on('delete', removePropHandler);
        }
    }

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    function listenActionState (){

        $('.itemrefs').each(function(){
            actions.movable($('.itemref', $(this)), 'itemref', '.actions');
        });

        $(document)
            .on('delete', function(e){
                var $parent;
                var $target = $(e.target);
                if($target.hasClass('itemref')){
                    $parent = $target.parents('.itemrefs');
                    actions.disable($parent.find('.itemref'), '.actions');
                }
            })
            .on('add change undo.deleter deleted.deleter', '.itemrefs',  function(e){
                var $parent;
                var $target = $(e.target);
                if($target.hasClass('itemref') || $target.hasClass('itemrefs')){
                    $parent = $('.itemref', $target.hasClass('itemrefs') ? $target : $target.parents('.itemrefs'));
                    actions.enable($parent, '.actions');
                    actions.movable($parent, 'itemref', '.actions');
                }
            });
    }

    /**
     * The itemrefView setup itemref related components and beahvior
     *
     * @exports taoQtiTest/controller/creator/views/itemref
     */
    return {
        setUp : setUp,
        listenActionState: listenActionState,
        resize : resize
    };

});

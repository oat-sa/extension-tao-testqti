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
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'taoQtiTest/controller/creator/helpers/arrayProperty',
    'tpl!taoQtiTest/controller/creator/templates/itemref-props-weigths'
],
function(
    $,
    _,
    __,
    actions,
    sectionCategory,
    arrayProperty,
    weightTpl
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
     * @param {jQueryElement} $itemRef - the itemRef element to set up
     * @param {Object} model - the data model to bind to the ref
     */
    var setUp =  function setUp ($itemRef, model){

        var $actionContainer = $('.actions', $itemRef);

        actions.properties($actionContainer, 'itemref', model, propHandler);
        actions.move($actionContainer, 'itemrefs', 'itemref');

        resize();

        /**
         * Perform some binding once the property view is create
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler (propView) {

            categoriesProperty(propView.getView());
            weightsProperty(propView.getView());

            $itemRef.parents('.testpart').on('delete', removePropHandler);
            $itemRef.parents('.section').on('delete', removePropHandler);
            $itemRef.on('delete', removePropHandler);

            function removePropHandler(){
                if(propView !== null){
                    propView.destroy();
                }
            }
        }

        /**
         * Set up the category property
         * @private
         * @param {jQueryElement} $view - the $view object containing the $select
         */
        function categoriesProperty($view){
            var $select = $view.find('[name=itemref-category]');
            $select.select2({
                width: '100%',
                tags : _.pluck(sectionCategory.getTaoOptionCategories(), 'name'),
                multiple : true,
                tokenSeparators: [",", " ", ";"],
                formatNoMatches : function(){
                    return __('Enter a category');
                },
                maximumInputLength : 32
            });

            initCategories();
            $view.on('propopen.propview', function(){
                initCategories();
            });

            /**
             * save the categories into the model
             * @private
             */
            function initCategories(){
                $select.select2('val', model.categories);
            }
        }


        /**
         * Setup the weights properties
         */
        function weightsProperty($view) {
            var $renderTo = $view.find('.itemref-weights-entries');

            model.weights.forEach(function(weight) {
                $renderTo.append(weightTpl(weight));
            });
            initEvents();

            function initEvents() {
                $view.find('.itemref-weight-remove').off('click');
                $view.find('.itemref-weight-remove').on('click', function(e) {
                    e.preventDefault();
                    $(e.target).closest('.itemref-weight').remove();
                    updateModel();
                });

                $view.find('.itemref-weight input[type=text]').off('keyup');
                $view.find('.itemref-weight input[type=text]').on('keyup', _.debounce(function() {
                    updateModel();
                }, 300));
            }

            function updateModel() {
                var $weights = $view.find('.itemref-weight'),
                    $entry,
                    identifier,
                    value,
                    newModel = [];

                $weights.each(function () {
                    $entry = $(this);
                    identifier = $entry.find('[data-identifier=itemref-weight-identifier]').val().trim();
                    value = $entry.find('[data-identifier=itemref-weight-value]').val()
                        .replace(',', '.')
                        .trim();

                    if (identifier && value) {
                        newModel.push({
                            identifier: identifier,
                            value: parseFloat(value)
                        });
                    }
                });
                model.weights = newModel;
            }

            // todo: harmonize selectors names 's'
            $view.find('.itemref-weights-add').on('click', function(e) {
                var defaultData = {
                    value: 1
                };
                if (model.weights.length === 0) {
                    defaultData.identifier = 'WEIGHT'; // we set this as default in case no weight has been defined yet
                }
                e.preventDefault();

                $renderTo.append(weightTpl(defaultData));
                updateModel();
                initEvents();
            });


        }
    };

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    var listenActionState =  function listenActionState (){

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
    };

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

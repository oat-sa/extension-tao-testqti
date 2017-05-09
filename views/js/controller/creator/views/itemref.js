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
    'taoQtiTest/controller/creator/helpers/categoryPresets',
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/templates/index'
],
function(
    $,
    _,
    __,
    actions,
    categoryPresets,
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
     * @param {modelOverseer} modelOverseer - the test model overseer. Should also provide some config entries
     * @param {Object} refModel - the data model to bind to the item ref
     * @param {jQueryElement} $itemRef - the itemRef element to set up
     */
    function setUp (modelOverseer, refModel, $itemRef){

        var $actionContainer = $('.actions', $itemRef);

        actions.properties($actionContainer, 'itemref', refModel, propHandler);
        actions.move($actionContainer, 'itemrefs', 'itemref');

        resize();

        /**
         * Perform some binding once the property view is create
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler (propView) {

            categoriesProperty(propView.getView());
            weightsProperty(propView);

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
            /*
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
            }).on('change', function(e){
                /**
                 * @event modelOverseer#category-change
                 * @param {Array} categories
                 * /
                modelOverseer.trigger('category-change', e.val);
            });
            initCategories();
            $view.on('propopen.propview', function(){
                initCategories();
            });

            /**
             * save the categories into the model
             * @private
             * /
            function initCategories(){
                $select.select2('val', refModel.categories);
            }
            */

            // ===================================================== PRESETS

            var $categoryPresets = $view.find('.category-presets'),
                presetsTpl = templates.properties.categorypresets,
                presetList = categoryPresets.getPresets(),
                categoriesModel = refModel.categories;

            presetList.forEach(function (preset) {
                preset.checked = (categoriesModel.indexOf(preset.qtiCategory) !== -1);
            });

            $categoryPresets.append(
                presetsTpl(presetList)
            );

            $categoryPresets.on('click', function(e) {
                var $target = $(e.target),
                    qtiCategory = $target.closest('.category-preset').data('qti-category');

                toggleCategory($view, qtiCategory);
            });

            // ======================================================== CUSTOM
            /*
            var $select = $view.find('[name=itemref-category]');

            initCategories();
            $view.on('propopen.propview', function(){
                initCategories();
            });

            /**
             * save the categories into the model
             * @private
             * /
            function initCategories(){
                $select.select2('val', refModel.categories);
            }
            */

        }

        function toggleCategory($view, category) {
            var $categoriesModel = $view.find('[data-bind="categories"]'),
                categoryIndex = refModel.categories.indexOf(category);

            if (categoryIndex === -1) {
                refModel.categories.push(category);
            } else {
                refModel.categories.splice(categoryIndex, 1);
            }
            $categoriesModel.val(refModel.categories.join(','));

            /**
             * @event modelOverseer#category-change
             * @param {Array} categories
             */
            modelOverseer.trigger('category-change', refModel.categories);
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
                    identifier: (refModel.weights.length === 0)
                        ? 'WEIGHT'
                        : qtiTestHelper.getIdentifier('WEIGHT', qtiTestHelper.extractIdentifiers(refModel))
                };
                e.preventDefault();

                $weightList.append(weightTpl(defaultData));
                $weightList.trigger('add.internalbinder'); // trigger model update

                $view.groupValidator();
            });
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

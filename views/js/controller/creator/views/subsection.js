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
 * Copyright (c) 2021-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define([
    'jquery',
    'lodash',
    'uri',
    'i18n',
    'taoQtiTest/controller/creator/config/defaults',
    'taoQtiTest/controller/creator/views/actions',
    'taoQtiTest/controller/creator/views/itemref',
    'taoQtiTest/controller/creator/views/rubricblock',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/categorySelector',
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'taoQtiTest/controller/creator/helpers/sectionBlueprints',
    'ui/dialog/confirm',
    'taoQtiTest/controller/creator/helpers/subsection',
    'taoQtiTest/controller/creator/helpers/validators'
], function (
    $,
    _,
    uri,
    __,
    defaults,
    actions,
    itemRefView,
    rubricBlockView,
    templates,
    qtiTestHelper,
    categorySelectorFactory,
    sectionCategory,
    sectionBlueprint,
    confirmDialog,
    subsectionsHelper,
    validators
) {
    'use strict';
    /**
     * Set up a section: init action behaviors. Called for each section.
     *
     * @param {Object} creatorContext
     * @param {Object} subsectionModel - the data model to bind to the test section
     * @param {Object} sectionModel - the parent data model to inherit
     * @param {jQuery} $subsection - the subsection to set up
     */
    function setUp(creatorContext, subsectionModel, sectionModel, $subsection) {
        // select elements for subsection, to avoid selecting the same elements in nested subsections
        const $itemRefsWrapper = $subsection.children('.itemrefs-wrapper');
        const $rubBlocks = $subsection.children('.rublocks');
        const $titleWithActions = $subsection.children('h2');

        const modelOverseer = creatorContext.getModelOverseer();
        const config = modelOverseer.getConfig();

        // set item session control to use test part options if section level isn't set
        if (!subsectionModel.itemSessionControl) {
            subsectionModel.itemSessionControl = {};
        }
        if (!subsectionModel.categories) {
            subsectionModel.categories = defaults().categories;
        }
        _.defaults(subsectionModel.itemSessionControl, sectionModel.itemSessionControl);

        if (!_.isEmpty(config.routes.blueprintsById)) {
            subsectionModel.hasBlueprint = true;
        }
        actions.properties($titleWithActions, 'section', subsectionModel, propHandler);
        actions.move($titleWithActions, 'subsections', 'subsection');
        actions.displayItemWrapper($subsection);
        actions.updateDeleteSelector($titleWithActions);

        subsections();
        itemRefs();
        acceptItemRefs();
        rubricBlocks();
        addRubricBlock();

        if (subsectionsHelper.isNestedSubsection($subsection)) {
            // prevent adding a third subsection level
            $('.add-subsection', $subsection).hide();
            $('.add-subsection + .tlb-separator', $subsection).hide();
        } else {
            addSubsection();
        }

        /**
         * Perform some binding once the property view is create
         * @param {propView} propView - the view object
         */
        function propHandler(propView) {
            const $view = propView.getView();

            //enable/disable selection
            const $selectionSwitcher = $('[name=section-enable-selection]', $view);
            const $selectionSelect = $('[name=section-select]', $view);
            const $selectionWithRep = $('[name=section-with-replacement]', $view);

            // subsectionModel.selection will be filled by binded values from template section-props.tpl
            // if subsectionModel.selection from server response it has 'qti-type'
            const isSelectionFromServer = !!(subsectionModel.selection && subsectionModel.selection['qti-type']);

            const switchSelection = function switchSelection() {
                if ($selectionSwitcher.prop('checked') === true) {
                    $selectionSelect.incrementer('enable');
                    $selectionWithRep.removeClass('disabled');
                } else {
                    $selectionSelect.incrementer('disable');
                    $selectionWithRep.addClass('disabled');
                }
            };
            $selectionSwitcher.on('change', switchSelection);
            $selectionSwitcher.on('change', function updateModel() {
                if (!$selectionSwitcher.prop('checked')) {
                    $selectionSelect.val(0);
                    $selectionWithRep.prop('checked', false);
                    delete subsectionModel.selection;
                }
            });

            $selectionSwitcher.prop('checked', isSelectionFromServer).trigger('change');

            //listen for databinder change to update the test part title
            const $title = $('[data-bind=title]', $titleWithActions);
            $view.on('change.binder', function (e) {
                if (e.namespace === 'binder' && subsectionModel['qti-type'] === 'assessmentSection') {
                    $title.text(subsectionModel.title);
                }
            });

            // deleted.deleter event fires only on the parent nodes (testparts, sections, etc)
            // Since it "bubles" we can subsctibe only to the highest parent node
            $subsection.parents('.testparts').on('deleted.deleter', removePropHandler);

            //section level category configuration
            categoriesProperty($view);

            if (typeof subsectionModel.hasBlueprint !== 'undefined') {
                blueprintProperty($view);
            }

            actions.displayCategoryPresets($subsection);

            function removePropHandler(e, $deletedNode) {
                const validIds = [$subsection.parents('.testpart').attr('id'), $subsection.attr('id')];

                const deletedNodeId = $deletedNode.attr('id');
                // We have to check id of a deleted node, because
                // 1. Event fires after child node was deleted, but e.stopPropagation doesn't help
                // because currentTarget is always document
                // 2. We have to subscribe to the parent node and it's posiible that another section was removed even from another testpart
                // Subscription to the .sections selector event won't help because sections element might contain several children.

                if (propView !== null && validIds.includes(deletedNodeId)) {
                    propView.destroy();
                }
            }
        }
        /**
         * Set up subsections that already belongs to the section
         * @private
         */
        function subsections() {
            if (!subsectionModel.sectionParts) {
                subsectionModel.sectionParts = [];
            }

            subsectionsHelper.getSubsections($subsection).each(function () {
                const $sub2section = $(this);
                const index = $sub2section.data('bind-index');
                if (!subsectionModel.sectionParts[index]) {
                    subsectionModel.sectionParts[index] = {};
                }

                setUp(creatorContext, subsectionModel.sectionParts[index], subsectionModel, $sub2section);
            });
        }
        /**
         * Set up the item refs that already belongs to the section
         * @private
         */
        function itemRefs() {
            if (!subsectionModel.sectionParts) {
                subsectionModel.sectionParts = [];
            }
            $('.itemref', $itemRefsWrapper).each(function () {
                const $itemRef = $(this);
                const index = $itemRef.data('bind-index');
                if (!subsectionModel.sectionParts[index]) {
                    subsectionModel.sectionParts[index] = {};
                }

                itemRefView.setUp(
                    creatorContext,
                    subsectionModel.sectionParts[index],
                    subsectionModel,
                    sectionModel,
                    $itemRef
                );
                $itemRef.find('.title').text(config.labels[uri.encode($itemRef.data('uri'))]);
            });
        }

        /**
         * Make the section to accept the selected items
         * @private
         * @fires modelOverseer#item-add
         */
        function acceptItemRefs() {
            const $itemsPanel = $('.test-creator-items .item-selection');

            //the item selector trigger a select event
            $itemsPanel.on('itemselect.creator', function (e, selection) {
                const $placeholder = $('.itemref-placeholder', $itemRefsWrapper);
                const $placeholders = $('.itemref-placeholder');

                if (_.size(selection) > 0) {
                    $placeholder
                        .show()
                        .off('click')
                        .on('click', function () {
                            //prepare the item data
                            const defaultItemData = {};

                            if (
                                subsectionModel.itemSessionControl &&
                                !_.isUndefined(subsectionModel.itemSessionControl.maxAttempts)
                            ) {
                                //for a matter of consistency, the itemRef will "inherit" the itemSessionControl configuration from its parent section
                                defaultItemData.itemSessionControl = _.clone(subsectionModel.itemSessionControl);
                            }

                            //the itemRef should also "inherit" the categories set at the item level
                            const categories = sectionCategory.getCategories(subsectionModel);
                            defaultItemData.categories = _.clone(defaults().categories) || [];

                            _.forEach(selection, function (item) {
                                const itemData = _.defaults(
                                    {
                                        href: item.uri,
                                        label: item.label,
                                        'qti-type': 'assessmentItemRef'
                                    },
                                    defaultItemData
                                );

                                if (_.isArray(item.categories)) {
                                    itemData.categories = item.categories.concat(itemData.categories);
                                }

                                addItemRef($('.itemrefs', $itemRefsWrapper), null, itemData);
                            });

                            $itemsPanel.trigger('itemselected.creator');

                            $placeholders.hide().off('click');
                        });
                } else {
                    $placeholders.hide().off('click');
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            // jquesry issue to select id with dot by '#ab.cd', should be used [id="ab.cd"]
            $(document)
                .off('add.binder', `[id="${$subsection.attr('id')}"] > .itemrefs-wrapper .itemrefs`)
                .on(
                    'add.binder',
                    `[id="${$subsection.attr('id')}"] > .itemrefs-wrapper .itemrefs`,
                    function (e, $itemRef) {
                        if (
                            e.namespace === 'binder' &&
                            $itemRef.hasClass('itemref') &&
                            $itemRef.closest('.subsection').attr('id') === $subsection.attr('id')
                        ) {
                            const index = $itemRef.data('bind-index');
                            const itemRefModel = subsectionModel.sectionParts[index];

                            //initialize the new item ref
                            itemRefView.setUp(creatorContext, itemRefModel, subsectionModel, sectionModel, $itemRef);

                            /**
                             * @event modelOverseer#item-add
                             * @param {Object} itemRefModel
                             */
                            modelOverseer.trigger('item-add', itemRefModel);
                        }
                    }
                );
        }

        /**
         * Add a new item ref to the section
         * @param {jQuery} $refList - the element to add the item to
         * @param {Number} [index] - the position of the item to add
         * @param {Object} [itemData] - the data to bind to the new item ref
         */
        function addItemRef($refList, index, itemData) {
            const $items = $refList.children('li');
            index = index || $items.length;
            itemData.identifier = qtiTestHelper.getAvailableIdentifier(
                modelOverseer.getModel(),
                'assessmentItemRef',
                'item'
            );
            itemData.index = index + 1;
            const $itemRef = $(templates.itemref(itemData));
            if (index > 0) {
                $itemRef.insertAfter($items.eq(index - 1));
            } else {
                $itemRef.appendTo($refList);
            }
            $refList.trigger('add', [$itemRef, itemData]);
        }

        /**
         * Set up the rubric blocks that already belongs to the section
         * @private
         */
        function rubricBlocks() {
            if (!subsectionModel.rubricBlocks) {
                subsectionModel.rubricBlocks = [];
            }
            $('.rubricblock', $rubBlocks).each(function () {
                const $rubricBlock = $(this);
                const index = $rubricBlock.data('bind-index');
                if (!subsectionModel.rubricBlocks[index]) {
                    subsectionModel.rubricBlocks[index] = {};
                }

                rubricBlockView.setUp(creatorContext, subsectionModel.rubricBlocks[index], $rubricBlock);
            });

            //opens the rubric blocks section if they are there.
            if (subsectionModel.rubricBlocks.length > 0) {
                $('.rub-toggler', $titleWithActions).trigger('click');
            }
        }

        /**
         * Enable to add new rubric block
         * @private
         * @fires modelOverseer#rubric-add
         */
        function addRubricBlock() {
            $('.rublock-adder', $rubBlocks).adder({
                target: $('.rubricblocks', $rubBlocks),
                content: templates.rubricblock,
                templateData: function (cb) {
                    cb({
                        'qti-type': 'rubricBlock',
                        index: $('.rubricblock', $rubBlocks).length,
                        content: [],
                        views: [1]
                    });
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            // jquesry issue to select id with dot by '#ab.cd', should be used [id="ab.cd"]
            $(document)
                .off('add.binder', `[id="${$subsection.attr('id')}"] > .rublocks .rubricblocks`)
                .on(
                    'add.binder',
                    `[id="${$subsection.attr('id')}"] > .rublocks .rubricblocks`,
                    function (e, $rubricBlock) {
                        if (
                            e.namespace === 'binder' &&
                            $rubricBlock.hasClass('rubricblock') &&
                            $rubricBlock.closest('.subsection').attr('id') === $subsection.attr('id')
                        ) {
                            const index = $rubricBlock.data('bind-index');
                            const rubricModel = subsectionModel.rubricBlocks[index] || {};

                            $('.rubricblock-binding', $rubricBlock).html('<p>&nbsp;</p>');
                            rubricBlockView.setUp(creatorContext, rubricModel, $rubricBlock);

                            /**
                             * @event modelOverseer#rubric-add
                             * @param {Object} rubricModel
                             */
                            modelOverseer.trigger('rubric-add', rubricModel);
                        }
                    }
                );
        }

        /**
         * Set up the category property
         * @private
         * @param {jQuery} $view - the $view object containing the $select
         * @fires modelOverseer#category-change
         */
        function categoriesProperty($view) {
            const categories = sectionCategory.getCategories(subsectionModel),
                categorySelector = categorySelectorFactory($view);

            categorySelector.createForm(categories.all);
            updateFormState(categorySelector);

            $view.on('propopen.propview', function () {
                updateFormState(categorySelector);
            });

            $view.on('set-default-categories', function () {
                subsectionModel.categories = defaults().categories;
                updateFormState(categorySelector);
            });

            categorySelector.on('category-change', function (selected, indeterminate) {
                sectionCategory.setCategories(subsectionModel, selected, indeterminate);

                modelOverseer.trigger('category-change');
            });
        }

        function updateFormState(categorySelector) {
            const categories = sectionCategory.getCategories(subsectionModel);
            categorySelector.updateFormState(categories.propagated, categories.partial);
        }

        /**
         * Set up the Blueprint property
         * @private
         * @param {jQuery} $view - the $view object containing the $select
         */
        function blueprintProperty($view) {
            const $select = $('[name=section-blueprint]', $view);
            $select
                .select2({
                    ajax: {
                        url: config.routes.blueprintsById,
                        dataType: 'json',
                        delay: 350,
                        method: 'POST',
                        data: function (params) {
                            return {
                                identifier: params // search term
                            };
                        },
                        results: function (data) {
                            return data;
                        }
                    },
                    minimumInputLength: 3,
                    width: '100%',
                    multiple: false,
                    allowClear: true,
                    placeholder: __('Select a blueprint'),
                    formatNoMatches: function () {
                        return __('Enter a blueprint');
                    },
                    maximumInputLength: 32
                })
                .on('change', function (e) {
                    setBlueprint(e.val);
                });

            initBlueprint();
            $view.on('propopen.propview', function () {
                initBlueprint();
            });

            /**
             * Start the blueprint editing
             * @private
             */
            function initBlueprint() {
                if (typeof subsectionModel.blueprint === 'undefined') {
                    sectionBlueprint
                        .getBlueprint(config.routes.blueprintByTestSection, subsectionModel)
                        .success(function (data) {
                            if (!_.isEmpty(data)) {
                                if (subsectionModel.blueprint !== '') {
                                    subsectionModel.blueprint = data.uri;
                                    $select.select2('data', { id: data.uri, text: data.text });
                                    $select.trigger('change');
                                }
                            }
                        });
                }
            }

            /**
             * save the categories into the model
             * @param {Object} blueprint
             * @private
             */
            function setBlueprint(blueprint) {
                sectionBlueprint.setBlueprint(subsectionModel, blueprint);
            }
        }

        function addSubsection() {
            const optionsConfirmDialog = {
                buttons: {
                    labels: {
                        ok: __('Yes'),
                        cancel: __('No')
                    }
                }
            };

            $('.add-subsection', $titleWithActions).adder({
                target: $subsection.children('.subsections'),
                content: templates.subsection,
                templateData: function (cb) {
                    //create a new subsection model object to be bound to the template
                    let sectionParts = [];
                    if ($subsection.data('movedItems')) {
                        sectionParts = $subsection.data('movedItems');
                        $subsection.removeData('movedItems');
                    }
                    cb({
                        'qti-type': 'assessmentSection',
                        identifier: qtiTestHelper.getAvailableIdentifier(
                            modelOverseer.getModel(),
                            'assessmentSection',
                            'subsection'
                        ),
                        title: defaults().sectionTitlePrefix,
                        index: 0,
                        sectionParts,
                        visible: true
                    });
                },
                checkAndCallAdd: function (executeAdd) {
                    if (
                        subsectionModel.sectionParts[0] &&
                        qtiTestHelper.filterQtiType(subsectionModel.sectionParts[0], 'assessmentItemRef')
                    ) {
                        // subsection has item(s)
                        const subsectionIndex = subsectionsHelper.getSubsectionTitleIndex($subsection);
                        const confirmMessage = __(
                            'The items contained in <b>%s %s</b> will be moved into the new <b>%s %s</b>. Do you wish to proceed?',
                            subsectionIndex,
                            subsectionModel.title,
                            `${subsectionIndex}1.`,
                            defaults().sectionTitlePrefix
                        );
                        const acceptFunction = () => {
                            // trigger deleted event for each itemfer to run removePropHandler and remove propView
                            $('.itemrefs .itemref', $itemRefsWrapper).each(function () {
                                $subsection.parents('.testparts').trigger('deleted.deleter', [$(this)]);
                            });
                            setTimeout(() => {
                                // remove all itemrefs
                                $('.itemrefs', $itemRefsWrapper).empty();
                                // check itemrefs identifiers
                                // because validation is build on <span id="props-{identifier}">
                                // and each item should have valid and unique id
                                subsectionModel.sectionParts.forEach(itemRef => {
                                    if (!validators.checkIfItemIdValid(itemRef.identifier, modelOverseer)) {
                                        itemRef.identifier = qtiTestHelper.getAvailableIdentifier(
                                            modelOverseer.getModel(),
                                            'assessmentItemRef',
                                            'item'
                                        );
                                    }
                                });
                                $subsection.data('movedItems', _.clone(subsectionModel.sectionParts));
                                subsectionModel.sectionParts = [];
                                executeAdd();
                            }, 0);
                        };
                        confirmDialog(confirmMessage, acceptFunction, () => {}, optionsConfirmDialog)
                            .getDom()
                            .find('.buttons')
                            .css('display', 'flex')
                            .css('flex-direction', 'row-reverse');
                    } else {
                        if (!subsectionModel.sectionParts.length && subsectionModel.categories.length) {
                            $subsection.data('movedCategories', _.clone(subsectionModel.categories));
                        }
                        executeAdd();
                    }
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            // jquesry issue to select id with dot by '#ab.cd', should be used [id="ab.cd"]
            $(document)
                .off('add.binder', `[id="${$subsection.attr('id')}"] > .subsections`)
                .on('add.binder', `[id="${$subsection.attr('id')}"] > .subsections`, function (e, $sub2section) {
                    if (
                        e.namespace === 'binder' &&
                        $sub2section.hasClass('subsection') &&
                        $sub2section.parents('.subsection').length
                    ) {
                        // second level of subsection){
                        const sub2sectionIndex = $sub2section.data('bind-index');
                        const sub2sectionModel = subsectionModel.sectionParts[sub2sectionIndex];

                        if ($subsection.data('movedCategories')) {
                            sub2sectionModel.categories = $subsection.data('movedCategories');
                            $subsection.removeData('movedCategories');
                        }

                        // initialize the new subsection
                        setUp(creatorContext, sub2sectionModel, subsectionModel, $sub2section);
                        // hide 'Items' block and category-presets for current subsection
                        actions.displayItemWrapper($subsection);
                        actions.displayCategoryPresets($subsection);
                        // set index for new subsection
                        actions.updateTitleIndex($sub2section);

                        /**
                         * @event modelOverseer#section-add
                         * @param {Object} sub2sectionModel
                         */
                        modelOverseer.trigger('section-add', sub2sectionModel);
                    }
                });
        }
    }

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    function listenActionState() {
        $('.subsections').each(function () {
            const $subsections = $('.subsection', $(this));

            actions.removable($subsections, 'h2');
            actions.movable($subsections, 'subsection', 'h2');
            actions.updateTitleIndex($subsections);
        });

        $(document)
            .on('delete', function (e) {
                const $target = $(e.target);
                if ($target.hasClass('subsection')) {
                    const $parent = subsectionsHelper.getParent($target);
                    setTimeout(() => {
                        actions.displayItemWrapper($parent);
                        actions.displayCategoryPresets($parent);
                        // element detached after event
                        const $subsections = $('.subsection', $parent);
                        actions.updateTitleIndex($subsections);
                    }, 100);
                }
            })
            .on('add change undo.deleter deleted.deleter', function (e) {
                const $target = $(e.target);
                if ($target.hasClass('subsection') || $target.hasClass('subsections')) {
                    const $subsections = subsectionsHelper.getSiblingSubsections($target);
                    actions.removable($subsections, 'h2');
                    actions.movable($subsections, 'subsection', 'h2');

                    if (e.type === 'undo' || e.type === 'change') {
                        const $parent = subsectionsHelper.getParent($target);
                        const $AllNestedSubsections = $('.subsection', $parent);
                        actions.updateTitleIndex($AllNestedSubsections);
                        actions.displayItemWrapper($parent);
                        actions.displayCategoryPresets($parent);
                    }
                }
            });
    }
    /**
     * The sectionView setup section related components and beahvior
     *
     * @exports taoQtiTest/controller/creator/views/section
     */
    return {
        setUp: setUp,
        listenActionState: listenActionState
    };
});

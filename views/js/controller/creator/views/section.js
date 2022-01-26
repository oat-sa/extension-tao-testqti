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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
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
    'taoQtiTest/controller/creator/views/subsection',
    'ui/dialog/confirm',
    'taoQtiTest/controller/creator/helpers/subsection'
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
    subsectionView,
    confirmDialog,
    subsectionsHelper
) {
    'use strict';

    /**
     * Set up a section: init action behaviors. Called for each section.
     *
     * @param {Object} creatorContext
     * @param {Object} sectionModel - the data model to bind to the test section
     * @param {Object} partModel - the parent data model to inherit
     * @param {jQuery} $section - the section to set up
     */
    function setUp(creatorContext, sectionModel, partModel, $section) {
        // select elements for section, to avoid selecting the same elements in subsections
        const $itemRefsWrapper = $section.children('.itemrefs-wrapper');
        const $rubBlocks = $section.children('.rublocks');
        const $titleWithActions = $section.children('h2');

        const modelOverseer = creatorContext.getModelOverseer();
        const config = modelOverseer.getConfig();

        // set item session control to use test part options if section level isn't set
        if (!sectionModel.itemSessionControl) {
            sectionModel.itemSessionControl = {};
        }
        if (!sectionModel.categories) {
            sectionModel.categories = defaults().categories;
        }
        _.defaults(sectionModel.itemSessionControl, partModel.itemSessionControl);

        if (!_.isEmpty(config.routes.blueprintsById)) {
            sectionModel.hasBlueprint = true;
        }
        actions.properties($titleWithActions, 'section', sectionModel, propHandler);
        actions.move($titleWithActions, 'sections', 'section');
        actions.displayItemWrapper($section);

        subsections();
        itemRefs();
        acceptItemRefs();
        rubricBlocks();
        addRubricBlock();
        addSubsection();

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

            // sectionModel.selection will be filled by binded values from template section-props.tpl
            // if sectionModel.selection from server response it has 'qti-type'
            const isSelectionFromServer = !!(sectionModel.selection && sectionModel.selection['qti-type']);

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
                    delete sectionModel.selection;
                }
            });

            $selectionSwitcher.prop('checked', isSelectionFromServer).trigger('change');

            //listen for databinder change to update the test part title
            const $title = $('[data-bind=title]', $titleWithActions);
            $view.on('change.binder', function (e) {
                if (e.namespace === 'binder' && sectionModel['qti-type'] === 'assessmentSection') {
                    $title.text(sectionModel.title);
                }
            });

            // deleted.deleter event fires only on the parent nodes (testparts, sections, etc)
            // Since it "bubles" we can subsctibe only to the highest parent node
            $section.parents('.testparts').on('deleted.deleter', removePropHandler);

            //section level category configuration
            categoriesProperty($view);

            if (typeof sectionModel.hasBlueprint !== 'undefined') {
                blueprintProperty($view);
            }

            actions.displayCategoryPresets($section);

            function removePropHandler(e, $deletedNode) {
                const validIds = [$section.parents('.testpart').attr('id'), $section.attr('id')];

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
            if (!sectionModel.sectionParts) {
                sectionModel.sectionParts = [];
            }

            subsectionsHelper.getSubsections($section).each(function () {
                const $subsection = $(this);
                const index = $subsection.data('bind-index');
                if (!sectionModel.sectionParts[index]) {
                    sectionModel.sectionParts[index] = {};
                }

                subsectionView.setUp(creatorContext, sectionModel.sectionParts[index], sectionModel, $subsection);
            });
        }
        /**
         * Set up the item refs that already belongs to the section
         * @private
         */
        function itemRefs() {
            if (!sectionModel.sectionParts) {
                sectionModel.sectionParts = [];
            }
            $('.itemref', $itemRefsWrapper).each(function () {
                const $itemRef = $(this);
                const index = $itemRef.data('bind-index');
                if (!sectionModel.sectionParts[index]) {
                    sectionModel.sectionParts[index] = {};
                }

                itemRefView.setUp(creatorContext, sectionModel.sectionParts[index], sectionModel, partModel, $itemRef);
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
                                sectionModel.itemSessionControl &&
                                !_.isUndefined(sectionModel.itemSessionControl.maxAttempts)
                            ) {
                                //for a matter of consistency, the itemRef will "inherit" the itemSessionControl configuration from its parent section
                                defaultItemData.itemSessionControl = _.clone(sectionModel.itemSessionControl);
                            }

                            //the itemRef should also "inherit" the categories set at the item level
                            const categories = sectionCategory.getCategories(sectionModel);
                            defaultItemData.categories = _.clone(categories.propagated) || [];

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
            $(document)
                .off('add.binder', `#${$section.attr('id')} > .itemrefs-wrapper .itemrefs`)
                .on('add.binder', `#${$section.attr('id')} > .itemrefs-wrapper .itemrefs`, function (e, $itemRef) {
                    if (
                        e.namespace === 'binder' &&
                        $itemRef.hasClass('itemref') &&
                        !$itemRef.parents('.subsection').length
                    ) {
                        const index = $itemRef.data('bind-index');
                        const itemRefModel = sectionModel.sectionParts[index];

                        //initialize the new item ref
                        itemRefView.setUp(creatorContext, itemRefModel, sectionModel, partModel, $itemRef);

                        /**
                         * @event modelOverseer#item-add
                         * @param {Object} itemRefModel
                         */
                        modelOverseer.trigger('item-add', itemRefModel);
                    }
                });
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
            if (!sectionModel.rubricBlocks) {
                sectionModel.rubricBlocks = [];
            }
            $('.rubricblock', $rubBlocks).each(function () {
                const $rubricBlock = $(this);
                const index = $rubricBlock.data('bind-index');
                if (!sectionModel.rubricBlocks[index]) {
                    sectionModel.rubricBlocks[index] = {};
                }

                rubricBlockView.setUp(creatorContext, sectionModel.rubricBlocks[index], $rubricBlock);
            });

            //opens the rubric blocks section if they are there.
            if (sectionModel.rubricBlocks.length > 0) {
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
            $(document)
                .off('add.binder', `#${$section.attr('id')} > .rublocks .rubricblocks`)
                .on('add.binder', `#${$section.attr('id')} > .rublocks .rubricblocks`, function (e, $rubricBlock) {
                    if (
                        e.namespace === 'binder' &&
                        $rubricBlock.hasClass('rubricblock') &&
                        !$rubricBlock.parents('.subsection').length
                    ) {
                        const index = $rubricBlock.data('bind-index');
                        const rubricModel = sectionModel.rubricBlocks[index] || {};

                        $('.rubricblock-binding', $rubricBlock).html('<p>&nbsp;</p>');
                        rubricBlockView.setUp(creatorContext, rubricModel, $rubricBlock);

                        /**
                         * @event modelOverseer#rubric-add
                         * @param {Object} rubricModel
                         */
                        modelOverseer.trigger('rubric-add', rubricModel);
                    }
                });
        }

        /**
         * Set up the category property
         * @private
         * @param {jQuery} $view - the $view object containing the $select
         * @fires modelOverseer#category-change
         */
        function categoriesProperty($view) {
            const categories = sectionCategory.getCategories(sectionModel),
                categorySelector = categorySelectorFactory($view);

            categorySelector.createForm(categories.all);
            updateFormState(categorySelector);

            $view.on('propopen.propview', function () {
                updateFormState(categorySelector);
            });

            $view.on('set-default-categories', function () {
                sectionModel.categories = defaults().categories;
                updateFormState(categorySelector);
            });

            categorySelector.on('category-change', function (selected, indeterminate) {
                sectionCategory.setCategories(sectionModel, selected, indeterminate);

                modelOverseer.trigger('category-change');
            });
        }

        function updateFormState(categorySelector) {
            const categories = sectionCategory.getCategories(sectionModel);
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
                if (typeof sectionModel.blueprint === 'undefined') {
                    sectionBlueprint
                        .getBlueprint(config.routes.blueprintByTestSection, sectionModel)
                        .success(function (data) {
                            if (!_.isEmpty(data)) {
                                if (sectionModel.blueprint !== '') {
                                    sectionModel.blueprint = data.uri;
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
                sectionBlueprint.setBlueprint(sectionModel, blueprint);
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
                target: $section.children('.subsections'),
                content: templates.subsection,
                templateData: function (cb) {
                    //create a new subsection model object to be bound to the template
                    let sectionParts = [];
                    if ($section.data('movedItems')) {
                        sectionParts = $section.data('movedItems');
                        $section.removeData('movedItems');
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
                        sectionModel.sectionParts[0] &&
                        qtiTestHelper.filterQtiType(sectionModel.sectionParts[0], 'assessmentItemRef')
                    ) {
                        // section has item(s)
                        const $parent = $section.parents('.sections');
                        const index = $('.section', $parent).index($section);
                        const confirmMessage = __(
                            'The items contained in <b>%s %s</b> will be moved into the new <b>%s %s</b>. Do you wish to proceed?',
                            `${index + 1}.`,
                            sectionModel.title,
                            `${index + 1}.1.`,
                            defaults().sectionTitlePrefix
                        );
                        const acceptFunction = () => {
                            $section.data('movedItems', _.clone(sectionModel.sectionParts));
                            sectionModel.sectionParts = [];
                            $('.itemrefs', $itemRefsWrapper).empty();
                            executeAdd();
                        };
                        confirmDialog(confirmMessage, acceptFunction, () => {}, optionsConfirmDialog)
                            .getDom()
                            .find('.buttons')
                            .css('display', 'flex')
                            .css('flex-direction', 'row-reverse');
                    } else {
                        if (!sectionModel.sectionParts.length && sectionModel.categories.length) {
                            $section.data('movedCategories', _.clone(sectionModel.categories));
                        }
                        executeAdd();
                    }
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document)
                .off('add.binder', `#${$section.attr('id')} > .subsections`)
                .on('add.binder', `#${$section.attr('id')} > .subsections`, function (e, $subsection) {
                    if (
                        e.namespace === 'binder' &&
                        $subsection.hasClass('subsection') &&
                        !$subsection.parents('.subsection').length
                    ) {
                        // first level of subsection
                        const subsectionIndex = $subsection.data('bind-index');
                        const subsectionModel = sectionModel.sectionParts[subsectionIndex];

                        if ($section.data('movedCategories')) {
                            subsectionModel.categories = $section.data('movedCategories');
                            $section.removeData('movedCategories');
                        }

                        //initialize the new subsection
                        subsectionView.setUp(creatorContext, subsectionModel, sectionModel, $subsection);
                        // hide 'Items' block and category-presets for current section
                        actions.displayItemWrapper($section);
                        actions.displayCategoryPresets($section);
                        // set index for new subsection
                        actions.updateTitleIndex($subsection);

                        /**
                         * @event modelOverseer#section-add
                         * @param {Object} subsectionModel
                         */
                        modelOverseer.trigger('section-add', subsectionModel);
                    }
                });
        }
    }

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    function listenActionState() {
        $('.sections').each(function () {
            const $sections = $('.section', $(this));

            actions.removable($sections, 'h2');
            actions.movable($sections, 'section', 'h2');
            actions.updateTitleIndex($sections);
        });

        $(document)
            .on('delete', function (e) {
                let $parent;
                const $target = $(e.target);
                if ($target.hasClass('section')) {
                    $parent = $target.parents('.sections');
                    actions.disable($parent.find('.section'), 'h2');
                    setTimeout(() => {
                        // element detached after event
                        const $sectionsAndsubsections = $('.section,.subsection', $parent);
                        actions.updateTitleIndex($sectionsAndsubsections);
                    }, 100);
                }
            })
            .on('add change undo.deleter deleted.deleter', function (e) {
                const $target = $(e.target);
                if ($target.hasClass('section') || $target.hasClass('sections')) {
                    const $sectionsContainer = $target.hasClass('sections') ? $target : $target.parents('.sections');
                    const $sections = $('.section', $sectionsContainer);
                    actions.removable($sections, 'h2');
                    actions.movable($sections, 'section', 'h2');
                    if (e.type === 'undo' || e.type === 'change') {
                        const $sectionsAndsubsections = $('.section,.subsection', $sectionsContainer);
                        actions.updateTitleIndex($sectionsAndsubsections);
                    } else if (e.type === 'add') {
                        const $newSection = $('.section:last', $sectionsContainer);
                        actions.updateTitleIndex($newSection);
                    }
                }
            })
            .on('open.toggler', '.rub-toggler', function (e) {
                if (e.namespace === 'toggler') {
                    $(this).parents('h2').addClass('active');
                }
            })
            .on('close.toggler', '.rub-toggler', function (e) {
                if (e.namespace === 'toggler') {
                    $(this).parents('h2').removeClass('active');
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

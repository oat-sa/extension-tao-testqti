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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/controller/creator/views/property',
    'taoQtiTest/controller/creator/helpers/subsection'
], function ($, propertyView, subsectionsHelper) {
    'use strict';

    const disabledClass = 'disabled';
    const activeClass = 'active';
    const btnOnClass = 'tlb-button-on';

    /**
     * Set up the property view for an element
     * @param {jQueryElement} $container - that contains the property opener
     * @param {String} template - the name of the template to give to the propertyView
     * @param {Object} model - the model to bind
     * @param {PropertyViewCallback} cb - execute at view setup phase
     */
    function properties($container, template, model, cb) {
        let propView = null;
        $container.find('.property-toggler').on('click', function (e) {
            e.preventDefault();
            const $elt = $(this);
            if (!$(this).hasClass(disabledClass)) {
                $elt.blur(); //to remove the focus

                if (propView === null) {
                    $container.addClass(activeClass);
                    $elt.addClass(btnOnClass);

                    propView = propertyView(template, model);
                    propView.open();

                    propView.onOpen(function () {
                        $container.addClass(activeClass);
                        $elt.addClass(btnOnClass);
                    });
                    propView.onClose(function () {
                        $container.removeClass(activeClass);
                        $elt.removeClass(btnOnClass);
                    });

                    if (typeof cb === 'function') {
                        cb(propView);
                    }
                } else {
                    propView.toggle();
                }
            }
        });
    }

    /**
     * Enable to move an element
     * @param {jQueryElement} $actionContainer - where the mover is
     * @param {String} containerClass - the cssClass of the element container
     * @param {String} elementClass - the cssClass to identify elements
     */
    function move($actionContainer, containerClass, elementClass) {
        const $element = $actionContainer.closest('.' + elementClass);
        const $container = $element.closest('.' + containerClass);

        //move up an element
        $('.move-up', $actionContainer).click(function (e) {
            let $elements, index;

            //prevent default and click during animation
            e.preventDefault();
            if ($element.is(':animated')) {
                return false;
            }

            //get the position
            $elements = $container.children('.' + elementClass);
            index = $elements.index($element);
            if (index > 0) {
                $element.fadeOut(200, () => {
                    $element
                        .insertBefore($container.children(`.${elementClass}:eq(${index - 1})`))
                        .fadeIn(400, () => $container.trigger('change'));
                });
            }
        });

        //move down an element
        $('.move-down', $actionContainer).click(function (e) {
            let $elements, index;

            //prevent default and click during animation
            e.preventDefault();
            if ($element.is(':animated')) {
                return false;
            }

            //get the position
            $elements = $('.' + elementClass, $container);
            index = $elements.index($element);
            if (index < $elements.length - 1 && $elements.length > 1) {
                $element.fadeOut(200, () => {
                    $element
                        .insertAfter($container.children(`.${elementClass}:eq(${index + 1})`))
                        .fadeIn(400, () => $container.trigger('change'));
                });
            }
        });
    }

    /**
     * Update the movable state of an element
     * @param {jQueryElement} $container - the movable elements (scopped)
     * @param {String} elementClass - the cssClass to identify elements
     * @param {String} actionContainerElt - the element name that contains the actions
     */
    function movable($container, elementClass, actionContainerElt) {
        $container.each(function () {
            const $elt = $(this);
            const $actionContainer = $(actionContainerElt, $elt);

            const index = $container.index($elt);
            const $moveUp = $('.move-up', $actionContainer);
            const $moveDown = $('.move-down', $actionContainer);

            //only one test part, no moving
            if ($container.length === 1) {
                $moveUp.addClass(disabledClass);
                $moveDown.addClass(disabledClass);

                //testpart is the first, only moving down
            } else if (index === 0) {
                $moveUp.addClass(disabledClass);
                $moveDown.removeClass(disabledClass);

                //testpart is the lasst, only moving up
            } else if (index >= $container.length - 1) {
                $moveDown.addClass(disabledClass);
                $moveUp.removeClass(disabledClass);

                //or enable moving top/bottom
            } else {
                $moveUp.removeClass(disabledClass);
                $moveDown.removeClass(disabledClass);
            }
        });
    }

    /**
     * Update the removable state of an element
     * @param {jQueryElement} $container - that contains the removable action
     * @param {String} actionContainerElt - the element name that contains the actions
     */
    function removable($container, actionContainerElt) {
        $container.each(function () {
            const $elt = $(this);
            const $actionContainer = $elt.children(actionContainerElt);
            const $delete = $('[data-delete]', $actionContainer);

            if ($container.length <= 1 && !$elt.hasClass('subsection')) {
                $delete.addClass(disabledClass);
            } else {
                $delete.removeClass(disabledClass);
            }
        });
    }

    /**
     * Disable all the actions of the target
     * @param {jQueryElement} $container - that contains the the actions
     * @param {String} actionContainerElt - the element name that contains the actions
     */
    function disable($container, actionContainerElt) {
        $container.children(actionContainerElt).find('[data-delete],.move-up,.move-down').addClass(disabledClass);
    }

    /**
     * Enable all the actions of the target
     * @param {jQueryElement} $container - that contains the the actions
     * @param {String} actionContainerElt - the element name that contains the actions
     */
    function enable($container, actionContainerElt) {
        $container.children(actionContainerElt).find('[data-delete],.move-up,.move-down').removeClass(disabledClass);
    }

    /**
     * Hides/shows container for adding items inside a section checking if there is at least
     * one subsection inside of it. As delete subsection event is triggered before subsection
     * container is actually removed from section container, we need to have conditional flow
     * @param {Object | null} sectionModel - section model
     * @param {Object} sectionContainer - section jquery container
     * @param {boolean} subsectionDeleted - if subsection was deleted
     * @param {boolean} undoSubsectionDeletion - if subsection was recreated with undo action
     */
    function displayItemWrapper(
        sectionModel,
        sectionContainer,
        subsectionDeleted = false,
        undoSubsectionDeletion = false
    ) {
        const $elt = $('.itemrefs-wrapper:first', sectionContainer);
        if (subsectionDeleted) {
            if (subsectionsHelper.getSubsections(sectionContainer).length > 1) {
                $elt.hide();
            } else {
                $elt.show();
            }
        } else if (undoSubsectionDeletion) {
            if (subsectionsHelper.getSubsections(sectionContainer).length >= 1) {
                $elt.hide();
            } else {
                $elt.show();
            }
        } else if (
            sectionModel.sectionParts &&
            sectionModel.sectionParts.length > 0 &&
            sectionModel.sectionParts[0]['qti-type'] === 'assessmentSection'
        ) {
            $elt.hide();
        } else {
            $elt.show();
        }
    }

    /**
     * Update delete selector for 2nd level subsections
     *@param {jQueryElement} $actionContainer - action's container
     */
    function updateDeleteSelector($actionContainer) {
        const $deleteButton = $actionContainer.find('.delete-subsection');
        if ($deleteButton.parents('.subsection').length > 1) {
            const deleteSelector = $deleteButton.data('delete');
            $deleteButton.attr('data-delete', `${deleteSelector} .subsection`);
        }
    }

    /**
     * The actions gives you shared behavior for some actions.
     *
     * @exports taoQtiTest/controller/creator/views/actions
     */
    return {
        properties: properties,
        move: move,
        removable: removable,
        movable: movable,
        disable: disable,
        enable: enable,
        displayItemWrapper: displayItemWrapper,
        updateDeleteSelector: updateDeleteSelector
    };
});

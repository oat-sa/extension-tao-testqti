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
define(['jquery', 'uikitLoader', 'core/databinder', 'taoQtiTest/controller/creator/templates/index'], function (
    $,
    ui,
    DataBinder,
    templates
) {
    'use strict';

    /**
     * @callback PropertyViewCallback
     * @param {propertyView} propertyView - the view object
     */

    /**
     * The PropertyView setup the property panel component
     * @param {String} tmplName
     * @param {Object} model
     * @exports taoQtiTest/controller/creator/views/property
     * @returns {Object}
     */
    const propView = function propView(tmplName, model) {
        const $container = $('.test-creator-props');
        const template = templates.properties[tmplName];
        let $view;

        /**
         * Opens the view for the 1st time
         */
        const open = function propOpen() {
            const binderOptions = {
                templates: templates.properties
            };
            $container.children('.props').hide().trigger('propclose.propview');
            $view = $(template(model)).appendTo($container).filter('.props');

            //start listening for DOM compoenents inside the view
            ui.startDomComponent($view);

            //start the data binding
            const databinder = new DataBinder($view, model, binderOptions);
            databinder.bind();

            propValidation();

            $view.trigger('propopen.propview');

            // contains identifier from model, needed for validation on keyup for identifiers
            // jQuesy selector for Id with dots don't work
            // dots are allowed for id by default see taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier
            // need to use attr
            const $identifier = $view.find(`[id="props-${model.identifier}"]`);
            $view.on('change.binder', function (e) {
                if (e.namespace === 'binder' && $identifier.length) {
                    $identifier.text(model.identifier);
                }
            });
        };

        /**
         * Get the view container element
         * @returns {jQueryElement}
         */
        const getView = function propGetView() {
            return $view;
        };

        /**
         * Check wheter the view is displayed
         * @returns {boolean} true id opened
         */
        const isOpen = function propIsOpen() {
            return $view.css('display') !== 'none';
        };

        /**
         * Bind a callback on view open
         * @param {PropertyViewCallback} cb
         */
        const onOpen = function propOnOpen(cb) {
            $view.on('propopen.propview', function (e) {
                e.stopPropagation();
                cb();
            });
        };

        /**
         * Bind a callback on view close
         * @param {PropertyViewCallback} cb
         */
        const onClose = function propOnClose(cb) {
            $view.on('propclose.propview', function (e) {
                e.stopPropagation();
                cb();
            });
        };

        /**
         * Removes the property view
         */
        const destroy = function propDestroy() {
            $view.remove();
        };

        /**
         * Toggles the property view display
         */
        const toggle = function propToggle() {
            $container.children('.props').not($view).hide().trigger('propclose.propview');
            if (isOpen()) {
                $view.hide().trigger('propclose.propview');
            } else {
                $view.show().trigger('propopen.propview');
            }
        };

        /**
         * Set up the validation on the property view
         * @private
         */
        function propValidation() {
            $view.on('validated.group', function(e, isValid){
                const $warningIconSelector = $('span.icon-warning');
                const $test = $('.tlb-button-on').parents('.test-creator-test');

                // finds error current element if any
                let errors = $(e.currentTarget).find('span.validate-error');
                let currentTargetId = `[id="${$(e.currentTarget).find('span[data-bind="identifier"]').attr('id').slice(6)}"]`;
                
                if(e.namespace === 'group'){
                    if (isValid && errors.length === 0) {
                        //remove warning icon if validation fails
                        if($(e.currentTarget).hasClass('test-props')){
                         $($test).find($warningIconSelector).first().css('display', 'none');
                        }
                        $(currentTargetId).find($warningIconSelector).first().css('display', 'none');
                    } else {
                       //add warning icon if validation fails
                        if($(e.currentTarget).hasClass('test-props')){
                            $($test).find($warningIconSelector).first().css('display', 'inline');
                        }
                        $(currentTargetId).find($warningIconSelector).first().css('display', 'inline');
                    }
                }
            });

            $view.groupValidator({ events: ['keyup', 'change', 'blur'] });
        }

        return {
            open: open,
            getView: getView,
            isOpen: isOpen,
            onOpen: onOpen,
            onClose: onClose,
            destroy: destroy,
            toggle: toggle
        };
    };

    return propView;
});

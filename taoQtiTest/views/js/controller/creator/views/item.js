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
    'module',
    'jquery',
    'i18n',
    'core/logger',
    'taoQtiTest/provider/testItems',
    'ui/resource/selector',
    'ui/feedback'
], function (module, $, __, loggerFactory, testItemProviderFactory, resourceSelectorFactory, feedback) {
    'use strict';

    /**
     * Create a dedicated logger
     */
    const logger = loggerFactory('taoQtiTest/creator/views/item');

    /**
     * Let's you access the data
     */
    const testItemProvider = testItemProviderFactory();

    /**
     * Handles errors
     * @param {Error} err
     */
    const onError = function onError(err) {
        logger.error(err);
        feedback().error(err.message || __('An error occured while retrieving items'));
    };

    const ITEM_URI = 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item';

    /**
     * The ItemView setup items related components
     * @exports taoQtiTest/controller/creator/views/item
     * @param {jQueryElement} $container - where to append the view
     */
    return function itemView($container) {
        const filters = module.config().BRS || false; // feature flag BRS (search by metadata) in Test Authoring
        const selectorConfig = {
            type: __('items'),
            selectionMode: resourceSelectorFactory.selectionModes.multiple,
            selectAllPolicy: resourceSelectorFactory.selectAllPolicies.visible,
            classUri: ITEM_URI,
            classes: [
                {
                    label: 'Item',
                    uri: ITEM_URI,
                    type: 'class'
                }
            ],
            filters
        };
        const loadedClassChildren = Object.create(null);
        const pendingClassChildren = Object.create(null);
        const classHasSubclasses = Object.create(null);
        const classNodeExpansion = Object.create(null);
        let currentClassUri = selectorConfig.classUri;
        const classSelectorOptionsSelector = '.class-selector .options';
        const classSelectorTogglerClass = 'class-selector-toggler';
        classHasSubclasses[ITEM_URI] = true;

        //set up the resource selector with one root class Item in classSelector
        const resourceSelector = resourceSelectorFactory($container, selectorConfig)
            .on('classchange', function (classUri) {
                if (!classUri) {
                    return;
                }

                currentClassUri = classUri;

                Promise.resolve(loadClassChildren(classUri)).catch(onError);
                scheduleClassSelectorSync();

                //by changing the class we need to change the
                //properties filters
                requestAndApplyClassFilters(classUri, filters => {
                    this.updateFilters(filters);
                })
                .catch(onError);
            })
            .on('render', function () {
                $container.on('itemselected.creator', () => {
                    this.clearSelection();
                });

                bindClassSelectorNavigation();
                scheduleClassSelectorSync();
            })
            .on('query', function (params) {
                //ask the server the item from the component query
                testItemProvider
                    .getItems(params)
                    .then(items => {
                        //and update the item list
                        this.update(items, params);
                    })
                    .catch(onError);
            })
            .on('update', scheduleClassSelectorSync)
            .on('change', function (values) {
                /**
                 * We've got a selection, triggered on the view container
                 *
                 * TODO replace jquery events by the eventifier
                 *
                 * @event jQuery#itemselect.creator
                 * @param {Object[]} values - the selection
                 */
                $container.trigger('itemselect.creator', [values]);
            });

        function loadClassChildren(classUri) {
            if (!classUri || loadedClassChildren[classUri]) {
                return true;
            }

            if (pendingClassChildren[classUri]) {
                return pendingClassChildren[classUri];
            }

            pendingClassChildren[classUri] = testItemProvider
                .getItemClassChildren(classUri)
                .then(function (children) {
                    const classChildren = children || [];

                    (children || []).forEach(node => {
                        if (node && node.uri && typeof node.hasChildren === 'boolean') {
                            classHasSubclasses[node.uri] = node.hasChildren;
                        }
                        resourceSelector.addClassNode(node, classUri);
                    });
                    classHasSubclasses[classUri] = classChildren.length > 0;
                    loadedClassChildren[classUri] = true;
                    scheduleClassSelectorSync();
                    delete pendingClassChildren[classUri];
                })
                .catch(function (err) {
                    delete pendingClassChildren[classUri];
                    throw err;
                });

            return pendingClassChildren[classUri];
        }

        function getClassUri($classNode) {
            return $classNode.children('a[data-uri]').data('uri');
        }

        function isClassNodeExpanded(classUri) {
            if (!classUri) {
                return false;
            }

            if (Object.prototype.hasOwnProperty.call(classNodeExpansion, classUri)) {
                return classNodeExpansion[classUri];
            }

            return classUri === ITEM_URI;
        }

        function setClassNodeExpanded($classNode, expanded) {
            const classUri = getClassUri($classNode);
            const $children = $classNode.children('ul');
            const hasChildren = $children.children('li').length > 0;
            const $toggler = $classNode.children(`.${classSelectorTogglerClass}`);
            const canExpand = classHasSubclasses[classUri] === true;

            if (!classUri || !$toggler.length) {
                return;
            }

            if (!canExpand || (loadedClassChildren[classUri] && !hasChildren)) {
                delete classNodeExpansion[classUri];
                $children.hide();
                $classNode.addClass('closed');
                $toggler
                    .text('')
                    .attr('aria-hidden', 'true')
                    .removeAttr('tabindex')
                    .removeAttr('aria-label')
                    .removeAttr('aria-busy')
                    .removeClass('clickable')
                    .css('cursor', 'default');
                return;
            }

            classNodeExpansion[classUri] = Boolean(expanded);
            $children.toggle(Boolean(expanded));
            $classNode.toggleClass('closed', !expanded);
            $toggler
                .text('')
                .attr('aria-hidden', 'false')
                .attr('tabindex', '0')
                .attr('aria-label', expanded ? __('Collapse class') : __('Expand class'))
                .removeAttr('aria-busy')
                .addClass('clickable');
        }

        function syncClassSelectorTree() {
            $(`${classSelectorOptionsSelector} li`, $container).each(function () {
                const $classNode = $(this);
                const $classLink = $classNode.children('a[data-uri]');
                const classUri = $classLink.data('uri');
                let $toggler = $classNode.children(`.${classSelectorTogglerClass}`);

                if (!$classLink.length || !classUri) {
                    return;
                }

                if (!$toggler.length) {
                    $toggler = $('<span>', {
                        class: `${classSelectorTogglerClass} class-toggler clickable`,
                        role: 'button',
                        tabindex: '0',
                        'aria-label': __('Toggle class children')
                    });
                    $classLink.before($toggler);
                }

                if (classHasSubclasses[classUri] !== true) {
                    setClassNodeExpanded($classNode, false);
                    return;
                }

                setClassNodeExpanded($classNode, isClassNodeExpanded(classUri));
            });
        }

        function scheduleClassSelectorSync() {
            setTimeout(syncClassSelectorTree, 0);
        }

        function bindClassSelectorNavigation() {
            $container.off('.creatorClassSelector');

            function handleExpandRequest($classNode, $trigger) {
                if (!$trigger || !$trigger.length || $trigger.attr('aria-hidden') === 'true') {
                    return;
                }

                const classUri = getClassUri($classNode);
                const hasChildren = $classNode.children('ul').children('li').length > 0;

                if (!classUri) {
                    return;
                }

                if (hasChildren && isClassNodeExpanded(classUri)) {
                    setClassNodeExpanded($classNode, false);
                    return;
                }

                $trigger.attr('aria-busy', 'true');

                Promise.resolve(loadClassChildren(classUri))
                    .then(() => {
                        setClassNodeExpanded($classNode, true);
                        scheduleClassSelectorSync();
                    })
                    .catch(err => {
                        onError(err);
                        scheduleClassSelectorSync();
                    });
            }

            $container.on('click.creatorClassSelector', `${classSelectorOptionsSelector} .${classSelectorTogglerClass}`, function (event) {
                event.preventDefault();
                event.stopPropagation();
                handleExpandRequest($(this).closest('li'), $(this));
            });

            // Clicking the folder pseudo-icon area targets the LI itself; treat it as expand/collapse.
            $container.on('click.creatorClassSelector', `${classSelectorOptionsSelector} li`, function (event) {
                if (event.target !== this) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                handleExpandRequest($(this), $(this).children(`.${classSelectorTogglerClass}`));
            });

            $container.on('keydown.creatorClassSelector', `${classSelectorOptionsSelector} .${classSelectorTogglerClass}`, function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    $(this).trigger('click');
                }
            });
        }

        function requestAndApplyClassFilters(classUri, applyFilters) {
            if (!classUri) {
                return Promise.resolve();
            }

            const requestedClassUri = classUri;

            return testItemProvider.getItemClassProperties(classUri).then(filters => {
                // Ignore stale responses from previously selected classes.
                if (requestedClassUri !== currentClassUri) {
                    return;
                }

                applyFilters(filters);
            });
        }

        // initialize filters and first level classes lazily from the root class
        Promise.resolve(loadClassChildren(selectorConfig.classUri))
            .then(scheduleClassSelectorSync)
            .catch(onError);
        requestAndApplyClassFilters(selectorConfig.classUri, function (filters) {
            selectorConfig.filters = filters;
            resourceSelector.updateFilters(filters);
        })
            .catch(onError);
    };
});

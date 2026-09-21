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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Thin Test Creator host for shared authoring comments (NYSED-15).
 * Mounts taoItems store + commentsPanel with RESOURCE_TYPE.TEST.
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoItems/services/itemComments',
    'taoItems/comments/itemCommentsStore',
    'taoItems/comments/commentsPanel',
    'css!taoQtiTestCss/test-comments'
], function ($, _, __, itemCommentsApi, itemCommentsStoreFactory, commentsPanelFactory) {
    'use strict';

    const TAB_PROPERTIES = 'properties';
    const TAB_COMMENTS = 'comments';
    const NS = '.testComments';

    /**
     * @param {object} options
     * @param {string} options.testUri
     * @param {jQuery|HTMLElement} [options.$container]
     * @returns {object|null}
     */
    function init(options) {
        const testUri = options && options.testUri;
        const storeFactory = (options && options.storeFactory) || itemCommentsStoreFactory;
        const panelFactory = (options && options.panelFactory) || commentsPanelFactory;
        if (!testUri) {
            return null;
        }

        const $root = options.$container ? $(options.$container) : $('#test-creator');
        const $propsSection = $root.find('.test-creator-props');
        const $modeTabs = $propsSection.find('#test-creator-mode-tabs');
        const $commentsTab = $modeTabs.find('[data-tab="comments"]');
        const $propertiesPanel = $propsSection.find('[data-mode-panel="properties"]');
        const $commentsPanel = $propsSection.find('[data-mode-panel="comments"]');
        const $commentsHost = $commentsPanel.find('.test-comments-content-panel');

        if (!$modeTabs.length || !$commentsHost.length) {
            return null;
        }

        const store = storeFactory({
            resourceUri: testUri,
            resourceType: itemCommentsApi.RESOURCE_TYPE.TEST
        });

        const panel = panelFactory({
            renderTo: $commentsHost,
            store: store
        });

        function updateCountLabel() {
            const label = $commentsTab.data('label') || __('Comments');
            $commentsTab.find('.tab-label').text(label);
            $commentsTab.attr('title', label).attr('aria-label', label);
        }

        function setMode(mode) {
            const isComments = mode === TAB_COMMENTS;

            $modeTabs.find('[role="tab"]').each(function () {
                const $tab = $(this);
                const active = $tab.data('tab') === mode;
                $tab
                    .toggleClass('active', active)
                    .attr('aria-selected', active ? 'true' : 'false')
                    .attr('tabindex', active ? '0' : '-1');
            });

            $propertiesPanel.prop('hidden', isComments);
            $commentsPanel.prop('hidden', !isComments);

            // Property forms append as .props siblings of the mode panels.
            $propsSection.children('.props').prop('hidden', isComments);

            if (isComments) {
                panel.refresh();
            }
        }

        function getTabs() {
            return $modeTabs.find('[role="tab"]');
        }

        function focusTabByIndex(index) {
            const $tabs = getTabs();
            const count = $tabs.length;

            if (!count) {
                return;
            }

            const normalizedIndex = (index + count) % count;
            $tabs.eq(normalizedIndex).trigger('focus');
        }

        store.on(
            [
                `loaded${NS}`,
                `countchange${NS}`,
                `submitted${NS}`,
                `updated${NS}`,
                `resolved${NS}`,
                `deleted${NS}`
            ].join(' '),
            () => {
                updateCountLabel();
            }
        );

        $modeTabs.on(`click${NS}`, '[role="tab"]', e => {
            e.preventDefault();
            const mode = $(e.currentTarget).data('tab') || TAB_PROPERTIES;
            setMode(mode);
        });

        $modeTabs.on(`keydown${NS}`, '[role="tab"]', e => {
            const $tab = $(e.currentTarget);
            const mode = $tab.data('tab') || TAB_PROPERTIES;
            const $tabs = getTabs();
            const tabIndex = $tabs.index($tab);

            switch (e.key) {
                case 'Enter':
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    setMode(mode);
                    $tab.trigger('focus');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    focusTabByIndex(tabIndex + 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    focusTabByIndex(tabIndex - 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    focusTabByIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    focusTabByIndex($tabs.length - 1);
                    break;
                default:
                    break;
            }
        });

        // Gear / property forms live in Properties mode.
        $propsSection.on(`propopen.propview${NS}`, () => {
            setMode(TAB_PROPERTIES);
        });

        updateCountLabel();
        setMode(TAB_PROPERTIES);
        store.load().catch(_.noop);

        return {
            store: store,
            panel: panel,
            setMode: setMode,
            destroy() {
                $modeTabs.off(NS);
                $propsSection.off(NS);
                store.off(NS);
                panel.destroy();
            }
        };
    }

    return {
        init: init
    };
});

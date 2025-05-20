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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'ui/tooltip',
    'select2'
], function ($, _, __, eventifier, tooltip) {
    'use strict';

    let presets = [];
    let globalValue = '';
    let instances = [];
    let updating = false;

    const Select2Utils = {
        setValue($el, value) {
            try {
                if ($el.data('select2')) {
                    $el.select2('val', value || '');
                } else {
                    $el.val(value || '');
                }
            } catch (e) {
                $el.val(value || '');
            }
        },

        destroy($el) {
            try {
                if ($el.data('select2')) {
                    $el.off('change.scale');
                    $el.select2('destroy');
                }
            } catch (e) {
            }
        },

        init($el, data, onChange) {
            this.destroy($el);

            $el.select2({
                width: '100%',
                tags: true,
                multiple: false,
                tokenSeparators: null,
                createSearchChoice: (term) => term.match(/^[a-zA-Z0-9_-]+$/) ? {id: term, text: term} : null,
                formatNoMatches: () => __('Scale name not allowed'),
                maximumInputLength: 32,
                data: data
            });

            $el.off('change.scale').on('change.scale', onChange);
        }
    };

    /**
     * Main scale selector factory
     */
    function scaleSelectorFactory($container) {
        const $input = $container.find('[name="interpretation"]');

        const instance = {
            createForm(currentValue) {
                this._register();
                this._initSelect2();
                this._setValue(globalValue || currentValue || '');
                tooltip.lookup($container);
            },

            updateFormState(value) {
                if (!updating) {
                    globalValue = value || '';
                    this._syncAll();
                }
            },

            clearSelection() {
                this._setValue('');
                this._syncAll();
            },

            updateScale() {
                const value = $input.val() || '';
                this.trigger('interpretation-change', value || null);
            },

            destroy() {
                this._unregister();
                Select2Utils.destroy($input);
            },

            _register() {
                if (instances.indexOf(this) === -1) {
                    instances.push(this);
                }
            },

            _unregister() {
                const index = instances.indexOf(this);
                if (index > -1) {
                    instances.splice(index, 1);
                }
            },

            _initSelect2() {
                const data = this._buildData();
                const onChange = () => {
                    if (!updating) {
                        setTimeout(() => this._onChange(), 10);
                    }
                };

                Select2Utils.init($input, data, onChange);
            },

            _buildData() {
                const data = presets.map(p => ({id: p.uri, text: p.label}));
                const currentValue = $input.val();

                if (currentValue && !presets.some(p => p.uri === currentValue)) {
                    data.push({id: currentValue, text: currentValue});
                }

                return data;
            },

            _setValue(value) {
                Select2Utils.setValue($input, value);
            },

            _onChange() {
                globalValue = $input.val() || '';
                this.updateScale();
                this._syncAll();
            },

            _syncAll() {
                if (updating) return;

                updating = true;

                instances.forEach(inst => {
                    if (inst !== this) {
                        inst._setValue(globalValue);
                    }
                });

                updating = false;

                scaleSelectorFactory.trigger('global-scale-change', globalValue);
            }
        };

        eventifier(instance);
        return instance;
    }

    scaleSelectorFactory.setPresets = function(newPresets) {
        presets = Array.isArray(newPresets) ? [...newPresets] : [];
    };

    scaleSelectorFactory.getGlobalScale = function() {
        return globalValue;
    };

    scaleSelectorFactory.setGlobalScale = function(value) {
        if (updating) return;

        globalValue = value || '';
        updating = true;

        instances.forEach(inst => inst._setValue(globalValue));

        updating = false;
        this.trigger('global-scale-change', globalValue);
    };

    scaleSelectorFactory.resetGlobalState = function() {
        globalValue = '';
        instances.length = 0;
        updating = false;
    };

    eventifier(scaleSelectorFactory);
    return scaleSelectorFactory;
});

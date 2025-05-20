/**
 * Synchronized Scale Selector - Simplified Version
 * All outcomes share the same scale value automatically
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
                    $el.trigger('change.select2');
                } else {
                    $el.val(value || '');
                }
            } catch (e) {
                $el.val(value || '');
            }
        },

        rebuildWithValue($el, value, data, onChange) {
            this.destroy($el);
            $el.val(value || '');

            $el.select2({
                width: '100%',
                tags: true,
                multiple: false,
                tokenSeparators: null,
                createSearchChoice: (term) => term.match(/^[a-zA-Z0-9_-]+$/) ? {id: term, text: term} : null,
                formatNoMatches: () => __('Scale name not allowed'),
                maximumSelectionSize: 1,
                maximumInputLength: 32,
                data: data
            });

            $el.off('change.scale').on('change.scale', onChange);
            $el.trigger('change.select2');
        },

        destroy($el) {
            try {
                if ($el.data('select2')) {
                    $el.off('change.scale');
                    $el.select2('destroy');
                }
            } catch (e) {
                // Ignore errors
            }
        },

        init($el, data, onChange) {
            this.destroy($el);

            $el.select2({
                width: '100%',
                tags: true,
                multiple: false,
                maximumSelectionSize: 1,
                tokenSeparators: null,
                createSearchChoice: (term) => term.match(/^[a-zA-Z0-9_-]+$/) ? {id: term, text: term} : null,
                formatNoMatches: () => __('Scale name not allowed'),
                maximumInputLength: 32,
                data: data
            });

            $el.off('change.scale').on('change.scale', onChange);
        },

        refresh($el) {
            try {
                if ($el.data('select2')) {
                    const currentVal = $el.val();
                    $el.select2('val', currentVal);
                    $el.trigger('change.select2');
                }
            } catch (e) {
                // Ignore errors
            }
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
                const data = this._buildData();
                const onChange = () => {
                    if (!updating) {
                        setTimeout(() => this._onChange(), 10);
                    }
                };
                Select2Utils.rebuildWithValue($input, value, data, onChange);
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

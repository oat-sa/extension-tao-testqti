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
 * Copyright (c) 2014-2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'module',
    'jquery',
    'lodash',
    'i18n',
    'ui/feedback',
    'core/databindcontroller',
    'services/translation',
    'taoQtiTest/controller/creator/qtiTestCreator',
    'taoQtiTest/controller/creator/views/item',
    'taoQtiTest/controller/creator/views/test',
    'taoQtiTest/controller/creator/views/testpart',
    'taoQtiTest/controller/creator/views/section',
    'taoQtiTest/controller/creator/views/itemref',
    'taoQtiTest/controller/creator/views/translation',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/scoring',
    'taoQtiTest/controller/creator/helpers/translation',
    'taoQtiTest/controller/creator/helpers/testModel',
    'taoQtiTest/controller/creator/helpers/categorySelector',
    'taoQtiTest/controller/creator/helpers/validators',
    'taoQtiTest/controller/creator/helpers/changeTracker',
    'taoQtiTest/controller/creator/helpers/featureVisibility',
    'taoTests/previewer/factory',
    'core/logger',
    'taoQtiTest/controller/creator/views/subsection'
], function (
    module,
    $,
    _,
    __,
    feedback,
    DataBindController,
    translationService,
    qtiTestCreatorFactory,
    itemView,
    testView,
    testPartView,
    sectionView,
    itemrefView,
    translationView,
    Dom2QtiEncoder,
    templates,
    qtiTestHelper,
    scoringHelper,
    translationHelper,
    testModelHelper,
    categorySelector,
    validators,
    changeTracker,
    featureVisibility,
    previewerFactory,
    loggerFactory,
    subsectionView
) {
    ('use strict');
    const logger = loggerFactory('taoQtiTest/controller/creator');

    /**
     * We assume the ClientLibConfigRegistry is filled up with something like this:
     * 'taoQtiTest/controller/creator/creator' => [
     *     'provider' => 'qtiTest',
     * ],
     *
     * Or, with something like this for allowing multiple buttons in case of several providers are available:
     * 'taoQtiTest/controller/creator/creator' => [
     *     'provider' => 'qtiTest',
     *     'providers' => [
     *         ['id' => 'qtiTest', 'label' => 'Preview'],
     *         ['id' => 'xxxx', 'label' => 'xxxx'],
     *         ...
     *     ],
     * ],
     */

    /**
     * The test creator controller is the main entry point
     * and orchestrates data retrieval and view/components loading.
     * @exports creator/controller
     */
    const Controller = {
        routes: {},

        /**
         * Start the controller, main entry method.
         * @public
         * @param {Object} options
         * @param {Object} options.labels - the list of item's labels to give to the ItemView
         * @param {Object} options.routes - action's urls
         * @param {Object} options.categoriesPresets - predefined category that can be set at the item or section level
         * @param {Boolean} [options.guidedNavigation=false] - feature flag for the guided navigation
         */
        start(options) {
            const $container = $('#test-creator');
            const $saver = $('#saver');
            const $menu = $('ul.test-editor-menu');
            const $back = $('#authoringBack');

            let creatorContext;
            let binder;
            let binderOptions;
            let modelOverseer;

            this.identifiers = [];

            options = _.merge(module.config(), options || {});
            options.routes = options.routes || {};
            options.labels = options.labels || {};
            options.categoriesPresets = featureVisibility.filterVisiblePresets(options.categoriesPresets) || {};
            options.guidedNavigation = options.guidedNavigation === true;
            options.translation = options.translation === true;

            const saveUrl = options.routes.save || '';
            options.testUri = decodeURIComponent(saveUrl.slice(saveUrl.indexOf('uri=') + 4));

            categorySelector.setPresets(options.categoriesPresets);

            //back button
            $back.on('click', e => {
                e.preventDefault();
                creatorContext.trigger('creatorclose');
            });

            let previewId = 0;
            const createPreviewButton = ({ id, label, uri = '' } = {}) => {
                // configured labels will need to to be registered elsewhere for the translations
                const translate = text => text && __(text);

                const btnIdx = previewId ? `-${previewId}` : '';
                const $button = $(
                    templates.menuButton({
                        id: `previewer${btnIdx}`,
                        testId: `preview-test${btnIdx}`,
                        icon: 'preview',
                        label: translate(label) || __('Preview')
                    })
                ).on('click', e => {
                    e.preventDefault();
                    if (!$(e.currentTarget).hasClass('disabled')) {
                        creatorContext.trigger('preview', id, uri);
                    }
                });
                if (!Object.keys(options.labels).length) {
                    $button.attr('disabled', true).addClass('disabled');
                }
                $menu.append($button);
                previewId++;
                return $button;
            };

            let previewButtons;

            if (options.translation) {
                previewButtons = [
                    createPreviewButton({ label: 'Preview original', uri: options.originResourceUri }),
                    createPreviewButton({ label: 'Preview translation' })
                ];
            } else {
                previewButtons = options.providers
                    ? options.providers.map(createPreviewButton)
                    : [createPreviewButton()];
            }

            const isTestContainsItems = () => {
                if ($container.find('.test-content').find('.itemref').length) {
                    previewButtons.forEach($previewer => $previewer.attr('disabled', false).removeClass('disabled'));
                    return true;
                } else {
                    previewButtons.forEach($previewer => $previewer.attr('disabled', true).addClass('disabled'));
                    return false;
                }
            };

            //set up the ItemView, give it a configured loadItems ref
            if (!options.translation) {
                itemView($('.test-creator-items .item-selection', $container));
            }

            // forwards some binder events to the model overseer
            $container.on('change.binder delete.binder', (e, model) => {
                if (e.namespace === 'binder' && model && modelOverseer) {
                    modelOverseer.trigger(e.type, model);
                }
            });

            //Data Binding options
            binderOptions = _.merge(options.routes, {
                filters: {
                    isItemRef: value => qtiTestHelper.filterQtiType(value, 'assessmentItemRef'),
                    isSection: value => qtiTestHelper.filterQtiType(value, 'assessmentSection')
                },
                encoders: {
                    dom2qti: Dom2QtiEncoder
                },
                templates: templates,
                beforeSave(model) {
                    //ensure the qti-type is present
                    qtiTestHelper.addMissingQtiType(model);

                    //apply consolidation rules
                    qtiTestHelper.consolidateModel(model);

                    //validate the model
                    try {
                        validators.validateModel(model);
                    } catch (err) {
                        $saver.attr('disabled', false).removeClass('disabled');
                        feedback().error(`${__('The test has not been saved.')} + ${err}`);
                        return false;
                    }
                    return true;
                }
            });

            //set up the databinder
            binder = DataBindController.takeControl($container, binderOptions).get(model => {
                Promise.resolve()
                    .then(() => {
                        if (options.translation) {
                            return Promise.all([
                                translationHelper
                                    .updateModelFromOrigin(model, options.routes.getOrigin)
                                    .then(originModel => (options.originModel = originModel)),
                                translationHelper
                                    .getTranslationConfig(options.testUri, options.originResourceUri)
                                    .then(translationConfig => Object.assign(options, translationConfig))
                            ])
                                .then(() =>
                                    translationHelper.getItemsTranslationStatus(
                                        options.originModel,
                                        options.translationLanguageUri
                                    )
                                )
                                .then(itemsStatus => {
                                    testModelHelper.eachItemInTest(model, itemRef => {
                                        const itemRefUri = itemRef.href;
                                        if (itemsStatus[itemRefUri]) {
                                            itemRef.translationStatus = itemsStatus[itemRefUri];
                                        }
                                    });
                                });
                        }
                    })
                    .catch(err => {
                        logger.error(err);
                        feedback().error(__('An error occurred while loading the original test.'));
                    })
                    .then(() => {
                        creatorContext = qtiTestCreatorFactory($container, {
                            uri: options.uri,
                            translation: options.translation,
                            translationStatus: options.translationStatus,
                            translationLanguageUri: options.translationLanguageUri,
                            translationLanguageCode: options.translationLanguageCode,
                            originResourceUri: options.originResourceUri,
                            originModel: options.originModel,
                            labels: options.labels,
                            routes: options.routes,
                            guidedNavigation: options.guidedNavigation
                        });

                        creatorContext.setTestModel(model);
                        modelOverseer = creatorContext.getModelOverseer();

                        //detect the scoring mode
                        scoringHelper.init(modelOverseer);

                        //register validators
                        validators.registerValidators(modelOverseer);

                        //once model is loaded, we set up the test view
                        testView(creatorContext);
                        if (options.translation) {
                            translationView(creatorContext);
                        }

                        //listen for changes to update available actions
                        testPartView.listenActionState();
                        sectionView.listenActionState();
                        subsectionView.listenActionState();
                        itemrefView.listenActionState();

                        changeTracker($container.get()[0], creatorContext, '.content-wrap');

                        creatorContext.on('save', function () {
                            if (!$saver.hasClass('disabled')) {
                                $saver.prop('disabled', true).addClass('disabled');
                                binder.save(
                                    function () {
                                        Promise.resolve()
                                            .then(() => {
                                                if (options.translation) {
                                                    const config = creatorContext.getModelOverseer().getConfig();
                                                    const progress = config.translationStatus;
                                                    const progressUri =
                                                        translationService.translationProgress[progress];
                                                    if (progressUri) {
                                                        return translationService.updateTranslation(
                                                            options.testUri,
                                                            progressUri
                                                        );
                                                    }
                                                }
                                            })
                                            .then(() => {
                                                $saver.prop('disabled', false).removeClass('disabled');

                                                feedback().success(__('Test Saved'));
                                                isTestContainsItems();
                                                creatorContext.trigger('saved');
                                            });
                                    },
                                    function () {
                                        $saver.prop('disabled', false).removeClass('disabled');
                                    }
                                );
                            }
                        });

                        creatorContext.on('preview', (provider, uri) => {
                            if (isTestContainsItems() && !creatorContext.isTestHasErrors()) {
                                const config = module.config();
                                const type = provider || config.provider || 'qtiTest';
                                return previewerFactory(type, uri || options.testUri, {
                                    readOnly: false,
                                    fullPage: true,
                                    pluginsOptions: config.pluginsOptions
                                }).catch(err => {
                                    logger.error(err);
                                    feedback().error(
                                        __('Test Preview is not installed, please contact to your administrator.')
                                    );
                                });
                            }
                        });

                        creatorContext.on('creatorclose', () => {
                            creatorContext.trigger('exit');
                            window.history.back();
                        });
                    });
            });

            //the save button triggers binder's save action.
            $saver.on('click', function (event) {
                if (creatorContext.isTestHasErrors()) {
                    event.preventDefault();
                    feedback().warning(
                        __(
                            'The test cannot be saved because it currently contains invalid settings.\nPlease fix the invalid settings and try again.'
                        )
                    );
                } else {
                    creatorContext.trigger('save');
                }
            });
        }
    };

    return Controller;
});

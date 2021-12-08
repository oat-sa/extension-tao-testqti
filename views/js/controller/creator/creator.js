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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'module',
    'jquery',
    'lodash',
    'helpers',
    'i18n',
    'ui/feedback',
    'core/databindcontroller',
    'taoQtiTest/controller/creator/qtiTestCreator',
    'taoQtiTest/controller/creator/views/item',
    'taoQtiTest/controller/creator/views/test',
    'taoQtiTest/controller/creator/views/testpart',
    'taoQtiTest/controller/creator/views/section',
    'taoQtiTest/controller/creator/views/itemref',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/scoring',
    'taoQtiTest/controller/creator/helpers/categorySelector',
    'ui/validator/validators',
    'taoQtiTest/controller/creator/helpers/changeTracker',
    'taoTests/previewer/factory',
    'core/logger',
    'taoQtiTest/controller/creator/views/subsection',
], function(
    module,
    $,
    _,
    helpers,
    __,
    feedback,
    DataBindController,
    qtiTestCreatorFactory,
    itemView,
    testView,
    testPartView,
    sectionView,
    itemrefView,
    Dom2QtiEncoder,
    templates,
    qtiTestHelper,
    scoringHelper,
    categorySelector,
    validators,
    changeTracker,
    previewerFactory,
    loggerFactory,
    subsectionView
){
    'use strict';
    const logger = loggerFactory('taoQtiTest/controller/creator');

    /**
     * The test creator controller is the main entry point
     * and orchestrates data retrieval and view/components loading.
     * @exports creator/controller
     */
    const Controller = {

        routes : {},

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
            const $previewer = $('#previewer');
            const $back = $('#authoringBack');

            let creatorContext;
            let binder;
            let binderOptions;
            let modelOverseer;

            this.identifiers = [];

            options = _.merge(module.config(), options || {});
            options.routes = options.routes || {};
            options.labels = options.labels || {};
            options.categoriesPresets = options.categoriesPresets || {};
            options.guidedNavigation = options.guidedNavigation === true;

            categorySelector.setPresets(options.categoriesPresets);

            //back button
            $back.on('click', e => {
                e.preventDefault();
                if (creatorContext) {
                    creatorContext.trigger('creatorclose');
                }
            });

            //preview button
            if (!Object.keys(options.labels).length) {
                $previewer.attr('disabled', true).addClass('disabled');
            }
            $previewer.on('click', e => {
                e.preventDefault();
                if(!$previewer.hasClass('disabled')) {
                    creatorContext.trigger('preview');
                }
            });
            const isTestContainsItems = () => {
                if ($container.find('.test-content').find('.itemref').length) {
                    $previewer.attr('disabled', false).removeClass('disabled');
                    return true;
                } else {
                    $previewer.attr('disabled', true).addClass('disabled');
                    return false;
                }
            };

            //set up the ItemView, give it a configured loadItems ref
            itemView($('.test-creator-items .item-selection', $container));

            // forwards some binder events to the model overseer
            $container.on('change.binder delete.binder',  (e, model) => {
                if (e.namespace === 'binder' && model && modelOverseer) {
                    modelOverseer.trigger(e.type, model);
                }
            });

            //Data Binding options
            binderOptions = _.merge(options.routes, {
                filters : {
                    isItemRef : value => qtiTestHelper.filterQtiType(value, 'assessmentItemRef'),
                    isSection : value => qtiTestHelper.filterQtiType(value, 'assessmentSection')
                },
                encoders : {
                    'dom2qti' : Dom2QtiEncoder
                },
                templates : templates,
                beforeSave(model) {
                    //ensure the qti-type is present
                    qtiTestHelper.addMissingQtiType(model);

                    //apply consolidation rules
                    qtiTestHelper.consolidateModel(model);

                    //validate the model
                    try {
                        qtiTestHelper.validateModel(model);
                    } catch(err) {
                        $saver.attr('disabled', false).removeClass('disabled');
                        feedback().error(`${__('The test has not been saved.')} + ${err}`);
                        return false;
                    }
                    return true;
                }
            });

            //set up the databinder
            binder = DataBindController
                .takeControl($container, binderOptions)
                .get( model => {

                    creatorContext = qtiTestCreatorFactory($container, {
                        uri : options.uri,
                        labels : options.labels,
                        routes : options.routes,
                        guidedNavigation : options.guidedNavigation
                    });
                    creatorContext.setTestModel(model);
                    modelOverseer = creatorContext.getModelOverseer();

                    //detect the scoring mode
                    scoringHelper.init(modelOverseer);

                    //register validators
                    validators.register('idFormat', qtiTestHelper.idFormatValidator());
                    validators.register('testIdFormat', qtiTestHelper.testidFormatValidator());
                    validators.register('testIdAvailable', qtiTestHelper.idAvailableValidator(modelOverseer), true);

                    //once model is loaded, we set up the test view
                    testView(creatorContext);

                    //listen for changes to update available actions
                    testPartView.listenActionState();
                    sectionView.listenActionState();
                    subsectionView.listenActionState();
                    itemrefView.listenActionState();

                    changeTracker($container.get()[0], creatorContext, '.content-wrap');

                    creatorContext.on('save', function() {
                        if(!$saver.hasClass('disabled')){
                            $saver.prop('disabled', true).addClass('disabled');
                            binder.save(function() {
                                $saver.prop('disabled', false).removeClass('disabled');
                                feedback().success(__('Test Saved'));
                                isTestContainsItems();
                                creatorContext.trigger('saved');
                            }, function() {
                                $saver.prop('disabled', false).removeClass('disabled');
                            });
                        }
                    });

                    creatorContext.on('preview', function() {
                        if(isTestContainsItems()) {
                            const saveUrl = options.routes.save;
                            const testUri = saveUrl.slice(saveUrl.indexOf('uri=') + 4);
                            return previewerFactory(
                                module.config().provider,
                                decodeURIComponent(testUri),
                                {
                                    readOnly: false,
                                    fullPage: true
                                }
                            )
                            .catch(err => {
                                logger.error(err);
                                feedback().error(__('Test Preview is not installed, please contact to your administrator.'));
                            });
                        }
                    });

                    creatorContext.on('creatorclose', () => {
                        creatorContext.trigger('exit');
                        window.history.back();
                    });
                });

            //the save button triggers binder's save action.
            $saver.on('click', function(event){
                event.preventDefault();
                creatorContext.trigger('save');
            });
        }
    };

    return Controller;
});

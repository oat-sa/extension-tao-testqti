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
    'lodash',
    'helpers',
    'i18n',
    'html5-history-api',
    'ui/feedback',
    'core/databindcontroller',
    'taoQtiTest/controller/creator/views/item',
    'taoQtiTest/controller/creator/views/test',
    'taoQtiTest/controller/creator/views/testpart',
    'taoQtiTest/controller/creator/views/section',
    'taoQtiTest/controller/creator/views/itemref',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/scoring',
    'core/validator/validators',
    'core/promise'
], function(
    module,
    $,
    _,
    helpers,
    __,
    history,
    feedback,
    DataBindController,
    itemView, testView,
    testPartView,
    sectionView,
    itemrefView,
    Dom2QtiEncoder,
    templates,
    qtiTestHelper,
    scoringHelper,
    validators,
    Promise
    ){

    'use strict';

    /**
     * Call the server to get the list of items
     * @param {string} url
     * @param {string} search - a posix pattern to filter items
     * @returns {Promise}
     */
    var loadItems = function loadItems(url, search){
        return new Promise( function(resolve, reject){
            $.getJSON(url, {pattern : search, notempty : 'true'})
                .done(resolve)
                .fail(function(xhr){
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
        });
    };

    /**
     * Call the server to get the items categories
     * @param {String} url - the endpoint
     * @param {String[]} items - the list of items URIs
     * @returns {Promise}
     */
    var getCategories = function getCategories(url, items){
        return new Promise( function(resolve, reject){
            if(items && items.length){
                $.getJSON(url, { uris : items })
                    .done(resolve)
                    .fail(function(xhr){
                        return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                    });
            }
        });
    };

    /**
     * The test creator controller is the main entry point
     * and orchestrates data retrieval and view/components loading.
     * @exports creator/controller
     */
    var Controller = {

        routes : {},

        identifiers: [],

         /**
          * Start the controller, main entry method.
          * @public
          * @param {Object} options
          * @param {Object} options.labels - the list of item's labels to give to the ItemView
          * @param {Object} options.routes - action's urls
          */
        start : function(options){
            var self = this;
            var $container = $('#test-creator');
            var $saver = $('#saver');
            var binder, binderOptions;

            self.identifiers = [];

            options = _.merge(module.config(), options || {});
            options.routes = options.routes || {};
            options.labels = options.labels || {};


            //back button
            $('#authoringBack').on('click', function(e){
                e.preventDefault();

                if (history) {
                    history.back();
                }
            });

            //set up the ItemView, give it a configured loadItems ref
            itemView(
                _.partial(loadItems, options.routes.items),
                _.partial(getCategories, options.routes.categories)
            );

            //Print data binder chandes for DEBUGGING ONLY
            //$container.on('change.binder', function(e, model){
                //if(e.namespace === 'binder'){
                    //console.log(model);
                //}
            //});

            //Data Binding options
            binderOptions = _.merge(options.routes, {
                filters : {
                    'isItemRef' : function(value){
                        return qtiTestHelper.filterQtiType(value, 'assessmentItemRef');
                    },
                    'isSection' : function(value){
                        return qtiTestHelper.filterQtiType(value, 'assessmentSection');
                    }
                },
                encoders : {
                    'dom2qti' : Dom2QtiEncoder
                },
                templates : templates,
                beforeSave : function(model){
                    //generate the outcomes that define the scoring
                    scoringHelper.write(model);

                    //ensure the qti-type is present
                    qtiTestHelper.addMissingQtiType(model);

                    //apply consolidation rules
                    qtiTestHelper.consolidateModel(model);

                    //validate the model
                    try {
                        qtiTestHelper.validateModel(model);
                    } catch(err) {
                        $saver.attr('disabled', false).removeClass('disabled');
                        feedback().error(__('The test has not been saved.') + ' ' + err);
                        return false;
                    }
                    return true;
                }
            });

            //set up the databinder
            binder = DataBindController
                .takeControl($container, binderOptions)
                .get(function(model){
                    //detect the scoring mode
                    scoringHelper.read(model);

                    //extract ids
                    self.identifiers = qtiTestHelper.extractIdentifiers(model);

                    //register validators
                    validators.register('idFormat', qtiTestHelper.idFormatValidator());
                    validators.register('testIdFormat', qtiTestHelper.testidFormatValidator());
                    validators.register('testIdAvailable', qtiTestHelper.idAvailableValidator(self.identifiers), true);

                    //once model is loaded, we set up the test view
                    testView(model, {
                        uri : options.uri,
                        identifiers : self.identifiers,
                        labels : options.labels,
                        routes : options.routes
                    });

                    //listen for changes to update available actions
                    testPartView.listenActionState();
                    sectionView.listenActionState();
                    itemrefView.listenActionState();
                    itemrefView.resize();

                    $(window)
                      .off('resize.qti-test-creator')
                      .on('resize.qti-test-creator', function(){
                          itemrefView.resize();
                      });
                });

            //the save button triggers binder's save action.
            $saver.on('click', function(event){
                event.preventDefault();

                if(!$saver.hasClass('disabled')){
                    $saver.attr('disabled', true).addClass('disabled');
                    binder.save(function(){

                        $saver.attr('disabled', false).removeClass('disabled');

                        feedback().success(__('Test Saved'));

                    }, function(){

                        $saver.attr('disabled', false).removeClass('disabled');
                    });
                }
            });
        }
    };

    return Controller;
});

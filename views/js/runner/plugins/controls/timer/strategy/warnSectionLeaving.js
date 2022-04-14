define(['lodash', 'i18n', 'taoQtiTest/runner/helpers/messages', 'taoQtiTest/runner/helpers/navigation', 'taoQtiTest/runner/config/states', 'taoQtiTest/runner/helpers/map'], function (_, __, messages, navigationHelper, states, mapHelper) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    messages = messages && Object.prototype.hasOwnProperty.call(messages, 'default') ? messages['default'] : messages;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;
    states = states && Object.prototype.hasOwnProperty.call(states, 'default') ? states['default'] : states;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;

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
     * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * The message to display when exiting
     */

    var exitMessage = __('Once you close this section, you cannot return to it or change your answers.');
    /**
     * Creates the strategy if it applies to the given timer
     * @param {runner} testRunner
     * @param {Object} timer
     * @returns {strategy|Boolean} the strategy if applies or false
     */


    function warnSectionLeavingStrategy(testRunner, timer) {
      /**
       * Check if the movment leads to leaving an active timed section
       * @param {String} direction - the move direction (next, previous or jump)
       * @param {String} scope - the move scope (item, section, testPart)
       * @param {Number} [position] - the position in case of jump
       * @returns {Boolean}
       */
      var leaveTimedSection = function leaveTimedSection(direction, scope, position) {
        var context = testRunner.getTestContext();
        var map = testRunner.getTestMap();

        if (!context.isTimeout && context.itemSessionState !== states.itemSession.closed && context.sectionId === timer.source) {
          return navigationHelper.isLeavingSection(context, map, direction, scope, position);
        }

        return false;
      };

      if (timer && timer.scope === 'section' && timer.type === 'max') {
        return {
          name: 'warnSectionLeaving',

          /**
           * setUp entry point : blocks the move to display a message if needed
           */
          setUp: function setUp() {
            testRunner.off('move.warntimedsection skip.warntimedsection').before('move.warntimedsection skip.warntimedsection', function (e, type, scope, position) {
              var testContext = testRunner.getTestContext();
              var testMap = testRunner.getTestMap();
              var testRunnerOptions = testRunner.getOptions();
              var timerConfig = testRunnerOptions.timer || {};
              var itemIdentifier = testContext.itemIdentifier;
              var isLast = navigationHelper.isLast(testMap, itemIdentifier);
              var endTestWarning = mapHelper.hasItemCategory(testMap, itemIdentifier, 'endTestWarning', true);
              var noExitTimedSectionWarning = mapHelper.hasItemCategory(testMap, itemIdentifier, 'noExitTimedSectionWarning', true);
              var movePromise = new Promise(function (resolve, reject) {
                // endTestWarning has already been displayed, so we don't repeat the warning
                if (isLast && endTestWarning) {
                  resolve(); // display a message if we exit a timed section
                } else if (leaveTimedSection(type || 'next', scope, position) && !noExitTimedSectionWarning && !timerConfig.keepUpToTimeout) {
                  var submitButtonLabel = __('Close this Section');

                  testRunner.trigger('confirm.exittimed', messages.getExitMessage('section', testRunner, exitMessage, false, submitButtonLabel), resolve, reject, {
                    buttons: {
                      labels: {
                        ok: submitButtonLabel,
                        cancel: __('Review my Answers')
                      }
                    }
                  });
                } else {
                  resolve();
                }
              });
              movePromise.catch(function cancelMove() {
                // Use `defer` to be sure the timer resume will occur after the move event is
                // finished to be handled. Otherwise, the duration plugin will be frozen and
                // the additional time will not be taken into account!
                _.defer(function () {
                  testRunner.trigger('enableitem enablenav');
                });
              });
              return movePromise;
            });
          },

          /**
           * complete entry point : removes the listeners
           */
          complete: function complete() {
            return this.tearDown();
          },

          /**
           * tearDown entry point : removes the listeners
           */
          tearDown: function tearDown() {
            testRunner.off('move.warntimedsection skip.warntimedsection');
          }
        };
      }

      return false;
    }

    return warnSectionLeavingStrategy;

});

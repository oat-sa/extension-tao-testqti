define(['lodash'], function (_) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    /**
     * List of QTI model cardinalities
     * @type {Object}
     */

    var responseCardinalities = {
      single: 'base',
      multiple: 'list',
      ordered: 'list',
      record: 'record'
    };
    /**
     * List of QTI interaction minConstraint properties
     * @type {Object}
     */

    var interactionMinConstraintProperties = {
      matchInteraction: 'minAssociations',
      choiceInteraction: 'minChoices',
      orderInteraction: 'minChoices',
      associateInteraction: 'minAssociations',
      hottextInteraction: 'minChoices',
      hotspotInteraction: 'minChoices',
      graphicOrderInteraction: 'minChoices',
      graphicAssociateInteraction: 'minAssociations',
      selectPointInteraction: 'minChoices'
    };
    /**
     * @typedef {currentItemHelper}
     */

    var currentItemHelper = {
      /**
       * Gets the responses declarations of the current item.
       * @param {Object} runner - testRunner instance
       * @returns {Object}
       */
      getDeclarations: function getDeclarations(runner) {
        var itemRunner = runner.itemRunner;
        return itemRunner._item && itemRunner._item.responses;
      },

      /**
       * Gets a response declaration by the identifier of the response
       * @param {Object} runner - testRunner instance
       * @param {String} identifier - The identifier of the response
       * @returns {Object|null}
       */
      getResponseDeclaration: function getResponseDeclaration(runner, identifier) {
        var found = null;

        _.forEach(currentItemHelper.getDeclarations(runner), function (declaration) {
          var attributes = declaration.attributes || {};

          if (attributes.identifier === identifier) {
            found = declaration;
            return false;
          }
        });

        return found;
      },

      /**
       * Convert a value to a response object
       * @param {Array|String} value
       * @param {String} baseType
       * @param {String} cardinality
       * @returns {Object}
       */
      toResponse: function toResponse(value, baseType, cardinality) {
        var mappedCardinality = responseCardinalities[cardinality];
        var response = {};

        if (_.isString(value)) {
          value = [value];
        }

        var transform = function transform(v) {
          return v;
        };

        if (baseType === 'boolean') {
          transform = function transform(v) {
            return v === true || v === 'true';
          };
        } else if (baseType === 'directedPair' || baseType === 'pair') {
          transform = function transform(v) {
            if (_.isString(v)) {
              return v.split(' ');
            }

            return v;
          };
        }

        value = _.map(value || [], transform);

        if (mappedCardinality) {
          if (mappedCardinality === 'base') {
            if (value.length === 0) {
              //return empty response:
              response.base = null;
            } else {
              response.base = {};
              response.base[baseType] = value[0];
            }
          } else {
            response[mappedCardinality] = {};
            response[mappedCardinality][baseType] = value;
          }
        }

        return response;
      },

      /**
       * Checks if the provided value can be considered as null
       * @param {Object} value
       * @param {String} baseType
       * @param {String} cardinality
       * @returns {boolean}
       */
      isQtiValueNull: function isQtiValueNull(value, baseType, cardinality) {
        var mappedCardinality = responseCardinalities[cardinality];

        if (_.isObject(value) && value[mappedCardinality] === null) {
          value = null;
        }

        if (_.isObject(value) && value[mappedCardinality] && 'undefined' !== typeof value[mappedCardinality][baseType]) {
          value = value[mappedCardinality][baseType];
        }

        return null === value || 'string' === baseType && _.isEmpty(value) || cardinality !== 'single' && _.isEmpty(value);
      },

      /**
       * Tells if an item question has been answered or not
       * @param {Object} response
       * @param {String} baseType
       * @param {String} cardinality
       * @param {Object} [defaultValue]
       * @param {Object} constraintValue
       * @returns {*}
       */
      isQuestionAnswered: function isQuestionAnswered(response, baseType, cardinality, defaultValue, constraintValue) {
        var answered, currentCardinality, responses;
        var fullyAnswered = true;
        defaultValue = defaultValue || null;
        constraintValue = constraintValue || 0;

        if (currentItemHelper.isQtiValueNull(response, baseType, cardinality)) {
          answered = false;
        } else {
          answered = !_.isEqual(response, currentItemHelper.toResponse(defaultValue, baseType, cardinality));

          if (constraintValue !== 0) {
            currentCardinality = responseCardinalities[cardinality];
            responses = response[currentCardinality][baseType] || [];
            fullyAnswered = responses && responses.length >= constraintValue;
          }

          answered = answered && fullyAnswered;
        }

        return answered;
      },
      guessInteractionConstraintValues: function guessInteractionConstraintValues(runner) {
        var itemRunner = runner.itemRunner;
        var itemBody = itemRunner._item && itemRunner._item.bdy || {};
        var interactions = itemBody.elements || {};
        var constraintValues = {};

        _.forEach(interactions, function (interaction) {
          var attributes = interaction.attributes || {};
          var qtiClass = interaction.__proto__.qtiClass;
          var constraintProperty;

          if (Object.prototype.hasOwnProperty.call(interactionMinConstraintProperties, qtiClass)) {
            constraintProperty = interactionMinConstraintProperties[qtiClass];
            constraintValues[attributes.responseIdentifier] = attributes[constraintProperty];
          }
        });

        return constraintValues;
      },

      /**
       * Tells is the current item has been answered or not
       * The item is considered answered when at least one response has been set to not empty {base : null}
       * @param {Object} runner - testRunner instance
       * @param {Boolean} [partially=true] - if false all questions must have been answered
       * @returns {Boolean}
       */
      isAnswered: function isAnswered(runner, partially) {
        var itemRunner = runner.itemRunner;
        var responses = itemRunner && itemRunner.getResponses();
        var count = 0;
        var empty = 0;
        var declarations, constraintValues;

        if (itemRunner) {
          declarations = currentItemHelper.getDeclarations(runner);
          constraintValues = currentItemHelper.guessInteractionConstraintValues(runner);

          _.forEach(declarations, function (declaration) {
            var attributes = declaration.attributes || {};
            var response = responses[attributes.identifier];
            var baseType = attributes.baseType;
            var cardinality = attributes.cardinality;
            count++;

            if (!currentItemHelper.isQuestionAnswered(response, baseType, cardinality, declaration.defaultValue, constraintValues[attributes.identifier])) {
              empty++;
            }
          });
        }

        if (partially === false) {
          return count > 0 && empty === 0;
        }

        return count > 0 && empty < count;
      },

      /**
       * Gets list of shared stimuli hrefs in the current item
       *
       * @param {Object} runner - testRunner instance
       * @returns {Array}
       */
      getStimuliHrefs: function getStimuliHrefs(runner) {
        var itemRunner = runner.itemRunner;
        var itemBody = itemRunner._item && itemRunner._item.bdy || {};
        var interactions = itemBody.elements || {};
        return _(interactions).values().filter(function (element) {
          return element.qtiClass === 'include';
        }).pluck('attributes').pluck('href').value();
      },

      /**
       * Find the list of text stimulus ids in the current item
       * Depends on the DOM already being loaded
       * @param {Object} runner - testRunner instance
       * @returns {Array}
       */
      getTextStimuliHrefs: function getTextStimuliHrefs(runner) {
        var stimuli = this.getStimuliHrefs(runner);
        var textStimuli;

        if (stimuli.length > 0) {
          // Filter the ones containing text:
          textStimuli = stimuli.filter(function (stimulusHref) {
            var domNode = document.querySelector(".qti-include[data-href=\"".concat(stimulusHref, "\"]"));
            return _(domNode.childNodes).some(function (child) {
              return child.nodeType === child.TEXT_NODE;
            });
          });
          return textStimuli;
        }

        return [];
      }
    };

    return currentItemHelper;

});

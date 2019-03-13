define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
], function(
    _,
    mapHelper,
) {
    'use strict';

    var testContextBuilderFactory = function testContextBuilderFactory(testData, testContext, testMap) {
        return {
            /**
             * Returns the updated test context from an item in the given position.
             *
             * @param {Integer} position
             * @returns {Object}
             */
            buildTestContextFromPosition: function buildTestContextFromPosition(position) {
                var updatedMap = mapHelper.updateItemStats(testMap, position);
                var item = mapHelper.getItemAt(updatedMap, position);
                var section = mapHelper.getItemSection(updatedMap, position);
                var part = mapHelper.getItemPart(updatedMap, position);

                if (!item) {
                    return false;
                }

                return this._getTestContext(item, section, part, position);
            },

            /**
             * Returns the updated test context from a jump table entry.
             *
             * @param {Object} jump
             * @param {String} jump.item
             * @param {String} jump.section
             * @param {String} jump.part
             * @param {Integer} jump.position
             * @returns {Object}
             */
            buildTestContextFromJump: function buildTestContextFromJump(jump) {
                var part = testMap.parts[jump.part];
                var section = part.sections[jump.section];
                var item = section.items[jump.item];

                return this._getTestContext(item, section, part, jump.position);
            },

            /**
             * Returns the updated test context.
             *
             * @param {Object} item
             * @param {String} item.id
             * @param {Boolean} item.answered
             * @param {Integer} item.remainingAttempts
             * @param {Object} item.timeConstraint
             * @param {String[]} item.categories
             * @param {Object} section
             * @param {String} section.id
             * @param {String} section.label
             * @param {Object} section.timeConstraint
             * @param {Object} part
             * @param {String} part.id
             * @param {Boolean} part.isLinear
             * @param {Object} part.timeConstraint
             * @param {Integer} position
             * @returns {Object} the new test context
             * @private
             */
            _getTestContext: function _getTestContext(item, section, part, position) {
                var isLeavingSection = section.id !== testContext.sectionId;
                var isLeavingPart = part.id !== testContext.testPartId;
                var newTestContext = _.defaults({
                    itemIdentifier: item.id,
                    itemPosition: position,
                    itemAnswered: item.answered || part.isLinear,
                    numberPresented: testMap.stats.viewed,
                    numberCompleted: testMap.stats.answered,
                    hasFeedbacks: false,
                    remainingAttempts: item.remainingAttempts > -1 ? item.remainingAttempts - 1 : -1,
                    sectionId: section.id,
                    sectionTitle: section.label,
                    testPartId: part.id,
                    isLinear: part.isLinear,
                    isLast: false, // TODO: implement logic
                    canMoveBackward: true, // TODO: implement logic
                }, testContext);

                if (isLeavingSection) {
                    newTestContext.numberRubrics = 0;
                    newTestContext.rubrics = '';
                }

                newTestContext.timeConstraints = _.reject(testContext.timeConstraints, function(constraint) {
                    return constraint.qtiClassName === 'assessmentItemRef'
                        || (isLeavingSection && constraint.qtiClassName === 'assessmentSection')
                        || (isLeavingPart && constraint.qtiClassName === 'testPart');
                });

                if (item.timeConstraint) {
                    newTestContext.timeConstraints.push(item.timeConstraint);
                }

                if (isLeavingSection && section.timeConstraint) {
                    newTestContext.timeConstraints.push(section.timeConstraint);
                }

                if (isLeavingPart && part.timeConstraint) {
                    newTestContext.timeConstraints.push(part.timeConstraint);
                }

                newTestContext.options = _.defaults(
                    this._getOptionsFromCategories(item.categories || []),
                    _.pick(testContext.options, ['allowComment', 'allowSkipping', 'exitButton', 'logoutButton'])
                );

                return newTestContext;
            },

            /**
             * Transforms the categories into context options.
             *
             * @param {String[]} categories - the list of categories
             * @returns {Object} the options object like <optionName : Boolean>
             * @private
             */
            _getOptionsFromCategories: function _getOptionsFromCategories(categories) {
                if (!_.isArray(categories) || !categories.length) {
                    return {};
                }

                return _.reduce(categories, function(acc, category) {
                    if (_.isString(category) && !_.isEmpty(category))  {
                        //transfrom the category name in an option name :
                        //x-tao-option-review-screen to reviewScreen
                        var categoryName = category
                            .replace('x-tao-option-', '')
                            .split(/[\-_]+/g)
                            .map(function capitalize(name, index) {
                                if (index === 0) {
                                    return name;
                                }

                                if (name.length) {
                                    return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
                                }
                                return '';
                            })
                            .join('');

                        if (categoryName) {
                            acc[categoryName] = true;
                        }
                    }

                    return acc;
                }, {});
            },
        };
    };

    return testContextBuilderFactory;
});

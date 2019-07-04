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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */
import _ from 'lodash';
import capitalize from 'util/capitalize';
import mapHelper from 'taoQtiTest/runner/helpers/map';
import navigationHelper from 'taoQtiTest/runner/helpers/navigation';

/**
 * Returns the updated test context from an item in the given position.
 *
 * @param {Object} testData
 * @param {Object} testContext
 * @param {Object} testMap
 * @param {Integer} position
 * @returns {Object}
 */
function buildTestContextFromPosition(testData, testContext, testMap, position) {
    var updatedMap = mapHelper.updateItemStats(testMap, position),
        item = mapHelper.getItemAt(updatedMap, position),
        section = mapHelper.getItemSection(updatedMap, position),
        part = mapHelper.getItemPart(updatedMap, position);

    if (!item) {
        return false;
    }

    return getTestContext(testData, testContext, testMap, item, section, part, position);
}

/**
 * Returns the updated test context from a jump table entry.
 *
 * @param {Object} testData
 * @param {Object} testContext
 * @param {Object} testMap
 * @param {Object} jump
 * @param {String} jump.item
 * @param {String} jump.section
 * @param {String} jump.part
 * @param {Integer} jump.position
 * @returns {Object}
 */
function buildTestContextFromJump(testData, testContext, testMap, jump) {
    var part = testMap.parts[jump.part],
        section = part.sections[jump.section],
        item = section.items[jump.item];

    return getTestContext(testData, testContext, testMap, item, section, part, jump.position);
}

/**
 * Returns the updated test context.
 *
 * @param {Object} testData
 * @param {Object} testContext
 * @param {Object} testMap
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
function getTestContext(testData, testContext, testMap, item, section, part, position) {
    var isLeavingSection = section.id !== testContext.sectionId,
        isLeavingPart = part.id !== testContext.testPartId,
        newTestContext = _.defaults(
            {
                itemIdentifier: item.id,
                itemPosition: position,
                itemAnswered: item.answered || part.isLinear,
                numberPresented: testMap.stats.viewed,
                numberCompleted: testMap.stats.answered,
                hasFeedbacks: false,
                remainingAttempts: Math.max(-1, item.remainingAttempts - 1),
                sectionId: section.id,
                sectionTitle: section.label,
                testPartId: part.id,
                isLinear: part.isLinear,
                isLast: navigationHelper.isLast(testMap, item.id),
                canMoveBackward: !part.isLinear && !navigationHelper.isFirst(testMap, item.id)
            },
            testContext
        );

    if (isLeavingSection) {
        newTestContext.numberRubrics = 0;
        newTestContext.rubrics = '';
    }

    newTestContext.timeConstraints = _.reject(testContext.timeConstraints, function(constraint) {
        return (
            constraint.qtiClassName === 'assessmentItemRef' ||
            (isLeavingSection && constraint.qtiClassName === 'assessmentSection') ||
            (isLeavingPart && constraint.qtiClassName === 'testPart')
        );
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
        getOptionsFromCategories(item.categories || []),
        _.pick(testContext.options, ['allowComment', 'allowSkipping', 'exitButton', 'logoutButton'])
    );

    return newTestContext;
}

/**
 * Transforms the categories into context options.
 *
 * @param {String[]} categories - the list of categories
 * @returns {Object} the options object like <optionName : Boolean>
 * @private
 */
function getOptionsFromCategories(categories) {
    if (!_.isArray(categories) || !categories.length) {
        return {};
    }

    return _.reduce(
        categories,
        function(acc, category) {
            var categoryName;

            if (_.isString(category) && !_.isEmpty(category)) {
                // transfrom the category name in an option name:
                // x-tao-option-review-screen to reviewScreen
                categoryName = category
                    .replace('x-tao-option-', '')
                    .split(/[-_]+/g)
                    .map(function(name, index) {
                        if (index === 0) {
                            return name;
                        }

                        if (name.length) {
                            return capitalize(name);
                        }
                        return '';
                    })
                    .join('');

                if (categoryName) {
                    acc[categoryName] = true;
                }
            }

            return acc;
        },
        {}
    );
}

export default {
    buildTestContextFromPosition: buildTestContextFromPosition,
    buildTestContextFromJump: buildTestContextFromJump
};

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
define([
    'lodash',
    'core/promise',
    'taoQtiTest/runner/branchRule/branchRule',
    'taoQtiTest/runner/proxy/offline/responseStore'
], function (
    _,
    Promise,
    branchRule,
    responseStore
) {
    'use strict';

    /**
     * Helper class for the offline version of the jump table which helps the navigation of the test taker.
     * The jump table will store all the elements in the following format:
     * {
     *     item: '...', // the identifier of the item
     *     section: '...', // the identifier of the section
     *     part: '...', // the identifier of the part
     *     position: 0 // the position of the jump entry, starting from 0
     * }
     */
    var offlineJumpTableFactory = function offlineJumpTableFactory(itemStore) {
        var testMap = {};
        var jumpTable = [];

        /**
         * Put all the responses from the navigation parameters into the responseStore
         *
         * @param {Object} params
         */
        function addResponsesToResponseStore(params) {
            Object.keys(params.itemResponse).forEach(function(itemResponseIdentifier) {
                var response = params.itemResponse[itemResponseIdentifier],
                    responseIdentifier = params.itemDefinition + '.' + itemResponseIdentifier;

                Object.keys(response).forEach(function(responseType) {
                    var responseId = response[responseType].identifier;

                    if (Array.isArray(responseId)) {
                        responseId.forEach(function(id) {
                            responseStore.addResponse(responseIdentifier, id);
                        });
                    } else {
                        responseStore.addResponse(responseIdentifier, responseId);
                    }
                });
            });
        }

        return {
            setTestMap: function setTestMap(map) {
                testMap = map;

                return this;
            },

            init: function init() {
                var firstItem,
                    simplifiedTestMap = this._getSimplifiedTestMap();

                // if the jump table is empty, add the first item as the first jump
                if (simplifiedTestMap.length > 0 && jumpTable.length === 0) {
                    firstItem = simplifiedTestMap[0];

                    this.addJump(firstItem.part, firstItem.section, firstItem.item);
                }

                // Put all correct responses to the responseStore
                simplifiedTestMap.forEach(function(row) {
                    itemStore.get(row.item).then(function(item) {
                        Object.keys(item.itemData.data.responses).forEach(function(responseDeclarationIdentifier) {
                            var response = item.itemData.data.responses[responseDeclarationIdentifier];
                            var responseIdentifier = item.itemIdentifier + '.' + response.identifier;
                            responseStore.addCorrectResponse(responseIdentifier, response.correctResponses);
                        });
                    });
                });
            },

            /**
             * Clears the jump table
             *
             * @returns {offlineJumpTableFactory}
             */
            clearJumpTable: function clearJumpTable() {
                jumpTable = [];

                return this;
            },

            /**
             * Adds a new jump into the end of the jump table
             *
             * @param {String} partIdentifier
             * @param {String} sectionIdentifier
             * @param {String} itemIdentifier
             */
            addJump: function addJump(partIdentifier, sectionIdentifier, itemIdentifier) {
                var self = this;

                return new Promise(function(resolve) {
                    var nextPosition = 'position' in self.getLastJump()
                        ? self.getLastJump().position + 1
                        : 0;

                    jumpTable.push({
                        item: itemIdentifier,
                        part: partIdentifier,
                        section: sectionIdentifier,
                        position: nextPosition
                    });

                    resolve();
                });
            },

            /**
             * Jumps into a specific position inside the jump table. The jump entry in the given position
             * will be the last element of the jump table, every other entry after this entry will get deleted
             *
             * @param {Integer} position
             * @returns {offlineJumpTableFactory}
             */
            jumpTo: function jumpTo(position) {
                jumpTable = jumpTable.filter(function(jump) {
                    return jump.position <= position;
                });

                return this;
            },

            /**
             * Adds the next item to the end of the jump table
             */
            jumpToNextItem: function jumpToNextItem(params) {
                var self = this;

                addResponsesToResponseStore(params);

                return new Promise(function(resolve) {
                    var simplifiedTestMap = self._getSimplifiedTestMap();
                    var lastJumpItem = self.getLastJump().item || null;
                    var items = self._getItems();
                    var itemSliceIndex = items.indexOf(lastJumpItem);
                    var itemIdentifierToAdd = items.slice(itemSliceIndex + 1).shift();
                    var itemToAdd = simplifiedTestMap
                        .filter(function(row) {
                            return row.item === itemIdentifierToAdd;
                        })
                        .shift();

                    var lastJumpItemData = simplifiedTestMap
                        .filter(function(row) {
                            return row.item === lastJumpItem;
                        })
                        .shift();

                    if (lastJumpItemData && lastJumpItemData.itemHasBranchRule) {
                        return itemStore.get(lastJumpItem).then(function(item) {
                            itemIdentifierToAdd = branchRule(lastJumpItemData.itemBranchRule, item, params, responseStore);

                            if (itemIdentifierToAdd !== null) {
                                itemToAdd = simplifiedTestMap
                                    .filter(function(row) {
                                        return row.item === itemIdentifierToAdd;
                                    })
                                    .shift();
                            }

                            self.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item).then(resolve);
                        });
                    } else {
                        return itemToAdd
                            ? self.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item).then(resolve)
                            : resolve();
                    }
                });
            },

            /**
             * Adds the first item of the next section to the end of the jump table
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToNextSection: function jumpToNextSection() {
                var lastJumpSection = this.getLastJump().section || null;
                var sections = this._getSections();
                var sectionSliceIndex = sections.indexOf(lastJumpSection);
                var sectionIdentifierToAdd = sections.slice(sectionSliceIndex + 1).shift();
                var itemToAdd = this._getSimplifiedTestMap()
                    .filter(function(row) {
                        return row.section === sectionIdentifierToAdd;
                    })
                    .shift();

                if (itemToAdd) {
                    this.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item);
                }

                return this;
            },

            /**
             * Adds the first item of the next part to the end of the jump table
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToNextPart: function jumpToNextPart() {
                var lastJumpPart = this.getLastJump().part || null;
                var parts = this._getParts();
                var partSliceIndex = parts.indexOf(lastJumpPart);
                var partIdentifierToAdd = parts.slice(partSliceIndex + 1).shift();
                var itemToAdd = this._getSimplifiedTestMap()
                    .filter(function(row) {
                        return row.part === partIdentifierToAdd;
                    })
                    .shift();

                if (itemToAdd) {
                    this.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item);
                }

                return this;
            },

            /**
             * Jumps to the previous item by deleting the last entry of the jump table.
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToPreviousItem: function jumpToPreviousItem() {
                jumpTable.pop();

                return this;
            },

            /**
             * Jumps to the first item of the previous section and deletes every other entry from the jump table
             * which comes after this item.
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToPreviousSection: function jumpToPreviousSection() {
                var lastJumpSection = this.getLastJump().section || null;
                var sections = this._getSections();
                var sectionSliceIndex = sections.indexOf(lastJumpSection) >= 1 ? sections.indexOf(lastJumpSection) - 1 : 0;
                var sectionsToBeDeleted = sections.slice(sectionSliceIndex);
                var sectionToAdd = sections[sectionSliceIndex];
                var itemToAdd;

                jumpTable = jumpTable.filter(function(jump) {
                    return !sectionsToBeDeleted.includes(jump.section);
                });

                itemToAdd = this._getSimplifiedTestMap()
                    .filter(function(row) {
                        return row.section === sectionToAdd;
                    })
                    .shift();

                this.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item);

                return this;
            },

            /**
             * Jumps to the first item of the previous part and deletes every other entry from the jump table
             * which comes after this item.
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToPreviousPart: function jumpToPreviousPart() {
                var lastJumpPart = this.getLastJump().part || null;
                var parts = this._getParts();
                var partSliceIndex = parts.indexOf(lastJumpPart) >= 1 ? parts.indexOf(lastJumpPart) - 1 : 0;
                var partsToBeDeleted = parts.slice(partSliceIndex);
                var partToAdd = parts[partSliceIndex];
                var itemToAdd;

                jumpTable = jumpTable.filter(function(jump) {
                    return !partsToBeDeleted.includes(jump.part);
                });

                itemToAdd = this._getSimplifiedTestMap()
                    .filter(function(row) {
                        return row.part === partToAdd;
                    })
                    .shift();

                this.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item);

                return this;
            },

            /**
             * Returns the jump table.
             *
             * @returns {Array}
             */
            getJumpTable: function getJumpTable() {
                return jumpTable;
            },

            /**
             * Returns the last entry of the jump table which represent the current state of the navigation.
             */
            getLastJump: function getLastJump() {
                return jumpTable.length > 0
                    ? jumpTable[jumpTable.length - 1]
                    : {};
            },

            /**
             * Returns all the item identifiers in order.
             *
             * @returns {Array}
             * @private
             */
            _getItems: function _getItems() {
                return this._getSimplifiedTestMap()
                    .map(function(row) {
                        return row.item;
                    })
                    .filter(function(value, index, thisArg) {
                        return thisArg.indexOf(value) === index;
                    });
            },

            /**
             * Returns all the section identifiers in order.
             *
             * @returns {Array}
             * @private
             */
            _getSections: function _getSections() {
                return this._getSimplifiedTestMap()
                    .map(function(row) {
                        return row.section;
                    })
                    .filter(function(value, index, thisArg) {
                        return thisArg.indexOf(value) === index;
                    });
            },

            /**
             * Returns all the part identifiers in order.
             *
             * @returns {Array}
             * @private
             */
            _getParts: function _getParts() {
                return this._getSimplifiedTestMap()
                    .map(function(row) {
                        return row.part;
                    })
                    .filter(function(value, index, thisArg) {
                        return thisArg.indexOf(value) === index;
                    });
            },

            /**
             * Returns a simplified test map array, which will contain the item, section and part identifiers.
             *
             * @returns {Array}
             * @private
             */
            _getSimplifiedTestMap: function _getSimplifiedTestMap() {
                var simplifiedTestMap = [];

                Object.keys(testMap.parts).forEach(function(partIdentifier) {
                    var part = testMap.parts[partIdentifier];
                    Object.keys(part.sections).forEach(function(sectionIdentifier) {
                        var section = part.sections[sectionIdentifier];
                        Object.keys(section.items).forEach(function(itemIdentifier) {
                            var item = section.items[itemIdentifier];

                            simplifiedTestMap.push({
                                item: itemIdentifier,
                                itemHasBranchRule: !_.isEmpty(item.branchRule),
                                itemBranchRule: item.branchRule,
                                section: sectionIdentifier,
                                sectionHasBranchRule: !_.isEmpty(section.branchRule),
                                sectionBranchRule: section.branchRule,
                                part: partIdentifier,
                                partHasBranchRule: !_.isEmpty(part.branchRule),
                                partBranchRule: part.branchRule
                            });
                        });
                    });
                });

                return simplifiedTestMap;
            }
        };
    };

    return offlineJumpTableFactory;
});

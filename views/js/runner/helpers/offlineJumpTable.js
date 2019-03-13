define([], function () {
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
     *
     * @returns {{jumpToNextPart: (function(): offlineJumpTableFactory), getLastJump: (function(): {}), _getSections: (function(): *[]), jumpToNextItem: (function(): offlineJumpTableFactory), _getItems: (function(): *[]), addJump: (function(String, String, String): offlineJumpTableFactory), getJumpTable: (function(): Array), jumpTo: (function(Integer): offlineJumpTableFactory), jumpToPreviousSection: (function(): offlineJumpTableFactory), _getSimplifiedTestMap: (function(): Array), jumpToNextSection: (function(): offlineJumpTableFactory), clearJumpTable: (function(): offlineJumpTableFactory), _getParts: (function(): *[]), jumpToPreviousItem: (function(): offlineJumpTableFactory), jumpToPreviousPart: (function(): offlineJumpTableFactory)}}
     */
    var offlineJumpTableFactory = function offlineJumpTableFactory(itemStore) {
        var testMap = {};
        var jumpTable = [];

        return {
            setTestMap: function setTestMap(map) {
                testMap = map;

                return this;
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
             * @returns {offlineJumpTableFactory}
             */
            addJump: function addJump(partIdentifier, sectionIdentifier, itemIdentifier) {
                var nextPosition = 'position' in this.getLastJump()
                    ? this.getLastJump().position + 1
                    : 0;

                jumpTable.push({
                    item: itemIdentifier,
                    part: partIdentifier,
                    section: sectionIdentifier,
                    position: nextPosition,
                });

                return this;
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
             *
             * @returns {offlineJumpTableFactory}
             */
            jumpToNextItem: function jumpToNextItem() {
                var lastJumpItem = this.getLastJump().item || null;
                var items = this._getItems();
                var itemSliceIndex = items.indexOf(lastJumpItem);
                var itemIdentifierToAdd = items.slice(itemSliceIndex + 1).shift();
                var itemToAdd = this._getSimplifiedTestMap()
                    .filter(function(row) {
                        return row.item === itemIdentifierToAdd;
                    })
                    .shift();

                if (itemToAdd) {
                    this.addJump(itemToAdd.part, itemToAdd.section, itemToAdd.item);
                }

                return this;
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
             *
             * @returns {Object}
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
                    .filter(function(value, index, self) {
                        return self.indexOf(value) === index;
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
                    .filter(function(value, index, self) {
                        return self.indexOf(value) === index;
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
                    .filter(function(value, index, self) {
                        return self.indexOf(value) === index;
                    });
            },

            /**
             * Returns a simplified test map array, which will contain the item, section and part identifiers.
             * TODO: extend with branching rules
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
                                itemBranchRule: item.branchRule,
                                section: sectionIdentifier,
                                sectionBranchRule: section.branchRule,
                                part: partIdentifier,
                                partBranchRule: part.branchRule,
                            });
                        });
                    });
                });

                return simplifiedTestMap;
            },
        };
    };

    return offlineJumpTableFactory;
});

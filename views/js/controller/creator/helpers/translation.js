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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define(['jquery', 'i18n', 'services/translation', 'taoQtiTest/controller/creator/helpers/testModel'], function (
    $,
    __,
    translationService,
    testModelHelper
) {
    const translationStatusLabels = {
        translating: __('In progress'),
        translated: __('Translation completed'),
        pending: __('Pending'),
        none: __('No translation')
    };
    const translationStatusIcons = {
        translating: 'remove',
        translated: 'success',
        pending: 'info',
        none: 'warning'
    };

    /**
     * Process all sections and subsections in the model.
     * @param {object} section
     * @param {function} cb
     */
    function recurseSections(section, cb) {
        cb(section);
        if (section.sectionParts) {
            section.sectionParts.forEach(sectionPart => recurseSections(sectionPart, cb));
        }
    }

    /**
     * Get JSON data from a URL.
     * @param {string} url - The URL to get the JSON data from.
     * @returns {Promise}
     */
    const getJSON = url => new Promise((resolve, reject) => $.getJSON(url).done(resolve).fail(reject));

    return {
        /**
         * Get the translation status badge info.
         * @param {string} translationStatus - The translation status.
         * @returns {object}
         * @returns {string} object.status - The translation status.
         * @returns {string} object.label - A translated label for the translation status.
         * @returns {string} object.icon - The icon for the translation status.
         */
        getTranslationStatusBadgeInfo(translationStatus) {
            if (!translationStatus) {
                translationStatus = 'none';
            }
            return {
                status: translationStatus,
                label: translationStatusLabels[translationStatus],
                icon: translationStatusIcons[translationStatus]
            };
        },

        /**
         * Get the status of the translation.
         * @param {object} data
         * @returns {string}
         */
        getTranslationStatus(data) {
            const translation = data && translationService.getTranslationsProgress(data.resources)[0];
            if (!translation || translation == 'pending') {
                return 'translating';
            }
            return translation;
        },

        /**
         * Get the language of the translation.
         * @param {object} data
         * @returns {object}
         * @returns {string} object.value
         * @returns {string} object.literal
         */
        getTranslationLanguage(data) {
            return data && translationService.getTranslationsLanguage(data.resources)[0];
        },

        /**
         * Get the translation configuration.
         * @param {string} testUri - The test URI.
         * @param {string} originTestUri - The origin test URI.
         * @returns {Promise}
         */
        getTranslationConfig(testUri, originTestUri) {
            return translationService
                .getTranslations(originTestUri, translation => translation.resourceUri === testUri)
                .then(data => {
                    const translation = this.getTranslationStatus(data);
                    const language = this.getTranslationLanguage(data);

                    const config = { translationStatus: translation };
                    if (language) {
                        config.translationLanguageUri = language.value;
                        config.translationLanguageCode = language.literal;
                    }
                    return config;
                });
        },

        /**
         * Update the model from the origin.
         * @param {object} model - The model to update.
         * @param {string} originUrl - The origin URL.
         * @returns {Promise<object>} - The origin model.
         */
        updateModelFromOrigin(model, originUrl) {
            return getJSON(originUrl).then(originModel => {
                this.updateModelForTranslation(model, originModel);
                return originModel;
            });
        },

        /**
         * Register the model identifiers.
         * @param {object} model
         * @returns {object} - The model identifiers.
         */
        registerModelIdentifiers(model) {
            const identifiers = {};
            function registerIdentifier(fragment) {
                if (fragment && 'undefined' !== typeof fragment.identifier) {
                    identifiers[fragment.identifier] = fragment;
                }
            }

            model.testParts.forEach(testPart => {
                registerIdentifier(testPart);
                testPart.assessmentSections.forEach(section => {
                    recurseSections(section, sectionPart => registerIdentifier(sectionPart));
                });
            });

            return identifiers;
        },

        /**
         * Set the translation origin for a fragment in the translation model.
         * @param {object} model -  The model fragment.
         * @param {string} model.identifier - The model fragment identifier.
         * @param {object} originModel - The origin model.
         */
        setTranslationFromOrigin(model, originModel) {
            model.translation = true;
            if (!originModel) {
                return;
            }
            if ('undefined' !== typeof originModel.title) {
                model.originTitle = originModel.title;
            }
            if (Array.isArray(model.rubricBlocks) && Array.isArray(originModel.rubricBlocks)) {
                model.rubricBlocks.forEach((rubricBlock, rubricBlockIndex) => {
                    const originRubricBlock = originModel.rubricBlocks[rubricBlockIndex];
                    if (originRubricBlock) {
                        rubricBlock.translation = true;
                        rubricBlock.originContent = originRubricBlock.content;
                    }
                });
            }
        },

        /**
         * Set the translation origin for all fragments in the translation model.
         * @param {object} model
         * @param {object} originModel
         */
        updateModelForTranslation(model, originModel) {
            const originIdentifiers = this.registerModelIdentifiers(originModel);
            this.setTranslationFromOrigin(model, originModel);
            model.testParts.forEach(testPart => {
                const originTestPart = originIdentifiers[testPart.identifier];
                if (originTestPart) {
                    this.setTranslationFromOrigin(testPart, originTestPart);
                }
                testPart.assessmentSections.forEach(section => {
                    recurseSections(section, sectionPart => {
                        const originSectionPart = originIdentifiers[sectionPart.identifier];
                        if (originSectionPart) {
                            this.setTranslationFromOrigin(sectionPart, originSectionPart);
                        }
                    });
                });
            });
        },

        /**
         * List the URI of all items in the model.
         * @param {object} model
         * @returns {string[]}
         */
        listItemRefs(model) {
            const itemRefs = [];
            testModelHelper.eachItemInTest(model, itemRef => {
                itemRefs.push(itemRef.href);
            });
            return itemRefs;
        },

        /**
         * Get the translation status of the resource for a given language.
         * @param {string|string[]} resourceUri - The resource URI or the list of resource URIs.
         * @param {string} languageUri - The language URI.
         * @returns {Promise<Array[string[]]>} - The status of the translation, as an array of pairs [resourceUri, status].
         */
        getResourceTranslationStatus(resourceUri, languageUri) {
            return translationService.getTranslations(resourceUri, languageUri).then(data => {
                if (!Array.isArray(resourceUri)) {
                    resourceUri = [resourceUri];
                }
                return translationService
                    .getTranslationsProgress(data.resources)
                    .map((status, index) => [resourceUri[index], status]);
            });
        },

        /**
         * Gets the status of the items in the model.
         * @param {object} model - The model.
         * @param {string} languageUri - The language URI.
         * @returns {Promise<object>} - The status of the items, the key is the item URI and the value is the status.
         */
        getItemsTranslationStatus(model, languageUri) {
            return this.getResourceTranslationStatus(this.listItemRefs(model), languageUri).then(items =>
                items.reduce((acc, [itemUri, status]) => {
                    acc[itemUri] = status;
                    return acc;
                }, {})
            );
        }
    };
});

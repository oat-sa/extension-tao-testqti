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
define(['jquery', 'services/translation'], function ($, translationService) {
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
     * Set the translation origin for a fragment in the translation model.
     * @param {object} fragment -  The fragment.
     * @param {string} fragment.identifier - The fragment identifier.
     * @param {object} origin - The origin model.
     */
    function setTranslationOrigin(fragment, origin) {
        fragment.translation = true;
        if (!origin) {
            return;
        }
        if ('undefined' !== typeof origin.title) {
            fragment.originTitle = origin.title;
        }
        if (Array.isArray(fragment.rubricBlocks) && Array.isArray(origin.rubricBlocks)) {
            fragment.rubricBlocks.forEach((rubricBlock, rubricBlockIndex) => {
                const originRubricBlock = origin.rubricBlocks[rubricBlockIndex];
                if (originRubricBlock) {
                    rubricBlock.translation = true;
                    rubricBlock.originContent = originRubricBlock.content;
                }
            });
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
         * @returns {Promise}
         */
        updateModelFromOrigin(model, originUrl) {
            return getJSON(originUrl).then(originModel => this.updateModelForTranslation(model, originModel));
        },

        /**
         * Set the translation origin for all fragments in the translation model.
         * @param {object} model
         * @param {object} originModel
         */
        updateModelForTranslation(model, originModel) {
            const originIdentifiers = {};
            function registerIdentifier(fragment) {
                if (fragment && 'undefined' !== typeof fragment.identifier) {
                    originIdentifiers[fragment.identifier] = fragment;
                }
            }

            originModel.testParts.forEach(testPart => {
                registerIdentifier(testPart);
                testPart.assessmentSections.forEach(section => {
                    recurseSections(section, sectionPart => registerIdentifier(sectionPart));
                });
            });

            setTranslationOrigin(model, originModel);
            model.testParts.forEach(testPart => {
                const originTestPart = originIdentifiers[testPart.identifier];
                if (originTestPart) {
                    setTranslationOrigin(testPart, originTestPart);
                }
                testPart.assessmentSections.forEach(section => {
                    recurseSections(section, sectionPart => {
                        const originSectionPart = originIdentifiers[sectionPart.identifier];
                        if (originSectionPart) {
                            setTranslationOrigin(sectionPart, originSectionPart);
                        }
                    });
                });
            });
        }
    };
});

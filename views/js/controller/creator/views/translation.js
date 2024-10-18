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
define(['jquery', 'services/translation', 'taoQtiTest/controller/creator/templates/index'], function (
    $,
    translationService,
    templates
) {
    'use strict';

    /**
     * The TranslationView setups translation related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/translation
     * @param {Object} creatorContext
     */
    function translationView(creatorContext) {
        const modelOverseer = creatorContext.getModelOverseer();
        const config = modelOverseer.getConfig();

        if (!config.translation) {
            return;
        }

        const { uri: resourceUri, originResourceUri } = config;

        translationService
            .getTranslations(originResourceUri, translation => translation.resourceUri === resourceUri)
            .then(data => {
                const language = data && translationService.getTranslationsLanguage(data.resources)[0];
                let translation = data && translationService.getTranslationsProgress(data.resources)[0];
                if (!translation || translation == 'pending') {
                    translation = 'translating';
                }
                config.translationStatus = translation;
                if (language) {
                    config.translationLanguageUri = language.value;
                    config.translationLanguageCode = language.literal;
                }

                const $container = $('.test-creator-props');
                const template = templates.properties.translation;
                const $view = $(template(config)).appendTo($container);

                $view.on('change', '[name="translationStatus"]', e => {
                    const input = e.target;
                    config.translationStatus = input.value;
                });
            })
            .catch(error => creatorContext.trigger('error', error));
    }

    return translationView;
});

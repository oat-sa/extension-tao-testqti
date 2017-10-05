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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * Instanciate a Wysiwyg editor to create QTI content
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'lib/uuid',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiCreator/editor/containerEditor'
], function(_, $, uuid, qtiCommonRenderer, containerEditor) {
    'use strict';

    return {
        create: function create(modelOverseer, areaBroker, $container, options) {
            var self = this,
                $document = $(document),
                editorId = uuid();

            var removePlugins = [
                    'magicline',
                    'taoqtiimage',
                    'taoqtimedia',
                    'taoqtimaths',
                    'taoqtiinclude',
                    'taoqtitable',
                    'sharedspace' // That Ck instance still use floatingspace to position the toolbar, whereas the sharedspace plugin is used by the Item creator
                ].join(','),

                toolbar = [
                    {
                        name : 'basicstyles',
                        items : ['Bold', 'Italic', 'Subscript', 'Superscript']
                    }, {
                        name : 'insert',
                        items : ['SpecialChar', 'TaoQtiPrintedVariable']
                    }, {
                        name : 'links',
                        items : ['Link']
                    },
                    '/',
                    {
                        name : 'styles',
                        items : ['Format']
                    }, {
                        name : 'paragraph',
                        items : ['NumberedList', 'BulletedList', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                    }
                ];

            qtiCommonRenderer.setContext(areaBroker.getContentCreatorPanelArea());

            containerEditor.create($container, {
                areaBroker: areaBroker,
                removePlugins: removePlugins,
                toolbar: toolbar,
                metadata: {
                    outcomes: modelOverseer.getOutcomesNames()
                },
                change: options.change || _.noop,
                resetRenderer: true
            });

            // destroying ckInstance on editor close
            $document.on('creatorclose.' + editorId, function() {
                self.destroy($container);
                $document.off('.' + editorId);
            });
        },

        destroy: function destroy($container) {
            containerEditor.destroy($container);
        }
    };
});
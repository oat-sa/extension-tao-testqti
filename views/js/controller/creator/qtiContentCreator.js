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
    'taoQtiItem/qtiCreator/editor/containerEditor'
], function(_, containerEditor) {
    'use strict';

    return {
        init: function init(areaBroker, $dom) {
            var removePlugins = [
                    'taoqtiimage',
                    'taoqtimedia',
                    'taoqtimaths',
                    'taoqtiinclude',
                    'taoqtitable',
                    'sharedspace' // the toolbar positioning plugin now used by the the item creator. That Ck instance still use floatingspace
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

            containerEditor.create($dom, {
                areaBroker: areaBroker,
                removePlugins: removePlugins,
                toolbar: toolbar
            });
        }
    };
});
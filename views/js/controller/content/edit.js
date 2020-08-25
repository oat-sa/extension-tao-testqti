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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define(['taoQtiTest/lib/codemirror/xmleditor', 'taoQtiTest/lib/codemirror/schemas/ims_qti_v2p1', 'css!taoQtiTestCss/xml-editor'], function (
    xmlEditor,
    schemaInfo
) {
    'use strict';

    const Controller = {
        start() {
            const textAreaComponent = document.getElementById('xmlString');

            if (textAreaComponent === null) {
                return;
            }

            const testEditor = xmlEditor(textAreaComponent, { schemaInfo });

            testEditor.setSize('100%', 420);
        }
    };

    return Controller;
});

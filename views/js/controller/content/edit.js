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

define(['lodash', 'codemirror', 'css!codemirror/lib/codemirror', 'codemirror/mode/xml/xml'], function (_, CodeMirror) {
    'use strict';

    const Controller = {
        start() {
            const textAreaComponent = document.getElementById('xmlString');

            if (textAreaComponent === null) {
                return;
            }
            const testEditor = CodeMirror.fromTextArea(textAreaComponent, {
                mode: 'xml',
                lineNumbers: true
            });

            testEditor.setSize(720, 420);
            testEditor.on('change', function (cMirror) {
                textAreaComponent.value = cMirror.getValue();
            });
        }
    };

    return Controller;
});

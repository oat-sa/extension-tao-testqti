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

define([
    'codemirror',
    'codemirror/addon/hint/show-hint',
    'codemirror/addon/hint/xml-hint',
    'codemirror/mode/xml/xml',
    'css!codemirror/addon/hint/show-hint',
    'css!codemirror/lib/codemirror'
], function (CodeMirror) {
    'use strict';

    /**
     * Creates codemirror instance
     *
     * @param {HTMLTextAreaElement} textAreaComponent
     * @param {} options
     * @returns { testEditor| undefined }
     */
    const xmlEditorFactory = (textAreaComponent, options) => {
        if (textAreaComponent === null) {
            return;
        }

        const { schemaInfo = {} } = options;
        const testEditor = CodeMirror.fromTextArea(textAreaComponent, {
            mode: 'xml',
            lineNumbers: true,
            extraKeys: {
                "'<'": completeAfter,
                "'/'": completeIfAfterLt,
                "' '": completeIfInTag,
                "'='": completeIfInTag,
                'Shift-Space': 'autocomplete'
            },
            hintOptions: { schemaInfo }
        });

        testEditor.on('change', function (cMirror) {
            textAreaComponent.value = cMirror.getValue();
        });

        function completeAfter(cm, pred) {
            const cur = cm.getCursor();
            if (!pred || pred())
                setTimeout(function () {
                    if (!cm.state.completionActive) cm.showHint({ completeSingle: false });
                }, 100);
            return CodeMirror.Pass;
        }

        function completeIfAfterLt(cm) {
            return completeAfter(cm, function () {
                const cur = cm.getCursor();
                return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == '<';
            });
        }

        function completeIfInTag(cm) {
            return completeAfter(cm, function () {
                const tok = cm.getTokenAt(cm.getCursor());
                if (
                    tok.type == 'string' &&
                    (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)
                )
                    return false;
                const inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
                return inner.tagName;
            });
        }

        return testEditor;
    };

    return xmlEditorFactory;
});

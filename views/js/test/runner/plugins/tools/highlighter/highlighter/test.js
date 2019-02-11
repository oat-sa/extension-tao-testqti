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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/runner/plugins/tools/highlighter/highlighter'
], function($, highlighterFactory) {
    'use strict';


    QUnit.module('highlighterFactory');

    QUnit.test('module', function(assert) {
        assert.ok(typeof highlighterFactory === 'function', 'the module expose a function');
    });

    QUnit.module('highlight mode');

    QUnit.test('Toggle highlight mode on/off', function(assert) {
        var highlighter = highlighterFactory();
        var selection = window.getSelection();
        var range = document.createRange();
        var container = document.getElementsByClassName('qti-itemBody')[0];
        var highlightedElement;

        selection.removeAllRanges();

        // switch on highlight mode
        highlighter.highlight();

        // create first selection
        range.setStart(container.firstChild, 0);
        range.setEnd(container.firstChild, 'This text is available for your highlighting needs'.length);
        selection.addRange(range);

        assert.equal(selection.toString().trim(), 'This text is available for your highlighting needs', 'correct selection has been made');

        $(document).trigger('mouseup');

        // check that highlight has been made
        highlightedElement = document.getElementsByClassName('txt-user-highlight')[0];
        assert.ok(highlightedElement, 'highlight has been found');
        assert.equal(highlightedElement.textContent.trim(), 'This text is available for your highlighting needs', 'correct content has been highlighted');

        // create second selection
        range.setStart(container.childNodes[1], '. Please feel free to '.length);
        range.setEnd(container.childNodes[1], '. Please feel free to highlight'.length);
        selection.addRange(range);

        assert.equal(selection.toString().trim(), 'highlight', 'correct selection has been made');

        $(document).trigger('mouseup');

        // check that highlight has been made
        highlightedElement = document.getElementsByClassName('txt-user-highlight')[1];
        assert.ok(highlightedElement, 'highlight has been found');
        assert.equal(highlightedElement.textContent.trim(), 'highlight', 'correct content has been highlighted');

        // switch off highlight mode
        highlighter.highlight();

        // create third selection
        range.setStart(container.childNodes[3], ' as much as you '.length);
        range.setEnd(container.childNodes[3], container.childNodes[3].length);
        selection.addRange(range);

        assert.equal(selection.toString().trim(), 'want.', 'correct selection has been made');

        $(document).trigger('mouseup');

        // check that no new highlight has been made
        highlightedElement = document.getElementsByClassName('txt-user-highlight')[2];
        assert.ok(typeof highlightedElement === 'undefined', 'no new highlight has been found');
    });

    QUnit.module('one shot highlight');

    QUnit.test('Highlight current selection, if any', function(assert) {
        var highlighter = highlighterFactory();
        var selection = window.getSelection();
        var range = document.createRange();
        var container = document.getElementsByClassName('qti-itemBody')[0];
        var sampleText = container.textContent.trim();
        var highlightedElement;

        selection.removeAllRanges();

        range.selectNodeContents(container);
        selection.addRange(range);

        assert.equal(selection.toString().trim(), sampleText, 'selection is correct');

        highlighter.highlight();

        highlightedElement = document.getElementsByClassName('txt-user-highlight')[0];

        assert.ok(highlightedElement, 'highlight has been found');
        assert.equal(sampleText, highlightedElement.textContent.trim(), 'text has been highlighted');
    });

    QUnit.test('Do not perform highlight if selection is collapsed', function(assert) {
        var highlighter = highlighterFactory();
        var selection = window.getSelection();
        var range = document.createRange();
        var container = document.getElementsByClassName('qti-itemBody')[0];
        var highlightedElement;

        selection.removeAllRanges();

        range.selectNodeContents(container);
        range.collapse();
        selection.addRange(range);

        assert.equal(selection.toString().trim(), '', 'selection is correct');

        highlighter.highlight();

        highlightedElement = document.getElementsByClassName('txt-user-highlight')[0];

        assert.ok(typeof highlightedElement === 'undefined', 'no highlight has been found');
    });

});

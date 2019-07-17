
/*
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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 *
 */
/**
 *
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';
    /**
     * Check for iOS platform
     * @type {Boolean}
     */
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    /**
     * File type
     * @type {string}
     */
    var type = iOS ? 'data:application/octet-stream' : 'data:text/plain';

    /**
     * Make the browser start downloading a file
     * @param {String} filename
     * @param {String} content - String to write to the file
     * @throws {TypeError}
     * @returns {Boolean}
     */
    var download = function download(filename, content) {
        var element;

        if (_.isEmpty(filename) || !_.isString(filename)) {
            throw new TypeError('Invalid filename');
        }

        if (_.isUndefined(content)) {
            throw new TypeError('Invalid content');
        }

        if (!_.isString(content)) {
            content = JSON.stringify(content);
        }

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(new Blob([content], { type: type }), filename);
            return true;
        }

        element = document.createElement('a');
        iOS && element.setAttribute('target', '_blank');
        element.setAttribute('href', type + ';charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        return true;
    };

    /**
     * @exports download
     */
    return download;
});

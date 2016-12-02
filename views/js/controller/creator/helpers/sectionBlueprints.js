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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'i18n',
    'core/errorHandler'
], function (_, __, errorHandler){

    'use strict';

    var _ns = '.sectionBlueprint';


    /**
     * Set an array of categories to the section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {string} blueprint
     * @returns {undefined}
     */
    function setBlueprint(model, blueprint){
        model.blueprint = blueprint;
    }

    /**
     * Get the categories assign to the section model, infered by its interal itemRefs
     *
     * @param {string} getUrl
     * @param {object} model
     * @returns {object}
     */
    function getBlueprint(getUrl, model){

        return $.ajax({
            url: getUrl,
            type: 'GET',
            data: {
                section: model.identifier
            },
            dataType: 'json'

        })
        .fail(function () {
            errorHandler.throw(_ns, 'invalid tool config format');
        });

    }

    return {
        setBlueprint : setBlueprint,
        getBlueprint : getBlueprint
    };
});

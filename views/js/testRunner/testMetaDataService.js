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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * @param {Object} [metaData] - Metadata to be sent to the server. Will be saved in result storage as a trace variable.
 * Example:
 * <pre>
 * {
 *   "TEST" : {
 *      "TEST_EXIT_CODE" : "T"
 *   },
 *   "SECTION" : {
 *      "SECTION_EXIT_CODE" : 704
 *   }
 * }
 * </pre>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    var _testServiceCallId,
        _data = {};

    function getTestServiceCallId () {
        return _testServiceCallId;
    }

    function setTestServiceCallId (value) {
        _testServiceCallId = value;
    }

    function setData(data) {
        _data = data;
        //store to local storage
    }

    function addData( data) {
         _.merge(_data, data);
        //store to local storage
    }

    function getData() {
        return _.clone(_data);
    }

    function clearData(level) {
        _data = {};
    }

    function destroy() {
        console.log('destroy');
        //remove from localstorage all data related to current ServiceCallId
    }

    return {
        setData : setData,
        getData : getData,
        addData : addData,
        clearData : clearData,
        getTestServiceCallId : setTestServiceCallId,
        setTestServiceCallId : setTestServiceCallId,
        destroy : destroy,
        'SECTION_EXIT_CODE': {
            'COMPLETED_NORMALLY': 700,
            'QUIT': 701,
            'COMPLETE_TIMEOUT': 703,
            'TIMEOUT': 704,
            'FORCE_QUIT': 705,
            'IN_PROGRESS': 706,
            'ERROR': 300
        },
        'TEST_EXIT_CODE': {
            'COMPLETE': 'C',
            'TERMINATED': 'T',
            'INCOMPLETE': 'IC',
            'INCOMPLETE_QUIT': 'IQ',
            'INACTIVE': 'IA',
            'CANDIDATE_DISAGREED_WITH_NDA': 'DA'
        }
    };
});
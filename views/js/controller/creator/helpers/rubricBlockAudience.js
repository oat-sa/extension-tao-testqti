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
 * Foundation, Inc., 31 Milk Street, # 960789, Boston, MA 02196, USA.
 *
 * Copyright (c) 2014-2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define(['lodash'], function (_) {
    'use strict';

    const rubricBlockViewOptions = [
        { value: 'candidate', label: 'Candidate' },
        { value: 'author', label: 'Author' },
        { value: 'proctor', label: 'Proctor' },
        { value: 'scorer', label: 'Scorer' },
        { value: 'testConstructor', label: 'Test constructor' },
        { value: 'tutor', label: 'Tutor' }
    ];

    let options = rubricBlockViewOptions.slice();

    return {
        getOptions() {
            return options.slice();
        },

        getDefaultView() {
            return options[0].value;
        },

        getValidView(view, legacyViews) {
            const allowedValues = options.map(option => option.value);
            const legacyValue = _.isArray(legacyViews) && legacyViews.length > 0 ? legacyViews[0] : null;
            const candidateValue = typeof view === 'string' && view.length > 0 ? view : legacyValue;

            return _.includes(allowedValues, candidateValue) ? candidateValue : this.getDefaultView();
        }
    };
});

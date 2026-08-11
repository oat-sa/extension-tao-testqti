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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Shared helper for QTI rule expressions (branchRules, preConditions).
 */
define([], function () {
    'use strict';

    /**
     * Check whether an expression is UI-compatible (simple comparison with variable and value).
     * @param {Object} expr - The expression object to check.
     * @returns {boolean} True if expression can be rendered in the UI.
     */
    function isUiCompatibleExpression(expr) {
        if (!expr) return false;

        const supported = ['lt', 'lte', 'equal', 'gt', 'gte'];
        if (!supported.includes(expr['qti-type'])) return false;

        const parts = Array.isArray(expr.expressions) ? expr.expressions : [];
        if (parts.length !== 2) return false;

        const hasVariable = parts.some(p =>
            p && p['qti-type'] === 'variable' && p.identifier
        );

        const hasBaseValue = parts.some(p =>
            p && p['qti-type'] === 'baseValue'
        );

        return hasVariable && hasBaseValue;
    }

    return {
        isUiCompatibleExpression
    };
});

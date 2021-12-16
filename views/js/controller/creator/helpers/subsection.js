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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */
define(['jquery', 'lodash'], function ($, _) {
    'use strict';

    /**
     * Check if this is first level of subsections
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function isFistLevelSubsection($subsection) {
        return $subsection.parents('.subsection').length === 0;
    }
    /**
     * Check if this is nested subsections (2nd level)
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function isNestedSubsection($subsection) {
        return $subsection.parents('.subsection').length > 0;
    }
    /**
     * Get subsections of this section/subsection (without nesting subsection)
     *
     * @param {JQueryElement} $section
     * @returns {boolean}
     */
    function getSubsections($section) {
        return $section.children('.subsections').children('.subsection');
    }
    /**
     * Get siblings subsections of this subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getSiblingSubsections($subsection) {
        return getSubsectionContainer($subsection).children('.subsection');
    }
    /**
     * Get parent subsection of this nested subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getParentSubsection($subsection) {
        return $subsection.parents('.subsection').first();
    }
    /**
     * Get parent container('.subsections') for this subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getSubsectionContainer($subsection) {
        return $subsection.hasClass('subsections') ? $subsection : $subsection.parents('.subsections').first();
    }

    return {
        isFistLevelSubsection,
        isNestedSubsection,
        getSubsections,
        getSubsectionContainer,
        getSiblingSubsections,
        getParentSubsection
    };
});

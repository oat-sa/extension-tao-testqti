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
 * Copyright (c) 2021-2022 (original work) Open Assessment Technologies SA;
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
     * Get parent section of this subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getParentSection($subsection) {
        return $subsection.parents('.section');
    }
    /**
     * Get parent section/subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getParent($subsection) {
        if (isFistLevelSubsection($subsection)) {
            return getParentSection($subsection);
        }
        return getParentSubsection($subsection);
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

    /**
     * Get index for this subsection
     *
     * @param {JQueryElement} $subsection
     * @returns {boolean}
     */
    function getSubsectionTitleIndex($subsection) {
        const $parentSection = getParentSection($subsection);
        const index = getSiblingSubsections($subsection).index($subsection);
        const sectionIndex = $parentSection.parents('.sections').children('.section').index($parentSection);
        if (isFistLevelSubsection($subsection)) {
            return `${sectionIndex + 1}.${index + 1}.`;
        } else {
            const $parentSubsection = getParentSubsection($subsection);
            const subsectionIndex = getSiblingSubsections($parentSubsection).index($parentSubsection);
            return `${sectionIndex + 1}.${subsectionIndex + 1}.${index + 1}.`;
        }
    }

    return {
        isFistLevelSubsection,
        isNestedSubsection,
        getSubsections,
        getSubsectionContainer,
        getSiblingSubsections,
        getParentSubsection,
        getParentSection,
        getParent,
        getSubsectionTitleIndex
    };
});

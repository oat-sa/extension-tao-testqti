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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * CSS Selectors for setup
 */
export default {
    testsPage: {
        testImportbutton: '#test-import',
        fileInput: '.main-container .file-uploader input[type="file"]',
        fileImportButton: '.content-block .form-toolbar button[title="Import"]',
        feedbackContinueButton: '.feedback-success button[title="continue"]',
        testPublishButton: '#test-publish',
        destinationSelector: '.destination-selector',
        destinationSelectorActions: '.destination-selector .actions',
        testsPanel: '#panel-manage_tests'
    },
    deliveriesPage: {
       resourceTree: '.taotree-delivery',
       formContainer: '#form-container'
    }
};
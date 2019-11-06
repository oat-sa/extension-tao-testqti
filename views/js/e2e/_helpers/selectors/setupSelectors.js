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
        rootTestClass:'li[data-uri="http://www.tao.lu/Ontologies/TAOTest.rdf#Test"]',
        testImportButton: '#test-import',
        fileInput: '.main-container .file-uploader input[type="file"]',
        fileImportButton: '.content-block .form-toolbar button[title="Import"]',
        feedbackContinueButton: '.feedback-success button[title="continue"]',
        testPublishButton: '#test-publish',
        destinationSelector: '.destination-selector',
        destinationSelectorActions: '.destination-selector .actions',
        deliveryTypeTabs: '.tab-group.rendered'
    },
    deliveriesPage: {
        rootDeliveryClass: 'li[data-uri="http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery"]',
        formContainer: '#form-container',
        guestAccessCheckbox: '#form-container input[name="http_2_www_0_tao_0_lu_1_Ontologies_1_TAODelivery_0_rdf_3_AccessSettings_0"]'
    }
};

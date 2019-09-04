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

import {commonInteractionSelectors, fileUploadInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/pointerCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64FileUploadInteractionTest';

describe('Interactions', () => {

    /**
     * Setup to have a proper delivery:
     * - Start server
     * - Add necessary routes
     * - Admin login
     * - Import test package
     * - Publish imported test as a delivery
     * - Set guest access on delivery and save
     * - Logout
     */
    before(() => {
        // cy.setupServer();
        // cy.addBackOfficeRoutes();
        // cy.login('admin');
        // cy.importTestPackage(base64Test, 'e2e fileupload interaction test');
        // cy.publishTest('e2e fileupload interaction test');
        // cy.setDeliveryForGuests('Delivery of e2e fileupload interaction test');
        // cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e fileupload interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        // cy.setupServer();
        // cy.addBackOfficeRoutes();
        // cy.login('admin');
        // cy.deleteItem('e2e fileupload interaction test');
        // cy.deleteTest('e2e fileupload interaction test');
        // cy.deleteDelivery('Delivery of e2e fileupload interaction test');
    });

    /**
     * Interactions tests
     */
    describe('File upload interaction', () => {

        it('Loads in proper state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-info');
                cy.get(fileUploadInteractionSelectors.fileUploadInput).should('exist').and('be.visible');
                cy.get(fileUploadInteractionSelectors.fileUploadPreview).should('exist').and('be.visible');
            });
        });

        describe('Only image files allowed to be uploaded', () => {

            it('Uploads an image file with correct mime type', function () {
                // Prepare to load fixture
                const fileName = 'sample.png';
                const cwd = Cypress.spec.absolute.substring(0, Cypress.spec.absolute.lastIndexOf("/"));
                const absolutePathToFile = `${cwd}/fixtures/${fileName}`;

                // read file content as base64
                cy.readFile(absolutePathToFile, 'base64').then((fileContent) => {

                    // upload file using the file input
                    cy.get(fileUploadInteractionSelectors.fileUploadInput).upload(
                        {
                            fileContent,
                            fileName,
                            mimeType: 'image/png',
                            encoding: 'base64'
                        },
                        {
                            subjectType: 'input',
                            force: true
                        }
                    );
                });

                cy.get(commonInteractionSelectors.interaction).within(() => {
                    // feedback updated
                    cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-success');
                    //progress bar updated
                    cy.get(fileUploadInteractionSelectors.progressBar).find('span').should("have.attr", "title", "100%");
                    // preview updated
                    cy.get(fileUploadInteractionSelectors.fileUploadPreview).find('img').should('exist').and('be.visible');
                });

            });

            it('Do not upload an image file with incorrect mime type', function () {
                // Prepare to load fixture
                const fileName = 'sample.png';
                const cwd = Cypress.spec.absolute.substring(0, Cypress.spec.absolute.lastIndexOf("/"));
                const absolutePathToFile = `${cwd}/fixtures/${fileName}`;

                // read file content as base64
                cy.readFile(absolutePathToFile, 'base64').then((fileContent) => {

                    // upload file using the file input
                    cy.get(fileUploadInteractionSelectors.fileUploadInput).upload(
                        {
                            fileContent,
                            fileName,
                            mimeType: 'application/zip',
                            encoding: 'base64'
                        },
                        {
                            subjectType: 'input',
                            force: true
                        }
                    );
                });

                cy.get(commonInteractionSelectors.interaction).within(() => {
                    // feedback updated
                    cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-error');
                    //progress bar updated
                    cy.get(fileUploadInteractionSelectors.progressBar).find('span').should("have.attr", "title", "0%");
                    // preview updated
                    cy.get(fileUploadInteractionSelectors.fileUploadPreview).find('img').should('not.exist');
                });

            });

            it('Do not upload a zip file', function () {
                // Prepare to load fixture
                const fileName = 'sample.zip';
                const cwd = Cypress.spec.absolute.substring(0, Cypress.spec.absolute.lastIndexOf("/"));
                const absolutePathToFile = `${cwd}/fixtures/${fileName}`;

                // read file content as base64
                cy.readFile(absolutePathToFile, 'base64').then((fileContent) => {

                    // upload file using the file input
                    cy.get(fileUploadInteractionSelectors.fileUploadInput).upload(
                        {
                            fileContent,
                            fileName,
                            mimeType: 'application/zip',
                            encoding: 'base64'
                        },
                        {
                            subjectType: 'input',
                            force: true
                        }
                    );
                });

                cy.get(commonInteractionSelectors.interaction).within(() => {
                    // feedback updated
                    cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-error');
                    //progress bar updated
                    cy.get(fileUploadInteractionSelectors.progressBar).find('span').should("have.attr", "title", "0%");
                    // preview updated
                    cy.get(fileUploadInteractionSelectors.fileUploadPreview).find('img').should('not.exist');
                });

            });

        });

    });
});

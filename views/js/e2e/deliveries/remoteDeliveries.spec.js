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

import runnerSelectors from '../_helpers/selectors/runnerSelectors';

import '../_helpers/commands/setupCommands';
import '../_helpers/commands/cleanupCommands';
import '../_helpers/routes/backOfficeRoutes';

import base64Test from './fixtures/base64RemoteQtiExampleTestPackage';

describe('Remote deliveries', () => {

    const testTitle = 'e2e remote example test';
    let deliveryId;

    /**
     * Setup to have a proper delivery:
     * - Start server
     * - Add necessary routes
     * - Admin login
     * - Import and publish e2e example test
     * - Set guest access on delivery and save
     * - Logout
     * - Guest login
     */
    before(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, testTitle);
        cy.publishTest(testTitle, 'remote');
        cy.setDeliveryForGuests(testTitle);
        // Extract the published delivery id, we'll need it for LTI call
        cy.get('#http_2_www_0_tao_0_lu_1_Ontologies_1_taoDeliverConnect_0_rdf_3_PublishedDeliveryId')
            .then(els => {
                deliveryId = els[0].value;
                cy.log(deliveryId);
            });
        cy.logout();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.login('admin');
        cy.deleteItem(testTitle);
        cy.deleteTest(testTitle);
        cy.deleteDelivery(testTitle);
    });

    /**
     * Delivery tests
     */
    describe('Publish and access remote delivery', () => {

        it('Delivery can be reached through LTI call', function() {
            // Initiate LTI call to the provider TAO, with deliveryId
            const ltiParams = {
                key: 'key',
                secret: 'secret',
                lti_message_type: 'basic-lti-launch-request',
                lti_version: 'LTI-1p0',
                oauth_consumer_key: 'anything',
                resource_link_id: 'something',
                roles: 'Learner',
                user_id: '12345'
            };
            cy.request({
                url: `${Cypress.env('taoDeliverBackendUrl')}/api/v1/auth/launch-lti/${deliveryId}`,
                method: 'POST',
                form: true,
                body: ltiParams
            })
            .then(xhr => {
                cy.wrap(xhr).should(xhr => {
                    expect(xhr.status).to.equal(200);
                    expect(xhr.body).to.contain('TAO');
                });
                // we know we loaded a TAO page
                // TODO: further assertions to verify test content?
            });
        });
    });
});

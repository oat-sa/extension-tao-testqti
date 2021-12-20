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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */

/**
 * Note: this test requires the following:
 * - a dedicated user is created and defined in the the cypress env file through the properties testTakerUser and testTakerPass
 * - the test `taoQtiTest/views/cypress/fixtures/testPackages/warning-messages-test.zip` is imported
 * - the test is published and assigned to the user defined in the env file
 * - the delivery name is supplied through the cypress env file from the property deliveryIds.warningMessagesTest
 *
 * See the fixtures folder
 */

import { warningMessagesFirstLaunchSpecs, warningMessagesSecondLaunchSpecs } from './shared/warning-messages-test.js';
import { loginAndLaunchDelivery, checkReturnPage } from '../utils/delivery.js';

describe('Test warning messages', () => {
    const deliveryKey = 'warningMessagesTest';

    describe('Test warning messages (part 1)', () => {
        before(() => {
            loginAndLaunchDelivery(deliveryKey);
        });
        after(() => {
            checkReturnPage();
        });

        warningMessagesFirstLaunchSpecs();
    });

    describe('Test warning messages (part 2)', () => {
        before(() => {
            loginAndLaunchDelivery(deliveryKey);
        });
        after(() => {
            checkReturnPage();
        });

        warningMessagesSecondLaunchSpecs();
    });
});

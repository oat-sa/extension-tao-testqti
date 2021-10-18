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
 * - the test `taoQtiTest/views/cypress/fixtures/testPackages/basic-nonlinear-test.zip` is imported
 * - the test is published and assigned to the user defined in the env file
 * - the delivery name is supplied through the cypress env file from the property deliveryIds.basicNonLinearTest
 *
 * See the fixtures folder
 */

import { basicNonLinearFirstLaunchSpecs, basicNonLinearSecondLaunchSpecs } from './shared/basic-nonlinear-test';
import {
    loginAndLaunchDelivery,
    checkReturnPage
} from "../utils/delivery.js";

describe('Basic non-linear test navigation', () => {
    const deliveryKey = 'basicNonLinearTest';

    describe('Next/Previous/End navigation', () => {
        before(() => {
            loginAndLaunchDelivery(deliveryKey);
        });
        after(() => {
            checkReturnPage();
        });

        basicNonLinearFirstLaunchSpecs();
    });

    describe('Skip/Skip-and-end navigation', () => {
        before(() => {
            loginAndLaunchDelivery(deliveryKey);
        });
        after(() => {
            checkReturnPage();
        });

        basicNonLinearSecondLaunchSpecs();
    });
});

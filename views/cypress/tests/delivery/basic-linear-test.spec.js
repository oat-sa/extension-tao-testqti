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
 * - the test `taoQtiTest/views/cypress/fixtures/testPackages/basic_linear_test.zip` is imported
 * - the test is published and assigned to the user defined in the env file
 * - the delivery name is supplied through the cypress env file from the property deliveryIds.basicLinearTest
 *
 * See the fixtures folder
 */

import { basicLinearTestSpecs } from './shared/basic-linear-test';
import { checkReturnPage, goToIndexPage, launchDelivery, loginAsTestTaker } from "../utils/delivery.js";

describe('Regular launch of the basic linear test with 4 items', () => {
    const deliveryKey = 'basicLinearTest';

    describe('Regular launch', () => {
        it('successfully login', () => {
            loginAsTestTaker();
        });

        it('opens the index page', () => {
            goToIndexPage();
        });

        it('successfully launches the test', () => {
            launchDelivery(deliveryKey);
        });
    });

    describe('Basic linear test with 4 items', () => {
        basicLinearTestSpecs();
    });

    describe('Regular end', () => {
        it('redirects the page', () => {
            checkReturnPage();
        });
    });
});
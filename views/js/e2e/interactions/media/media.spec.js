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

import {commonInteractionSelectors, mediaInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/pointerCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64MediaInteractionTest';

const VIDEO_IS_LOADED = 1000;

const assertVideoPlaying = (videoElement, pauseElementVisible = true) => {
    cy.get(mediaInteractionSelectors.playButton).should('exist').and('not.be.visible');

    pauseElementVisible
        ? cy.get(mediaInteractionSelectors.pauseButton).should('exist').and('be.visible')
        : cy.get(mediaInteractionSelectors.pauseButton).should('exist').and('not.be.visible');

    expect(videoElement.currentTime).to.be.greaterThan(0);
    expect(videoElement.paused).to.be.false;
    expect(videoElement.ended).to.be.false;
    expect(videoElement.readyState).to.be.greaterThan(2);
};

const assertVideoPaused = (videoElement) => {
    cy.get(mediaInteractionSelectors.mediaPlayer).should('have.class', 'paused');
    cy.get(mediaInteractionSelectors.playButton).should('exist').and('be.visible');
    cy.get(mediaInteractionSelectors.pauseButton).should('exist').and('not.be.visible');

    expect(videoElement.paused).to.be.true;
    expect(videoElement.ended).to.be.false;
    expect(videoElement.readyState).to.be.greaterThan(2);
};


const assertVideoDisabled = () => {
    // media player
    cy.get(mediaInteractionSelectors.mediaPlayer).should('have.class', 'paused');
    cy.get(mediaInteractionSelectors.mediaPlayer).should('have.class', 'ended');
    cy.get(mediaInteractionSelectors.mediaPlayer).should('have.class', 'disabled');

    // video container
    cy.get(mediaInteractionSelectors.video).should('exist').should('be.visible');

    // player controls
    cy.get(mediaInteractionSelectors.playButton).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.pauseButton).should('exist').and('not.be.visible');

    // sound controls
    cy.get(mediaInteractionSelectors.muteSound).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.unmuteSound).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.volumeSliderBar).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.volumeSliderHandle).should('exist').and('not.be.visible');

    // time controls
    cy.get(mediaInteractionSelectors.currentTime).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.durationTime).should('exist').and('not.be.visible');

    // bar controls
    cy.get(mediaInteractionSelectors.seekSliderBar).should('exist').and('not.be.visible');
    cy.get(mediaInteractionSelectors.seekSliderHandle).should('exist').and('not.be.visible');
};

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
        // cy.importTestPackage(base64Test, 'e2e media interaction test');
        // cy.publishTest('e2e media interaction test');
        // cy.setDeliveryForGuests('Delivery of e2e media interaction test');
        // cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e media interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        // cy.setupServer();
        // cy.addBackOfficeRoutes();
        // cy.login('admin');
        // cy.deleteItem('e2e media interaction test');
        // cy.deleteTest('e2e media interaction test');
        // cy.deleteDelivery('Delivery of e2e media interaction test');
    });

    /**
     * Interactions tests
     */
    describe('Media interaction', () => {

        describe('Loading', () => {

            it('Media player loads in proper state', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    // media player container
                    cy.get(mediaInteractionSelectors.mediaPlayer)
                        .should('exist')
                        .and('have.class', 'video/mp4')
                        .and('have.class', 'paused')
                        .and('have.class', 'ended')
                        .and('have.class', 'ready')
                        .and('have.class', 'canplay');

                    // video container
                    cy.get(mediaInteractionSelectors.video).should('exist');

                    // video controls
                    cy.get(mediaInteractionSelectors.playButton).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.pauseButton).should('exist').and('not.be.visible');

                    cy.get(mediaInteractionSelectors.overlayPlayButton).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.overlayPauseButton).should('exist').and('not.be.visible');

                    // sound controls
                    cy.get(mediaInteractionSelectors.muteSound).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.unmuteSound).should('exist').and('not.be.visible');

                    cy.get(mediaInteractionSelectors.volumeSliderBar).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.volumeSliderHandle).should('exist').and('be.visible');

                    // time controls
                    cy.get(mediaInteractionSelectors.currentTime).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.durationTime).should('exist').and('be.visible');

                    // bar controls
                    cy.get(mediaInteractionSelectors.seekSliderBar).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.seekSliderHandle).should('exist').and('be.visible');

                });
            });

            it('Video loads in proper state', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        expect(videoElement.currentTime).to.equal(0);
                        expect(videoElement.seeking).to.be.false;
                        expect(videoElement.duration).to.equal(6.234);
                        expect(videoElement.paused).to.be.true;
                        expect(videoElement.ended).to.be.false;
                        expect(videoElement.loop).to.be.false;
                        expect(videoElement.autoplay).to.be.false;
                    });
                });
            });

            it('Video starts when autoplay option is ON', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPlaying(videoElement, false);
                    });
                });
            });

            it('Video is playing in loop when loop option is ON', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        cy.wait(videoElement.duration * 1000).then(() => {
                            //interaction.data('timesPlayed')
                            assertVideoPlaying(videoElement, false);
                        });
                    });
                });
            });

        });

        describe('Video Controls', () => {

            it('Can play video using player buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.playButton).click();
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPlaying(videoElement);
                    });
                });
            });

            it('Can play video using overlay buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.overlayPlayButton).click({force: true});
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPlaying(videoElement);
                    });
                });
            });

            it('Can pause video using player buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.playButton).click();
                    cy.get(mediaInteractionSelectors.pauseButton).click();
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPaused(videoElement);
                    });
                });
            });

            it('Can pause video using overlay buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.overlayPlayButton).click({force: true});
                    cy.get(mediaInteractionSelectors.overlayPauseButton).click({force: true});

                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPaused(videoElement);
                    });
                });
            });

            it('Can resume video using player buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.playButton).click();
                    cy.get(mediaInteractionSelectors.pauseButton).click();
                    cy.get(mediaInteractionSelectors.playButton).click();

                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPlaying(videoElement);
                    });

                });
            });

            it('Can resume video using overlay buttons', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.overlayPlayButton).click({force: true});
                    cy.get(mediaInteractionSelectors.overlayPauseButton).click({force: true});
                    cy.get(mediaInteractionSelectors.overlayPlayButton).click({force: true});

                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        assertVideoPlaying(videoElement);
                    });

                });
            });

            it('Can\'t play after max plays count', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);

                        cy.get(mediaInteractionSelectors.playButton).click();
                        cy.wait(videoElement.duration + 100).then(() => {
                            assertVideoDisabled(videoElement);
                        });

                    });
                });

            });

        });

        describe('Sound Controls', () => {

            it('Can mute sound', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {

                    cy.get(mediaInteractionSelectors.muteSound).click({force: true});
                    cy.get(mediaInteractionSelectors.video).then(video => {
                        const videoElement = video.get(0);
                        expect(videoElement.muted).to.be.true;
                    });

                    cy.get(mediaInteractionSelectors.mediaPlayer).should('have.class', 'muted');
                    cy.get(mediaInteractionSelectors.muteSound).should('exist').and('not.be.visible');
                    cy.get(mediaInteractionSelectors.unmuteSound).should('exist').and('be.visible');
                });
            });

            it('Can unmute sound', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.muteSound).click({force: true});
                    cy.get(mediaInteractionSelectors.unmuteSound).click({force: true});

                    cy.get(mediaInteractionSelectors.mediaPlayer).should('not.have.class', 'muted');
                    cy.get(mediaInteractionSelectors.muteSound).should('exist').and('be.visible');
                    cy.get(mediaInteractionSelectors.unmuteSound).should('exist').and('not.be.visible');
                });
            });

            it('Can change volume', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                    cy.get(mediaInteractionSelectors.muteSound).trigger('mouseover', {force: true});
                    cy.get(mediaInteractionSelectors.volumeSliderBar).click('center', {force: true});
                    cy.wait(1000);
                    cy.get(mediaInteractionSelectors.volumeSliderPosition).should('have.css', 'top', '49px')
                });
            });

        });

        describe('Timer information', () => {
            it('Timers info are correct', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.currentTime).should('contain', '00:00');
                    cy.get(mediaInteractionSelectors.durationTime).should('contain', '00:06');
                });
            });

            it('Timers info are updated', function () {
                cy.wait(VIDEO_IS_LOADED);
                cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                    cy.get(mediaInteractionSelectors.currentTime).should('contain', '00:00');
                    cy.get(mediaInteractionSelectors.durationTime).should('contain', '00:06');

                    cy.get(mediaInteractionSelectors.playButton).click();
                    cy.wait(1000);
                    cy.get(mediaInteractionSelectors.pauseButton).click();

                    cy.get(mediaInteractionSelectors.currentTime).should('contain', '00:01');
                    cy.get(mediaInteractionSelectors.durationTime).should('contain', '00:06');

                });
            });

        });

    });

});

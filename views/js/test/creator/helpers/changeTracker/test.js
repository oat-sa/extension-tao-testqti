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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/eventifier',
    'taoQtiTest/controller/creator/helpers/changeTracker',
    'json!taoQtiTest/test/samples/json/testModel.json'
], function ($, _, eventifier, changeTrackerFactory, testModel) {
    'use strict';

    function testCreatorFactory(data = null) {
        const model = _.defaults(data || _.cloneDeep(testModel), {
            toArray() {
                return this;
            }
        });
        return eventifier({
            getModelOverseer() {
                return {
                    getModel () {
                        return model;
                    }
                };
            }
        });
    }

    QUnit.module('API');

    QUnit.test('module', assert => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance1 = changeTrackerFactory(fixture, testCreator);
        const instance2 = changeTrackerFactory(fixture, testCreator);
        assert.expect(3);
        assert.equal(typeof changeTrackerFactory, 'function', 'The module exposes a function');
        assert.equal(typeof instance1, 'object', 'The factory produces an object');
        assert.notStrictEqual(instance1, instance2, 'The factory provides a different object on each call');
        instance1.uninstall();
        instance2.uninstall();
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'before'},
        {title: 'after'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'install'},
        {title: 'uninstall'},
        {title: 'confirmBefore'},
        {title: 'hasChanged'},
        {title: 'getSerializedTest'}
    ]).test('helper API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.module('Behavior');

    QUnit.cases.init([{
        title: 'not modified',
        change: {},
        expected: false
    }, {
        title: 'modified',
        change: {
            foo: 'bar'
        },
        expected: true
    }]).test('hasChanged ', (data, assert) => {
        const fixture = document.getElementById('fixture-hasChanged');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);

        Object.assign(testCreator.getModelOverseer().getModel(), data.change);

        assert.expect(1);
        assert.equal(instance.hasChanged(), data.expected, 'The changes in item are properly detected');
        instance.uninstall();
    });

    QUnit.cases.init([{
        title: 'simple',
        model: {
            "qti-type": "assessmentTest",
            "identifier": "Test-4",
            "testParts": [
                {
                    "qti-type": "testPart",
                    "identifier": "testPart-1"
                }
            ]
        },
        expected: '{"qti-type":"assessmentTest","identifier":"Test-4","testParts":[{"qti-type":"testPart","identifier":"testPart-1"}]}'
    }]).test('getSerializedTest ', (data, assert) => {
        const fixture = document.getElementById('fixture-getSerializedTest');
        const testCreator = testCreatorFactory(data.model);
        const instance = changeTrackerFactory(fixture, testCreator);

        assert.expect(1);
        assert.equal(instance.getSerializedTest(), data.expected, 'The model is serialized');
        instance.uninstall();
    });

    QUnit.test('confirmBefore ', assert => {
        const ready = assert.async();
        const modalSelector = '.modal.opened';
        const fixtureSelector = '#fixture-confirmBefore';
        const $fixture = $(fixtureSelector);
        const fixture = document.querySelector(`${fixtureSelector} .editor`);
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator, fixtureSelector);

        assert.expect(45);

        Promise
            .resolve()

            // click outside, no change yet
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), false, 'No change yet');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event has been propagated');
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(resolve, 200);
                $fixture.click();
            }))

            // click outside, cancel confirm
            .then(() => new Promise(resolve => {
                Object.assign(testCreator.getModelOverseer().getModel(), {foo: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model has changed');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(false, 'The click event should not be propagated');
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel click');
                    $(modalSelector).find('.cancel').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // click outside, confirm without change
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Changes not saved yet');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event should be propagated');
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - confirm click without save');
                    $(modalSelector).find('.dontsave').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // click outside, save and confirm
            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                Object.assign(testCreator.getModelOverseer().getModel(), {foo1: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event should be propagated');
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        testCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and confirm click');
                    $(modalSelector).find('.save').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // exit, no change yet
            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                assert.equal(instance.hasChanged(), false, 'No change yet');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .on('exit.test', () => {
                        assert.ok(true, 'The exit event is emitted');
                        resolve();
                    })
                    .trigger('exit');
            }))

            // cancel exit
            .then(() => {
                instance.uninstall();
                instance.install();
                Object.assign(testCreator.getModelOverseer().getModel(), {foo2: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                const race = Promise.race([
                    new Promise(resolve => {
                        testCreator
                            .before('creatorclose.test', () => {
                                assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel exit');
                                $(modalSelector).find('.cancel').click();
                                assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                window.setTimeout(resolve, 200);
                            });
                    }),
                    new Promise(resolve => {
                        testCreator
                            .on('creatorclose.test', () => {
                                assert.ok(false, 'The creatorclose event should not be emitted');
                                resolve();
                            });
                    })
                ]);

                testCreator.trigger('creatorclose');

                return race;
            })

            // exit without save
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('creatorclose.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - exit without save');
                        $(modalSelector).find('.dontsave').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    })
                    .on('creatorclose.test', () => {
                        assert.ok(true, 'The creatorclose event has been emitted');
                        resolve();
                    })
                    .trigger('creatorclose');
            }))

            // save and exit
            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                Object.assign(testCreator.getModelOverseer().getModel(), {foo3: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                testCreator
                    .off('.test')
                    .before('creatorclose.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and exit');
                        $(modalSelector).find('.save').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    })
                    .on('creatorclose.test', () => {
                        assert.ok(true, 'The creatorclose event has been emitted');
                    })
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        testCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    })
                    .trigger('creatorclose');
            }))

            // preview, no change yet
            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                assert.equal(instance.hasChanged(), false, 'No change yet');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event is emitted');
                        resolve();
                    })
                    .trigger('preview');
            }))

            // cancel preview
            .then(() => {
                Object.assign(testCreator.getModelOverseer().getModel(), {foo4: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                const race = Promise.race([
                    new Promise(resolve => {
                        testCreator
                            .before('preview.test', () => {
                                assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel preview');
                                $(modalSelector).find('.cancel').click();
                                assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                window.setTimeout(resolve, 200);
                            });
                    }),
                    new Promise(resolve => {
                        testCreator
                            .on('preview.test', () => {
                                assert.ok(false, 'The preview event should not be emitted');
                                resolve();
                            });
                    })
                ]);

                testCreator.trigger('preview');

                return race;
            })

            // preview without save
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('preview.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - preview without save');
                        $(modalSelector).find('.dontsave').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event has been emitted');
                        resolve();
                    })
                    .trigger('preview');
            }))

            // save and preview
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .before('preview.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and preview');
                        $(modalSelector).find('.save').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event has been emitted');
                    })
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        testCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    })
                    .trigger('preview');
            }))

            .catch(err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(() => {
                instance.uninstall();
                ready();
            });
    });
});

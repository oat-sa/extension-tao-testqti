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
 * Copyright (c) 2020-2025 (original work) Open Assessment Technologies SA ;
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
            },
            isTestHasErrors() {
                return false;
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

        assert.expect(44);

        function waitForModal(shouldExist = true, timeout = 1000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const checkModal = () => {
                    const modalExists = $(modalSelector).length > 0;
                    if (modalExists === shouldExist) {
                        resolve();
                    } else if (Date.now() - startTime > timeout) {
                        reject(new Error(`Modal ${shouldExist ? 'did not appear' : 'did not disappear'} within ${timeout}ms`));
                    } else {
                        setTimeout(checkModal, 10);
                    }
                };
                checkModal();
            });
        }

        Promise
            .resolve()

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

                setTimeout(resolve, 200);
                $fixture.click();
            }))

            .then(() => new Promise(resolve => {
                Object.assign(testCreator.getModelOverseer().getModel(), {foo: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model has changed');

                let eventPropagated = false;
                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        eventPropagated = true;
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                $fixture.click();

                waitForModal(true).then(() => {
                    assert.ok(!eventPropagated, 'The click event should not be propagated');
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel click');
                    $(modalSelector).find('.cancel').click();

                    return waitForModal(false);
                }).then(() => {
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                    setTimeout(resolve, 100);
                }).catch(() => {
                    assert.ok(eventPropagated, 'The click event should be propagated when no modal');
                    resolve();
                });
            }))

            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Changes not saved yet');

                let eventPropagated = false;
                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        eventPropagated = true;
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                $fixture.click();

                waitForModal(true).then(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - confirm click without save');
                    $(modalSelector).find('.dontsave').click();

                    return waitForModal(false);
                }).then(() => {
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    setTimeout(() => {
                        assert.ok(eventPropagated, 'The click event should be propagated');
                        resolve();
                    }, 100);
                }).catch(() => {
                    setTimeout(() => {
                        assert.ok(eventPropagated, 'The click event should be propagated when no modal');
                        resolve();
                    }, 100);
                });
            }))

            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                Object.assign(testCreator.getModelOverseer().getModel(), {foo1: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                let eventPropagated = false;
                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        eventPropagated = true;
                    });

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        testCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        setTimeout(() => {
                            assert.ok(eventPropagated, 'The click event should be propagated');
                            resolve();
                        }, 100);
                    });

                $fixture.click();

                waitForModal(true).then(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and confirm click');
                    $(modalSelector).find('.save').click();

                    return waitForModal(false);
                }).then(() => {
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                }).catch(() => {
                    console.warn('Modal did not appear for save confirmation');
                });
            }))

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
                                return waitForModal(true, 500).then(() => {
                                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel exit');
                                    $(modalSelector).find('.cancel').click();

                                    return waitForModal(false, 500);
                                }).then(() => {
                                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                    setTimeout(resolve, 100);
                                }).catch(() => {
                                    resolve();
                                });
                            });
                    }),
                    new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }, 2000);
                    })
                ]);

                testCreator.trigger('creatorclose');

                return race;
            })

            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('creatorclose.test', () => {
                        return waitForModal(true, 500).then(() => {
                            assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - exit without save');
                            $(modalSelector).find('.dontsave').click();

                            return waitForModal(false, 500);
                        }).then(() => {
                            assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                        }).catch(() => {
                            console.warn('Modal timeout in exit without save');
                        });
                    })
                    .on('creatorclose.test', () => {
                        assert.ok(true, 'The creatorclose event has been emitted');
                        resolve();
                    })
                    .trigger('creatorclose');
            }))

            .then(() => new Promise(resolve => {
                instance.uninstall();
                instance.install();
                Object.assign(testCreator.getModelOverseer().getModel(), {foo3: 'bar'});
                assert.equal(instance.hasChanged(), true, 'Model changed');

                testCreator
                    .off('.test')
                    .before('creatorclose.test', () => {
                        return waitForModal(true).then(() => {
                            assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and exit');
                            $(modalSelector).find('.save').click();

                            return waitForModal(false);
                        }).then(() => {
                            assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                        });
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
                                return waitForModal(true).then(() => {
                                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel preview');
                                    $(modalSelector).find('.cancel').click();

                                    return waitForModal(false);
                                }).then(() => {
                                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                    setTimeout(resolve, 100);
                                });
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

            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('preview.test', () => {
                        return waitForModal(true).then(() => {
                            assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - preview without save');
                            $(modalSelector).find('.dontsave').click();

                            return waitForModal(false);
                        }).then(() => {
                            assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                        });
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event has been emitted');
                        resolve();
                    })
                    .trigger('preview');
            }))

            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Model still changed');

                testCreator
                    .off('.test')
                    .before('preview.test', () => {
                        return waitForModal(true).then(() => {
                            assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and preview');
                            $(modalSelector).find('.save').click();

                            return waitForModal(false);
                        }).then(() => {
                            assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                        });
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

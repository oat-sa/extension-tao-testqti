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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/plugins/controls/progressbar/progress',
    'json!taoQtiTest/test/runner/plugins/controls/progressbar/progress/map.json'
], function (_, progressHelper, mapSample) {
    'use strict';

    QUnit.module('helpers/progress');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof progressHelper, 'object', "The progress helper module exposes an object");
    });


    QUnit.cases([
        {title: 'computeStats'},
        {title: 'computeIndicator'},
        {title: 'computeProgress'}
    ]).test('helpers/progress API ', function (data, assert) {
        QUnit.expect(1);
        assert.equal(typeof progressHelper[data.title], 'function', 'The progress helper expose a "' + data.title + '" function');
    });


    QUnit.cases([
        /** NON LINEAR - STANDARD **/
        {
            title: 'non linear - test scope',
            config: {
                scope: 'test',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 3,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                }
            }
        }, {
            title: 'non linear - testPart scope',
            config: {
                scope: 'testPart',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 3,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 2,
                sections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                }
            }
        }, {
            title: 'non linear - testSection scope',
            config: {
                scope: 'testSection',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 2,
                answered: 2,
                flagged: 0,
                viewed: 3,
                total: 3,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 2,
                position: 2,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                }
            }
        },

        /** NON LINEAR - ALL CATEGORIES **/
        {
            title: 'non linear - all categories - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 3,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 4,
                    reached: 6,
                    completed: 3,
                    viewed: 6,
                    total: 12
                }
            }
        }, {
            title: 'non linear - all categories - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 3,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 2,
                sections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 2,
                    reached: 4,
                    completed: 3,
                    viewed: 4,
                    total: 6
                }
            }
        }, {
            title: 'non linear - all categories - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 2,
                answered: 2,
                flagged: 0,
                viewed: 3,
                total: 3,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 2,
                position: 2,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                matchedCategories: {
                    position: 2,
                    reached: 3,
                    completed: 2,
                    viewed: 3,
                    total: 3
                }
            }
        },

        /** NON LINEAR - ONE CATEGORY **/
        {
            title: 'non linear - one category - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 3,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 1,
                    reached: 3,
                    completed: 3,
                    viewed: 3,
                    total: 7
                }
            }
        }, {
            title: 'non linear - one category - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 3,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 2,
                sections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 1,
                    reached: 3,
                    completed: 3,
                    viewed: 3,
                    total: 4
                }
            }
        }, {
            title: 'non linear - one category - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 2,
                answered: 2,
                flagged: 0,
                viewed: 3,
                total: 3,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 2,
                position: 2,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                matchedCategories: {
                    position: 1,
                    reached: 2,
                    completed: 2,
                    viewed: 2,
                    total: 2
                }
            }
        },

        /** NON LINEAR - SEVERAL CATEGORIES **/
        {
            title: 'non linear - several categories - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 3,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 0,
                    reached: 2,
                    completed: 2,
                    viewed: 2,
                    total: 4
                }
            }
        }, {
            title: 'non linear - several categories - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 3,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 3,
                position: 2,
                sections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 0,
                    reached: 2,
                    completed: 2,
                    viewed: 2,
                    total: 3
                }
            }
        }, {
            title: 'non linear - several categories - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 3,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-1',
                numberCompleted: 3,
                numberItems: 12,
                isLinear: false,
                itemAnswered: true
            },
            expected: {
                questions: 2,
                answered: 2,
                flagged: 0,
                viewed: 3,
                total: 3,
                overallCompleted: 3,
                overall: 12,
                questionsViewed: 2,
                position: 2,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                },
                matchedCategories: {
                    position: 0,
                    reached: 1,
                    completed: 1,
                    viewed: 1,
                    total: 1
                }
            }
        },


        /** LINEAR - STANDARD **/
        {
            title: 'linear - test scope',
            config: {
                scope: 'test',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 2,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 6,
                sections: {
                    position: 3,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                }
            }
        }, {
            title: 'linear - testPart scope',
            config: {
                scope: 'testPart',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 2,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                }
            }
        }, {
            title: 'linear - testSection scope',
            config: {
                scope: 'testSection',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 3,
                answered: 0,
                flagged: 0,
                viewed: 1,
                total: 3,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 1,
                position: 1,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                }
            }
        },

        /** LINEAR - ALL CATEGORIES **/
        {
            title: 'linear - all categories - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 2,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 6,
                sections: {
                    position: 3,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 6,
                    reached: 6,
                    completed: 2,
                    viewed: 6,
                    total: 12
                }
            }
        }, {
            title: 'linear - all categories - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 2,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 4,
                    reached: 4,
                    completed: 2,
                    viewed: 4,
                    total: 6
                }
            }
        }, {
            title: 'linear - all categories - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: []
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 3,
                answered: 0,
                flagged: 0,
                viewed: 1,
                total: 3,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 1,
                position: 1,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 1,
                    total: 3
                }
            }
        },

        /** LINEAR - ONE CATEGORY **/
        {
            title: 'linear - one category - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 2,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 6,
                sections: {
                    position: 3,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 3,
                    reached: 3,
                    completed: 2,
                    viewed: 3,
                    total: 7
                }
            }
        }, {
            title: 'linear - one category - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 2,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 3,
                    reached: 3,
                    completed: 2,
                    viewed: 3,
                    total: 4
                }
            }
        }, {
            title: 'linear - one category - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: ['SCORED']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 3,
                answered: 0,
                flagged: 0,
                viewed: 1,
                total: 3,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 1,
                position: 1,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 1,
                    total: 2
                }
            }
        },

        /** LINEAR - SEVERAL CATEGORIES **/
        {
            title: 'linear - several categories - test scope',
            config: {
                scope: 'test',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 9,
                answered: 2,
                flagged: 0,
                viewed: 6,
                total: 12,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 6,
                sections: {
                    position: 3,
                    reached: 3,
                    completed: 1,
                    viewed: 2,
                    total: 5
                },
                parts: {
                    position: 2,
                    reached: 2,
                    completed: 0,
                    viewed: 1,
                    total: 3
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 4
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 2
                },
                matchedCategories: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 2,
                    total: 4
                }
            }
        }, {
            title: 'linear - several categories - testPart scope',
            config: {
                scope: 'testPart',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 5,
                answered: 2,
                flagged: 0,
                viewed: 4,
                total: 6,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 3,
                position: 4,
                sections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 1,
                    total: 2
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 2,
                    reached: 2,
                    completed: 1,
                    viewed: 2,
                    total: 3
                }
            }
        }, {
            title: 'linear - several categories - testSection scope',
            config: {
                scope: 'testSection',
                indicator: 'categories',
                categories: ['SCORED', 'CAT2']
            },
            testMap: mapSample,
            testContext: {
                itemPosition: 5,
                testPartId: 'testPart-1',
                sectionId: 'assessmentSection-2',
                numberCompleted: 2,
                numberItems: 12,
                isLinear: true,
                itemAnswered: true
            },
            expected: {
                questions: 3,
                answered: 0,
                flagged: 0,
                viewed: 1,
                total: 3,
                overallCompleted: 2,
                overall: 12,
                questionsViewed: 1,
                position: 1,
                sections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                parts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableSections: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                answerableParts: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 0,
                    total: 1
                },
                matchedCategories: {
                    position: 1,
                    reached: 1,
                    completed: 0,
                    viewed: 1,
                    total: 2
                }
            }
        }
    ]).test('helpers/progress.computeStats', function (data, assert) {
        QUnit.expect(1);

        assert.deepEqual(
            progressHelper.computeStats(data.testMap, data.testContext, data.config),
            data.expected,
            'The progress helper computeStats provides the expected stats'
        );
    });


    QUnit.cases([{
        title: 'default - percentage',
        expected: {
            position: 0,
            total: 0,
            ratio: 0,
            label: '0%'
        }
    }, {
        title: 'default - position',
        type: 'position',
        expected: {
            position: 0,
            total: 0,
            ratio: 0,
            label: 'Item 0 of 0'
        }
    }, {
        title: 'percentage',
        type: 'percentage',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 5,
            total: 12,
            questionsViewed: 4,
            position: 5
        },
        config: {},
        expected: {
            position: 4,
            total: 10,
            ratio: 40,
            label: '40%'
        }
    }, {
        title: 'position - short',
        type: 'position',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5
        },
        config: {},
        expected: {
            position: 5,
            total: 10,
            ratio: 50,
            label: 'Item 5'
        }
    }, {
        title: 'position - long',
        type: 'position',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5
        },
        config: {
            showTotal: true
        },
        expected: {
            position: 5,
            total: 10,
            ratio: 50,
            label: 'Item 5 of 10'
        }
    }, {
        title: 'questions - short',
        type: 'questions',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5
        },
        config: {
            showTotal: false
        },
        expected: {
            position: 4,
            total: 10,
            ratio: 40,
            label: 'Item 4'
        }
    }, {
        title: 'questions - long',
        type: 'questions',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5
        },
        expected: {
            position: 4,
            total: 10,
            ratio: 40,
            label: 'Item 4 of 10'
        }
    }, {
        title: 'sections - short',
        type: 'sections',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5,
            answerableSections: {
                position: 1,
                reached: 2,
                completed: 1,
                viewed: 1,
                total: 4
            }
        },
        config: {
            showTotal: false
        },
        expected: {
            position: 2,
            total: 4,
            ratio: 50,
            label: 'Section 2'
        }
    }, {
        title: 'sections - long',
        type: 'sections',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5,
            answerableSections: {
                position: 1,
                reached: 2,
                completed: 1,
                viewed: 1,
                total: 4
            }
        },
        expected: {
            position: 2,
            total: 4,
            ratio: 50,
            label: 'Section 2 of 4'
        }
    }, {
        title: 'categories - short',
        type: 'categories',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5,
            matchedCategories: {
                completed: 3,
                position: 2,
                reached: 3,
                total: 7,
                viewed: 3
            }
        },
        config: {
            showTotal: false
        },
        expected: {
            position: 2,
            total: 7,
            ratio: 28,
            label: 'Item 2'
        }
    }, {
        title: 'categories - long',
        type: 'categories',
        stats: {
            questions: 10,
            answered: 4,
            flagged: 2,
            viewed: 4,
            total: 10,
            questionsViewed: 4,
            position: 5,
            matchedCategories: {
                completed: 3,
                position: 2,
                reached: 3,
                total: 7,
                viewed: 3
            }
        },
        expected: {
            position: 2,
            total: 7,
            ratio: 28,
            label: 'Item 2 of 7'
        }
    }]).test('helpers/progress.computeIndicator', function (data, assert) {
        QUnit.expect(1);

        assert.deepEqual(progressHelper.computeIndicator(data.stats, data.type, data.config), data.expected, 'The progress helper computeIndicator provides the expected indicator');
    });


    QUnit.cases([{
        title: 'no expected categories',
        categories: ['SCORED'],
        expectedCategories: [],
        expected: true
    }, {
        title: 'no categories at all',
        categories: [],
        expectedCategories: [],
        expected: true
    }, {
        title: 'missing expected categories',
        categories: [],
        expectedCategories: ['MATH', 'HISTORY'],
        expected: false
    }, {
        title: 'missing expected category',
        categories: ['SCORED'],
        expectedCategories: ['MATH'],
        expected: false
    }, {
        title: 'match expected category',
        categories: ['SCORED', 'MATH'],
        expectedCategories: ['MATH'],
        expected: true
    }, {
        title: 'missing one of expected categories',
        categories: ['SCORED', 'MATH'],
        expectedCategories: ['MATH', 'HISTORY'],
        expected: false
    }, {
        title: 'match expected categories',
        categories: ['SCORED', 'MATH', 'HISTORY'],
        expectedCategories: ['MATH', 'HISTORY'],
        expected: true
    }]).test('helpers/progress.isMatchedCategories', function (data, assert) {
        QUnit.expect(1);

        assert.equal(progressHelper.isMatchedCategories(data.categories, data.expectedCategories), data.expected, 'The progress helper isMatchedCategories provides the expected result');
    });


    QUnit.cases([{
        title: 'test scope, percentage',
        config: {
            scope: 'test',
            indicator: 'percentage'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 9,
            ratio: 33,
            label: '33%'
        }
    }, {
        title: 'test scope, position',
        config: {
            scope: 'test',
            indicator: 'position'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 6,
            total: 12,
            ratio: 50,
            label: 'Item 6 of 12'
        }
    }, {
        title: 'test scope, questions',
        config: {
            scope: 'test',
            indicator: 'questions'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 9,
            ratio: 33,
            label: 'Item 3 of 9'
        }
    }, {
        title: 'test scope, sections',
        config: {
            scope: 'test',
            indicator: 'sections'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 2,
            total: 4,
            ratio: 50,
            label: 'Section 2 of 4'
        }
    }, {
        title: 'test scope, categories',
        config: {
            scope: 'test',
            indicator: 'categories',
            categories: ['SCORED']
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 7,
            ratio: 42,
            label: 'Item 3 of 7'
        }
    }, {
        title: 'testPart scope, percentage',
        config: {
            scope: 'testPart',
            indicator: 'percentage'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 5,
            ratio: 60,
            label: '60%'
        }
    }, {
        title: 'testPart scope, position',
        config: {
            scope: 'testPart',
            indicator: 'position'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 4,
            total: 6,
            ratio: 66,
            label: 'Item 4 of 6'
        }
    }, {
        title: 'testPart scope, questions',
        config: {
            scope: 'testPart',
            indicator: 'questions'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 5,
            ratio: 60,
            label: 'Item 3 of 5'
        }
    }, {
        title: 'testPart scope, sections',
        config: {
            scope: 'testPart',
            indicator: 'sections'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 2,
            total: 2,
            ratio: 100,
            label: 'Section 2 of 2'
        }
    }, {
        title: 'testPart scope, categories',
        config: {
            scope: 'testPart',
            indicator: 'categories',
            categories: ['SCORED']
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 3,
            total: 4,
            ratio: 75,
            label: 'Item 3 of 4'
        }
    }, {
        title: 'testSection scope, percentage',
        config: {
            scope: 'testSection',
            indicator: 'percentage'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 1,
            total: 3,
            ratio: 33,
            label: '33%'
        }
    }, {
        title: 'testSection scope, position',
        config: {
            scope: 'testSection',
            indicator: 'position'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 1,
            total: 3,
            ratio: 33,
            label: 'Item 1 of 3'
        }
    }, {
        title: 'testSection scope, questions',
        config: {
            scope: 'testSection',
            indicator: 'questions'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 1,
            total: 3,
            ratio: 33,
            label: 'Item 1 of 3'
        }
    }, {
        title: 'testSection scope, sections',
        config: {
            scope: 'testSection',
            indicator: 'sections'
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 1,
            total: 1,
            ratio: 100,
            label: 'Section 1 of 1'
        }
    }, {
        title: 'testSection scope, categories',
        config: {
            scope: 'testSection',
            indicator: 'categories',
            categories: ['SCORED']
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 5,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-2',
            numberCompleted: 6,
            numberItems: 12,
            isLinear: false,
            itemAnswered: true
        },
        expected: {
            position: 1,
            total: 2,
            ratio: 50,
            label: 'Item 1 of 2'
        }
    }]).test('helpers/progress.computeProgress', function (data, assert) {
        QUnit.expect(1);

        assert.deepEqual(progressHelper.computeProgress(data.testMap, data.testContext, data.config), data.expected, 'The progress helper computeProgress provides the expected stats');
    });
});

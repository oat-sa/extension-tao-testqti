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


    QUnit.cases([{
        title: 'test scope',
        config: {
            scope: 'test',
            categories: []
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 9,
            answered: 3,
            flagged: 0,
            viewed: 6,
            total: 12,
            completed: 4,
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
        title: 'testPart scope',
        config: {
            scope: 'testPart',
            categories: []
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 5,
            answered: 3,
            flagged: 0,
            viewed: 4,
            total: 6,
            completed: 4,
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
        title: 'testSection scope',
        config: {
            scope: 'testSection',
            categories: []
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 2,
            answered: 2,
            flagged: 0,
            viewed: 3,
            total: 3,
            completed: 4,
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
    }, {
        title: 'all categories',
        config: {
            indicator: 'categories',
            categories: []
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 9,
            answered: 3,
            flagged: 0,
            viewed: 6,
            total: 12,
            completed: 4,
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
                completed: 3,
                position: 4,
                reached: 6,
                total: 12,
                viewed: 6
            }
        }
    }, {
        title: 'one category',
        config: {
            indicator: 'categories',
            categories: ['SCORED']
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 9,
            answered: 3,
            flagged: 0,
            viewed: 6,
            total: 12,
            completed: 4,
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
                completed: 3,
                position: 1,
                reached: 3,
                total: 7,
                viewed: 3
            }
        }
    }, {
        title: 'multi categories',
        config: {
            indicator: 'categories',
            categories: ['SCORED', 'CAT2']
        },
        testMap: mapSample,
        testContext: {
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1',
            numberCompleted: 4,
            numberItems: 12
        },
        expected: {
            questions: 9,
            answered: 3,
            flagged: 0,
            viewed: 6,
            total: 12,
            completed: 4,
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
                completed: 2,
                position: 0,
                reached: 2,
                total: 4,
                viewed: 2
            }
        }
    }]).test('helpers/progress.computeStats', function (data, assert) {
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
            viewed: 4,
            total: 10,
            completed: 5,
            overall: 12,
            questionsViewed: 4,
            position: 5
        },
        config: {},
        expected: {
            position: 5,
            total: 12,
            ratio: 41,
            label: '41%'
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
    }]).test('helpers/progress.computeIndicator', function (data, assert) {
        QUnit.expect(1);

        assert.deepEqual(progressHelper.computeIndicator(data.stats, data.type, data.config), data.expected, 'The progress helper computeIndicator provides the expected indicator');
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
            numberItems: 12
        },
        expected: {
            position: 6,
            total: 12,
            ratio: 50,
            label: '50%'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
        },
        expected: {
            position: 2,
            total: 4,
            ratio: 50,
            label: 'Section 2 of 4'
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
            numberItems: 12
        },
        expected: {
            position: 6,
            total: 12,
            ratio: 50,
            label: '50%'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
        },
        expected: {
            position: 2,
            total: 2,
            ratio: 100,
            label: 'Section 2 of 2'
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
            numberItems: 12
        },
        expected: {
            position: 6,
            total: 12,
            ratio: 50,
            label: '50%'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
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
            sectionId: 'assessmentSection-2'
        },
        expected: {
            position: 1,
            total: 1,
            ratio: 100,
            label: 'Section 1 of 1'
        }
    }]).test('helpers/progress.computeProgress', function (data, assert) {
        QUnit.expect(1);

        assert.deepEqual(progressHelper.computeProgress(data.testMap, data.testContext, data.config), data.expected, 'The progress helper computeProgress provides the expected stats');
    });
});

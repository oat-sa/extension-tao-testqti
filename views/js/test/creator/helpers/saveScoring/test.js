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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define(['taoQtiTest/controller/creator/helpers/saveScoring'], function (saveScoring) {
    'use strict';

    function createModelOverseerSpy() {
        const calls = [];

        return {
            calls,
            trigger(eventName) {
                calls.push(eventName);
            }
        };
    }

    QUnit.module('saveScoring');

    QUnit.test('does not trigger scoring-change when translation is true', assert => {
        const modelOverseer = createModelOverseerSpy();

        saveScoring.triggerScoringChangeIfNeeded(modelOverseer, true);

        assert.deepEqual(modelOverseer.calls, [], 'scoring-change must not be triggered for translation saves');
    });

    QUnit.test('triggers scoring-change when translation is false', assert => {
        const modelOverseer = createModelOverseerSpy();

        saveScoring.triggerScoringChangeIfNeeded(modelOverseer, false);

        assert.deepEqual(modelOverseer.calls, ['scoring-change'], 'scoring-change must be triggered for regular saves');
    });

    QUnit.test('triggers scoring-change when translation is undefined', assert => {
        const modelOverseer = createModelOverseerSpy();

        saveScoring.triggerScoringChangeIfNeeded(modelOverseer, undefined);

        assert.deepEqual(modelOverseer.calls, ['scoring-change'], 'scoring-change must be triggered when translation flag is absent');
    });
});

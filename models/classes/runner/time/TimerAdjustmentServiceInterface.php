<?php
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

declare(strict_types=1);

namespace oat\taoQtiTest\models\runner\time;


use oat\taoQtiTest\models\runner\session\TestSession;
use qtism\common\datatypes\QtiDuration;
use qtism\data\QtiIdentifiable;

/**
 * Interface TimerAdjustmentInterface
 *
 * @package oat\taoTests\models\runner\time
 */
interface TimerAdjustmentServiceInterface
{
    public const SERVICE_ID = 'taoQtiTest/TimerAdjustment';

    public const TYPE_TIME_ADJUSTMENT = 'timeAdjustment';
    public const TYPE_EXTENDED_TIME = 'extendedTime';

    /**
     * Increases allotted time by supplied amount of seconds
     * @param TestSession $testSession
     * @param int $seconds
     * @param string $type
     * @param QtiIdentifiable $source
     * @return bool
     */
    public function increase(
        TestSession $testSession,
        int $seconds,
        string $type,
        QtiIdentifiable $source = null
    ): bool;

    /**
     * Decreases allotted time by supplied amount of seconds
     * @param TestSession $testSession
     * @param int $seconds
     * @param string $type
     * @param QtiIdentifiable $source
     * @return bool
     */
    public function decrease(
        TestSession $testSession,
        int $seconds,
        string $type,
        QtiIdentifiable $source = null
    ): bool;

    /**
     * Finds adjusted max time limit for a given test component
     * @param QtiIdentifiable $source
     * @param QtiTimer $timer
     * @return QtiDuration|null
     */
    public function getAdjustedMaxTime(
        QtiIdentifiable $source,
        QtiTimer $timer
    ): ?QtiDuration;

    /**
     * Get adjusted seconds
     * @param QtiIdentifiable $source
     * @param QtiTimer $qtiTimer
     * @return int
     */
    public function getAdjustment(QtiIdentifiable $source, QtiTimer $qtiTimer): int;

    /**
     * Get adjusted time by adjustment type in seconds
     *
     * @param QtiIdentifiable $source
     * @param QtiTimer $timer
     * @param string|null $adjustmentType
     * @return int
     */
    public function getAdjustmentByType(QtiIdentifiable $source, QtiTimer $timer, ?string $adjustmentType = null): int;
}

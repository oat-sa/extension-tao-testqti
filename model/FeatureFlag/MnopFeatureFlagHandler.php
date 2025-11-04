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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

/**
 * Feature Flag Handler for MNOP (Maximum Number of Points) Display
 *
 * Controls visibility of the "Maximum Number of Points" feature in test authoring.
 * This feature displays the maximum achievable points at test/test-part/section/item levels.
 */
class MnopFeatureFlagHandler implements FeatureFlagConfigHandlerInterface
{
    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(FeatureFlagCheckerInterface $featureFlagChecker)
    {
        $this->featureFlagChecker = $featureFlagChecker;
    }

    /**
     * Configure feature visibility based on feature flag state
     *
     * @param array $configs
     * @return array
     */
    public function __invoke(array $configs): array
    {
        $configs['services/features']['visibility']['taoQtiTest/creator/property/mnop'] =
            $this->featureFlagChecker->isEnabled('FEATURE_FLAG_DISPLAY_MAXIMUM_POINTS') ? 'show' : 'hide';

        return $configs;
    }
}

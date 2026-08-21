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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

class ResourceCommentsClientConfigHandler implements FeatureFlagConfigHandlerInterface
{
    private const RESOURCE_COMMENTS_FEATURE_FLAG = 'FEATURE_FLAG_RESOURCE_COMMENTS_ENABLED';
    private const COMMENTS_TAB_VISIBILITY_KEY = 'taoQtiTest/creator/test/commentsTab';

    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(FeatureFlagCheckerInterface $featureFlagChecker)
    {
        $this->featureFlagChecker = $featureFlagChecker;
    }

    public function __invoke(array $configs): array
    {
        $configs['services/features'] = $configs['services/features'] ?? [];
        $configs['services/features']['visibility'] = $configs['services/features']['visibility'] ?? [];
        $configs['services/features']['visibility'][self::COMMENTS_TAB_VISIBILITY_KEY] =
            $this->featureFlagChecker->isEnabled(self::RESOURCE_COMMENTS_FEATURE_FLAG)
                ? 'show'
                : 'hide';

        return $configs;
    }
}

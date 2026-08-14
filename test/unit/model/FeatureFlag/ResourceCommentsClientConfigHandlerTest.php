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

namespace oat\taoQtiTest\test\unit\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\taoQtiTest\model\FeatureFlag\ResourceCommentsClientConfigHandler;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ResourceCommentsClientConfigHandlerTest extends TestCase
{
    private const RESOURCE_COMMENTS_FLAG = 'FEATURE_FLAG_RESOURCE_COMMENTS_ENABLED';
    private const COMMENTS_TAB_VISIBILITY_KEY = 'taoQtiTest/creator/test/commentsTab';

    private FeatureFlagCheckerInterface|MockObject $featureFlagChecker;
    private ResourceCommentsClientConfigHandler $subject;

    protected function setUp(): void
    {
        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->subject = new ResourceCommentsClientConfigHandler($this->featureFlagChecker);
    }

    public function testInvokeSetsVisibilityToShowWhenFeatureFlagEnabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with(self::RESOURCE_COMMENTS_FLAG)
            ->willReturn(true);

        $result = ($this->subject)([]);

        $this->assertSame('show', $result['services/features']['visibility'][self::COMMENTS_TAB_VISIBILITY_KEY]);
    }

    public function testInvokeSetsVisibilityToHideWhenFeatureFlagDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with(self::RESOURCE_COMMENTS_FLAG)
            ->willReturn(false);

        $result = ($this->subject)([]);

        $this->assertSame('hide', $result['services/features']['visibility'][self::COMMENTS_TAB_VISIBILITY_KEY]);
    }

    public function testInvokePreservesExistingVisibilityConfig(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->willReturn(false);

        $result = ($this->subject)([
            'services/features' => [
                'visibility' => [
                    'taoQtiTest/creator/test/property/identifier' => 'show',
                ],
            ],
        ]);

        $this->assertSame(
            'show',
            $result['services/features']['visibility']['taoQtiTest/creator/test/property/identifier']
        );
        $this->assertSame('hide', $result['services/features']['visibility'][self::COMMENTS_TAB_VISIBILITY_KEY]);
    }
}

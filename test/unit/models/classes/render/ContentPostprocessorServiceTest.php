<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\render;

use oat\generis\test\TestCase;
use oat\taoItems\model\render\ItemAssetsReplacement;
use oat\taoQtiTest\models\classes\render\CustomInteraction\CustomInteractionPostProcessorAllocator;
use oat\taoQtiTest\models\render\UpdateItemContentReferencesService;
use PHPUnit\Framework\MockObject\MockObject;

class ContentPostprocessorServiceTest extends TestCase
{
    private $serviceLocator;
    /**
     * @var UpdateItemContentReferencesService
     */
    private $sut;
    /**
     * @var ItemAssetsReplacement|MockObject
     */
    private $itemAssetReplacement;
    /** @var CustomInteractionPostProcessorAllocator|MockObject */
    private $customInteractionAllocator;

    public function setUp(): void
    {
        $this->itemAssetReplacement = $this->createMock(ItemAssetsReplacement::class);
        $this->customInteractionAllocator = $this->createMock(CustomInteractionPostProcessorAllocator::class);

        $this->sut = new UpdateItemContentReferencesService(
            $this->itemAssetReplacement,
            $this->customInteractionAllocator
        );
    }

    public function testPostProcessContent()
    {
        $input = ['assets' => [['src' => 'asset.png'], ['src' => 'asset2.png']]];

        $this->itemAssetReplacement
            ->expects($this->exactly(2))
            ->method('postProcessAssets')
            ->willReturnArgument(0);

        $this->assertSame($input, $this->sut->__invoke($input));
    }
}

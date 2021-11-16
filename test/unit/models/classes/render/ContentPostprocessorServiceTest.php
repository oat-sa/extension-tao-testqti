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
use oat\taoQtiTest\models\render\ContentPostprocessorService;

class ContentPostprocessorServiceTest extends TestCase
{
    private $serviceLocator;

    public function setUp(): void
    {
        $itemAssetReplacement = $this->createMock(ItemAssetsReplacement::class);
        $this->serviceLocator = $this->getServiceLocatorMock(
            [
                ItemAssetsReplacement::SERVICE_ID => $itemAssetReplacement,
            ]
        );
    }

    public function testPostProcessContent()
    {
        $subject = new ContentPostprocessorService();

        $subject->setServiceManager($this->serviceLocator);

        $this->serviceLocator->getContainer()->get(ItemAssetsReplacement::SERVICE_ID)->expects(
            $this->exactly(2)
        )->method(
            'postProcessAssets'
        );
        $subject->postProcessContent(['assets' => [['src' => 'asset.png'], ['src' => 'asset2.png']]]);
    }
}

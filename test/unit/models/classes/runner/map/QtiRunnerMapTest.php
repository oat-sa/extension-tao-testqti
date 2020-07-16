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

namespace oat\taoQtiTest\test\unit\models\classes\runner\map;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\config\Business\Contract\OverriddenOptionsRepositoryInterface;
use oat\taoQtiTest\models\runner\config\Business\Domain\Option;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use PHPUnit\Framework\MockObject\MockObject;
use qtism\common\collections\IdentifierCollection;
use qtism\data\AssessmentItemRef;
use ReflectionClass;

class QtiRunnerMapTest extends TestCase
{
    /** @var QtiRunnerMap */
    private $service;

    /** @var OverriddenOptionsRepositoryInterface|MockObject */
    private $overriddenOptionsRepositoryMock;

    public function setUp(): void
    {
        parent::setUp();
        $this->overriddenOptionsRepositoryMock = $this->createMock(OverriddenOptionsRepositoryInterface::class);
        $this->service = new QtiRunnerMap();
        $this->service->setServiceLocator(
            $this->getServiceLocatorMock([
                OverriddenOptionsRepositoryInterface::SERVICE_ID => $this->overriddenOptionsRepositoryMock,
            ])
        );
    }

    /**
     * @dataProvider categoryProvider
     * @param array $itemCategories
     * @param array $overriddenCategories
     * @param array $expectedCategoryList
     */
    public function testGetAvailableCategories_WhenOverridesAreRegistered_ThenCategoriesAreFiltered(
        array $itemCategories,
        array $overriddenCategories,
        array $expectedCategoryList
    ): void {
        $this->setOverriddenOptionsRepositoryResult($overriddenCategories);
        $item = new AssessmentItemRef('itemId1', 'itemHref', new IdentifierCollection($itemCategories));

        $this->assertSame($expectedCategoryList, $this->invokeGetAvailableCategories($item));
    }

    public function categoryProvider(): array
    {
        return [
            [[], [], []],
            [[], ['toolName' => true], ['x-tao-option-toolName']],
            [['x-tao-option-toolName'], ['toolName' => true], ['x-tao-option-toolName']],
            [['x-tao-option-tool-name'], ['toolName' => true], ['x-tao-option-tool-name', 'x-tao-option-toolName']],
            [['x-tao-option-tool-name', 'x-tao-option-toolName', 'tool_name'], ['toolName' => false], []],
            [['x-tao-option-tool-name'], ['fakeCategory' => false], ['x-tao-option-tool-name']],
        ];
    }

    private function setOverriddenOptionsRepositoryResult(array $overriddenCategories): void
    {
        $list = [];
        foreach ($overriddenCategories as $categoryId => $isEnabled) {
            $list[] = new Option($categoryId, $isEnabled);
        }

        $this->overriddenOptionsRepositoryMock->method('findAll')->willReturn(new OptionCollection(...$list));
    }

    private function invokeGetAvailableCategories(AssessmentItemRef $item): array
    {
        $reflection = new ReflectionClass(get_class($this->service));
        $method = $reflection->getMethod('getAvailableCategories');
        $method->setAccessible(true);

        return $method->invokeArgs($this->service, [$item]);
    }
}

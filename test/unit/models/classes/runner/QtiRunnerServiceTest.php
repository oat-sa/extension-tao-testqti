<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use oat\generis\test\TestCase;
use oat\tao\model\theme\Theme;
use oat\tao\model\theme\ThemeService;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\data\AssessmentTest;

class QtiRunnerServiceTest extends TestCase
{
    const TEST_THEME_ID = 'test';

    /** @var QtiRunnerService */
    private $qtiRunnerService;

    /** @var \common_ext_ExtensionsManager */
    private $extensionsManagerMock;

    public function setUp()
    {
        $this->qtiRunnerService = $this->getMockBuilder(QtiRunnerService::class)
            ->setMethods(['getTestConfig'])
            ->getMock()
        ;

        $qtiRunnerConfigMock = $this->getMockBuilder(QtiRunnerConfig::class)->getMock();

        $qtiRunnerConfigMock
            ->method('getConfig')
            ->willReturn([
                'plugins' => [],
            ])
        ;

        $this->qtiRunnerService
            ->method('getTestConfig')
            ->willReturn($qtiRunnerConfigMock)
        ;

        $this->extensionsManagerMock = $this->getMockBuilder(\common_ext_ExtensionsManager::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $themeServiceMock = $this->getMockBuilder(ThemeService::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $themeMock = $this->getMockBuilder(Theme::class)->getMock();

        $themeMock
            ->method('getId')
            ->willReturn(self::TEST_THEME_ID)
        ;

        $themeServiceMock
            ->method('getTheme')
            ->willReturn($themeMock)
        ;

        $serviceLocatorMock = $this->getServiceLocatorMock([
            \common_ext_ExtensionsManager::SERVICE_ID => $this->extensionsManagerMock,
            ThemeService::SERVICE_ID => $themeServiceMock,
        ]);

        $this->qtiRunnerService->setServiceLocator($serviceLocatorMock);
    }

    public function testGetDataWithThemeSwitcherEnabled()
    {
        $extensionMock = $this->getMockBuilder(\common_ext_Extension::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $extensionMock
            ->method('getConfig')
            ->willReturn([
                QtiRunnerService::TOOL_ITEM_THEME_SWITCHER_KEY => [
                    'active' => true,
                ],
            ])
        ;

        $this->extensionsManagerMock
            ->method('getExtensionById')
            ->willReturn($extensionMock)
        ;

        $qtiRunnerServiceContextMock = $this->getMockBuilder(QtiRunnerServiceContext::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $assessmentTestMock = $this->getMockBuilder(AssessmentTest::class)
            ->disableOriginalConstructor()
            ->getMock();

        $qtiRunnerServiceContextMock
            ->method('getTestDefinition')
            ->willReturn($assessmentTestMock)
        ;

        $testData = $this->qtiRunnerService->getTestData($qtiRunnerServiceContextMock);

        $this->assertTrue(
            array_key_exists('config',$testData)
            && array_key_exists('plugins', $testData['config'])
            && array_key_exists(QtiRunnerService::TOOL_ITEM_THEME_SWITCHER, $testData['config']['plugins'])
            && array_key_exists('activeNamespace', $testData['config']['plugins'][QtiRunnerService::TOOL_ITEM_THEME_SWITCHER])
            && self::TEST_THEME_ID === $testData['config']['plugins'][QtiRunnerService::TOOL_ITEM_THEME_SWITCHER]['activeNamespace']
        );
    }

    public function testGetDataWithThemeSwitcherDisabled()
    {
        $extensionMock = $this->getMockBuilder(\common_ext_Extension::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $extensionMock
            ->method('getConfig')
            ->willReturn([])
        ;

        $this->extensionsManagerMock
            ->method('getExtensionById')
            ->willReturn($extensionMock)
        ;

        $qtiRunnerServiceContextMock = $this->getMockBuilder(QtiRunnerServiceContext::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;

        $assessmentTestMock = $this->getMockBuilder(AssessmentTest::class)
            ->disableOriginalConstructor()
            ->getMock();

        $qtiRunnerServiceContextMock
            ->method('getTestDefinition')
            ->willReturn($assessmentTestMock)
        ;

        $testData = $this->qtiRunnerService->getTestData($qtiRunnerServiceContextMock);

        $this->assertTrue(
            array_key_exists('config', $testData)
            && array_key_exists('plugins', $testData['config'])
            && !array_key_exists(QtiRunnerService::TOOL_ITEM_THEME_SWITCHER, $testData['config']['plugins'])
        );
    }
}

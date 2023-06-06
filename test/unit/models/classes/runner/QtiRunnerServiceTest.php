<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\theme\Theme;
use oat\tao\model\theme\ThemeService;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy as TaoDeliveryServiceProxy;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use Psr\Log\LoggerInterface;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\SubmissionMode;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

class QtiRunnerServiceTest extends TestCase
{
    public const TEST_THEME_ID = 'test';

    /** @var QtiRunnerService */
    private $qtiRunnerService;

    /** @var common_ext_ExtensionsManager */
    private $extensionsManagerMock;

    /** @var FeatureFlagChecker */
    private $featureFlagChecker;

    /** @var LoggerInterface */
    private $loggerMock;

    public function setUp(): void
    {
        $this->loggerMock = $this->createMock(LoggerInterface::class);

        $this->qtiRunnerService = $this->getMockBuilder(QtiRunnerService::class)
            ->setMethods(['getTestConfig'])
            ->getMock();

        $qtiRunnerConfigMock = $this->getMockBuilder(QtiRunnerConfig::class)->getMock();

        $qtiRunnerConfigMock
            ->method('getConfig')
            ->willReturn([
                'plugins' => [],
            ]);

        $this->qtiRunnerService
            ->method('getTestConfig')
            ->willReturn($qtiRunnerConfigMock);

        $this->extensionsManagerMock = $this->getMockBuilder(common_ext_ExtensionsManager::class)
            ->disableOriginalConstructor()
            ->getMock();

        $themeServiceMock = $this->getMockBuilder(ThemeService::class)
            ->disableOriginalConstructor()
            ->getMock();

        $themeMock = $this->getMockBuilder(Theme::class)->getMock();

        $themeMock
            ->method('getId')
            ->willReturn(self::TEST_THEME_ID);

        $themeServiceMock
            ->method('getTheme')
            ->willReturn($themeMock);

        $this->featureFlagChecker = $this->createMock(FeatureFlagChecker::class);

        $serviceLocatorMock = $this->getServiceLocatorMock([
            common_ext_ExtensionsManager::SERVICE_ID => $this->extensionsManagerMock,
            ThemeService::SERVICE_ID => $themeServiceMock,
            FeatureFlagChecker::class => $this->featureFlagChecker
        ]);

        $this->qtiRunnerService->setServiceLocator($serviceLocatorMock);

        $this->qtiRunnerService->setLogger($this->loggerMock);
    }

    public function testGetDataWithThemeSwitcherEnabled()
    {
        $extensionMock = $this->getMockBuilder(common_ext_Extension::class)
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

        // phpcs:disable Generic.Files.LineLength
        $this->assertTrue(
            array_key_exists('config', $testData)
            && array_key_exists('plugins', $testData['config'])
            && array_key_exists(QtiRunnerService::TOOL_ITEM_THEME_SWITCHER, $testData['config']['plugins'])
            && array_key_exists('activeNamespace', $testData['config']['plugins'][QtiRunnerService::TOOL_ITEM_THEME_SWITCHER])
            && self::TEST_THEME_ID === $testData['config']['plugins'][QtiRunnerService::TOOL_ITEM_THEME_SWITCHER]['activeNamespace']
        );
        // phpcs:enable Generic.Files.LineLength
    }

    public function testGetDataWithThemeSwitcherDisabled()
    {
        $extensionMock = $this->getMockBuilder(common_ext_Extension::class)
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

    public function testDoNotDisplayFeedbacksForSimultaneousSubmissionMode(): void
    {
        $testSession = $this->createMock(TestSession::class);
        $context = $this->createMock(QtiRunnerServiceContext::class);

        $context->expects($this->once())
            ->method('getTestSession')
            ->willReturn($testSession);

        $testSession->expects($this->once())
            ->method('getCurrentSubmissionMode')
            ->willReturn(SubmissionMode::SIMULTANEOUS);

        $this->assertFalse($this->qtiRunnerService->displayFeedbacks($context));
    }

    public function testDisplayFeedbacksForNewTestCompilationVersion(): void
    {
        $testSession = $this->createMock(TestSession::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $itemSessionControl = $this->createMock(ItemSessionControl::class);
        $context = $this->createMock(QtiRunnerServiceContext::class);

        $context->expects($this->once())
            ->method('getTestSession')
            ->willReturn($testSession);

        $context->expects($this->once())
            ->method('getTestCompilationVersion')
            ->willReturn(1);

        $testSession->expects($this->once())
            ->method('getCurrentSubmissionMode')
            ->willReturn(SubmissionMode::INDIVIDUAL);

        $testSession->expects($this->once())
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentItemSession->expects($this->once())
            ->method('getItemSessionControl')
            ->willReturn($itemSessionControl);

        $itemSessionControl->expects($this->once())
            ->method('mustShowFeedback')
            ->willReturn(true);

        $this->assertTrue($this->qtiRunnerService->displayFeedbacks($context));
    }

    public function testDisplayFeedbacksForOldCompilationVersionIfFeatureFlagIsEnabled(): void
    {
        $testSession = $this->createMock(TestSession::class);
        $context = $this->createMock(QtiRunnerServiceContext::class);

        $context->expects($this->once())
            ->method('getTestSession')
            ->willReturn($testSession);

        $context->expects($this->once())
            ->method('getTestCompilationVersion')
            ->willReturn(0);

        $testSession->expects($this->once())
            ->method('getCurrentSubmissionMode')
            ->willReturn(SubmissionMode::INDIVIDUAL);

        $this->featureFlagChecker->expects($this->once())
            ->method('isEnabled')
            ->willReturn(true);

        $this->assertTrue($this->qtiRunnerService->displayFeedbacks($context));
    }

    public function testDisplayFeedbacksForOldCompilationVersionIfFeatureFlagIsDisabled(): void
    {
        $testSession = $this->createMock(TestSession::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $itemSessionControl = $this->createMock(ItemSessionControl::class);
        $context = $this->createMock(QtiRunnerServiceContext::class);

        $context->expects($this->once())
            ->method('getTestSession')
            ->willReturn($testSession);

        $context->expects($this->once())
            ->method('getTestCompilationVersion')
            ->willReturn(0);

        $testSession->expects($this->once())
            ->method('getCurrentSubmissionMode')
            ->willReturn(SubmissionMode::INDIVIDUAL);

        $this->featureFlagChecker->expects($this->once())
            ->method('isEnabled')
            ->willReturn(false);

        $testSession->expects($this->once())
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentItemSession->expects($this->once())
            ->method('getItemSessionControl')
            ->willReturn($itemSessionControl);

        $itemSessionControl->expects($this->once())
            ->method('mustShowFeedback')
            ->willReturn(true);

        $this->assertTrue($this->qtiRunnerService->displayFeedbacks($context));
    }
}

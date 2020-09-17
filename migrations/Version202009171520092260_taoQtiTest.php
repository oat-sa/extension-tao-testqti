<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use common_report_Report as Report;
use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\test\AssessmentTestXmlFactory;
use oat\taoQtiTest\models\test\Template\DefaultConfigurationRegistry;
use oat\taoQtiTest\scripts\install\SetupDefaultTemplateConfiguration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202009171520092260_taoQtiTest extends AbstractMigration
{
    private const FACTORY_OPTIONS_TO_REGISTRY_CONFIGURATION_MAP = [
        'test_part_id'             => SetupDefaultTemplateConfiguration::PART_ID_PREFIX,
        'assessment_section_id'    => SetupDefaultTemplateConfiguration::SECTION_ID_PREFIX,
        'assessment_section_title' => SetupDefaultTemplateConfiguration::SECTION_TITLE_PREFIX,
        'navigation_mode'          => SetupDefaultTemplateConfiguration::NAVIGATION_MODE,
        'submission_mode'          => SetupDefaultTemplateConfiguration::SUBMISSION_MODE,
        'max_attempts'             => SetupDefaultTemplateConfiguration::MAX_ATTEMPTS,
    ];

    private const TRIMMABLE_OPTION_VALUE_POSTFIXES = [
        'test_part_id'             => '-1',
        'assessment_section_id'    => '-1',
        'assessment_section_title' => ' 1',
    ];

    public function getDescription(): string
    {
        return 'Register ' . AssessmentTestXmlFactory::class;
    }

    public function up(Schema $schema): void
    {
        /** @var AssessmentTestXmlFactory $testTemplateFactory */
        $testTemplateFactory = $this->getServiceLocator()->get(AssessmentTestXmlFactory::class);

        $testTemplateFactory->setOptions(
            $this->upgradeTemplateFactoryOptions(
                $testTemplateFactory->getOptions()
            )
        );

        /** @noinspection PhpUnhandledExceptionInspection */
        $this->getServiceManager()->register(AssessmentTestXmlFactory::SERVICE_ID, $testTemplateFactory);

        $this->addReport(
            Report::createSuccess(
                sprintf('Registered %s service.', AssessmentTestXmlFactory::SERVICE_ID)
            )
        );
    }

    public function down(Schema $schema): void
    {
        /** @var AssessmentTestXmlFactory $testTemplateFactory */
        $testTemplateFactory = $this->getServiceLocator()->get(AssessmentTestXmlFactory::class);

        $testTemplateFactory->setOptions(
            $this->downgradeTemplateFactoryOptions(
                $testTemplateFactory->getOptions()
            )
        );

        /** @noinspection PhpUnhandledExceptionInspection */
        $this->getServiceManager()->register(AssessmentTestXmlFactory::SERVICE_ID, $testTemplateFactory);

        $this->addReport(
            Report::createSuccess(
                sprintf('Registered %s service.', AssessmentTestXmlFactory::SERVICE_ID)
            )
        );

        DefaultConfigurationRegistry::getRegistry()->remove(DefaultConfigurationRegistry::ID);

        $this->addReport(
            Report::createSuccess(
                sprintf('Unregistered %s registry.', DefaultConfigurationRegistry::ID)
            )
        );
    }

    private function upgradeTemplateFactoryOptions(array $options): array
    {
        $this->registerTemplateOptionsInRegistry($options);

        $options = array_diff_key($options, self::FACTORY_OPTIONS_TO_REGISTRY_CONFIGURATION_MAP);

        $options[AssessmentTestXmlFactory::OPTION_CONFIGURATION_REGISTRY] = [
            'class' => DefaultConfigurationRegistry::class,
        ];

        $this->addReport(
            Report::createSuccess(
                sprintf(
                    "Upgraded %s service options to the following ones:\n%s",
                    AssessmentTestXmlFactory::SERVICE_ID,
                    json_encode($options, JSON_PRETTY_PRINT)
                )
            )
        );

        return $options;
    }

    private function downgradeTemplateFactoryOptions(array $options): array
    {
        unset($options[AssessmentTestXmlFactory::OPTION_CONFIGURATION_REGISTRY]);

        $registryConfigurationToFactoryOptionsMap = array_flip(self::FACTORY_OPTIONS_TO_REGISTRY_CONFIGURATION_MAP);

        foreach (
            DefaultConfigurationRegistry::getRegistry()->get(DefaultConfigurationRegistry::ID)
            as $configurationKey => $value
        ) {
            if (!isset($registryConfigurationToFactoryOptionsMap[$configurationKey])) {
                continue;
            }

            $option = $registryConfigurationToFactoryOptionsMap[$configurationKey];

            if (isset(self::TRIMMABLE_OPTION_VALUE_POSTFIXES[$option])) {
                $value .= self::TRIMMABLE_OPTION_VALUE_POSTFIXES[$option];
            }

            $options[$option] = $value;
        }

        $this->addReport(
            Report::createSuccess(
                sprintf(
                    "Downgraded %s service options to the following ones:\n%s",
                    AssessmentTestXmlFactory::SERVICE_ID,
                    json_encode($options, JSON_PRETTY_PRINT)
                )
            )
        );

        return $options;
    }

    private function registerTemplateOptionsInRegistry(array $options): void
    {
        $parameters = [];

        foreach ($options as $option => $value) {
            if (!isset(self::FACTORY_OPTIONS_TO_REGISTRY_CONFIGURATION_MAP[$option])) {
                continue;
            }

            $parameter = self::FACTORY_OPTIONS_TO_REGISTRY_CONFIGURATION_MAP[$option];

            if (isset(self::TRIMMABLE_OPTION_VALUE_POSTFIXES[$option])) {
                $value = substr($value, 0, -2);
            }

            $parameters[] = "--$parameter";
            $parameters[] = (string)$value;
        }

        $this->addReport(
            $this->propagate(new SetupDefaultTemplateConfiguration())($parameters)
        );
    }
}

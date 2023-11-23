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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\config;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\config\Business\Contract\OverriddenOptionsRepositoryInterface;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\SectionPauseService;

/**
 * Class QtiRunnerOptions
 * @package oat\taoQtiTest\models\runner\options
 */
class QtiRunnerConfig extends ConfigurableService implements RunnerConfig
{
    public const SERVICE_ID = 'taoQtiTest/QtiRunnerConfig';

    public const OPTION_CONFIG = 'config';

    public const CATEGORY_OPTION_PREFIX = 'x-tao-option-';

    /**
     * @deprecated since version 29.5.0, to be removed in 30.0.0. Use QtiRunnerService::TOOL_ITEM_THEME_SWITCHER instead
     */
    public const TOOL_ITEM_THEME_SWITCHER = 'itemThemeSwitcher';

    /**
     * @deprecated since version 29.5.0, to be removed in 30.0.0.
     *             Use QtiRunnerService::TOOL_ITEM_THEME_SWITCHER_KEY instead
     */
    public const TOOL_ITEM_THEME_SWITCHER_KEY = 'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher';

    public const TARGET_CLIENT = 'client';

    /**
     * The test runner config
     * @var array
     */
    protected $config;

    /**
     * The test runner currently activated options
     * @var array
     */
    protected $options;

    /**
     * Returns the config of the test runner
     * @return array|mixed
     * @throws \common_ext_ExtensionException
     */
    protected function buildConfig()
    {
        if ($this->hasOption(self::OPTION_CONFIG)) {
            // load the configuration from service
            $config = $this->getOption(self::OPTION_CONFIG);
        } else {
            // fallback to get the raw server config, using the old notation
            $rawConfig = \common_ext_ExtensionsManager::singleton()
                ->getExtensionById('taoQtiTest')
                ->getConfig('testRunner');
            // build the test config using the new notation
            $target = isset($rawConfig['timer'], $rawConfig['timer']['target']) ? $rawConfig['timer']['target'] : null;
            $config = [
                'timerWarning' => isset($rawConfig['timerWarning']) ? $rawConfig['timerWarning'] : null,
                'timerWarningForScreenreader' => $rawConfig['timerWarningForScreenreader'] ?? null,
                'catEngineWarning' => isset($rawConfig['catEngineWarning']) ? $rawConfig['catEngineWarning'] : null,
                'progressIndicator' => [
                    'type' => isset($rawConfig['progress-indicator']) ? $rawConfig['progress-indicator'] : null,
                    'renderer' => $rawConfig['progress-indicator-renderer'] ?? null,
                    'scope' => $rawConfig['progress-indicator-scope'] ?? null,
                    'forced' => $rawConfig['progress-indicator-forced'] ?? false,
                    'showLabel' => !empty($rawConfig['progress-indicator-show-label']),
                    'showTotal' => !empty($rawConfig['progress-indicator-show-total']),
                    'categories' => isset($rawConfig['progress-categories']) ? $rawConfig['progress-categories'] : [],
                ],
                'review' => [
                    'enabled' => !empty($rawConfig['test-taker-review']),
                    'scope' => $rawConfig['test-taker-review-scope'] ?? null,
                    'useTitle' => !empty($rawConfig['test-taker-review-use-title']),
                    'forceTitle' => !empty($rawConfig['test-taker-review-force-title']),
                    'forceInformationalTitle' => !empty($rawConfig['test-taker-review-force-informational-title']),
                    'showLegend' => !empty($rawConfig['test-taker-review-show-legend']),
                    'defaultOpen' => !empty($rawConfig['test-taker-review-default-open']),
                    'itemTitle' => $rawConfig['test-taker-review-item-title'] ?? null,
                    'informationalItemTitle' => $rawConfig['test-taker-review-informational-item-title'] ?? null,
                    'preventsUnseen' => !empty($rawConfig['test-taker-review-prevents-unseen']),
                    'canCollapse' => !empty($rawConfig['test-taker-review-can-collapse']),
                    'displaySubsectionTitle' => !empty($rawConfig['test-taker-review-display-subsection-title']),
                    'allowSkipahead' => $rawConfig['test-taker-review-skipahead'] ?? false,
                    // phpcs:disable Generic.Files.LineLength
                    'partiallyAnsweredIsAnswered' => $rawConfig['test-taker-review-partially-answered-is-answered'] ?? true,
                    // phpcs:enable Generic.Files.LineLength
                ],
                'exitButton' => !empty($rawConfig['exitButton']),
                'nextSection' => !empty($rawConfig['next-section']),
                'plugins' => isset($rawConfig['plugins']) ? $rawConfig['plugins'] : null,
                'security' => [
                    'csrfToken' => isset($rawConfig['csrf-token']) ? $rawConfig['csrf-token'] : false,
                ],
                'timer' => [
                    'target' => $target,
                    'resetAfterResume' => !empty($rawConfig['reset-timer-after-resume']),
                    'keepUpToTimeout' => !empty($rawConfig['keep-timer-up-to-timeout']),
                    'restoreTimerFromClient' => $target === self::TARGET_CLIENT,
                ],
                'enableAllowSkipping' => $rawConfig['enable-allow-skipping'] ?? false,
                'enableValidateResponses' => $rawConfig['enable-validate-responses'] ?? false,
                'checkInformational' => $rawConfig['check-informational'] ?? false,
                'enableUnansweredItemsWarning' => $rawConfig['test-taker-unanswered-items-message'] ?? true,
                'allowShortcuts' => !empty($rawConfig['allow-shortcuts']),
                'shortcuts' => isset($rawConfig['shortcuts']) ? $rawConfig['shortcuts'] : [],
                'itemCaching' => [
                    'enabled' => $rawConfig['allow-browse-next-item'] ?? false,
                    'amount' => isset($rawConfig['item-cache-size']) ? intval($rawConfig['item-cache-size']) : 3,
                    'itemStoreTTL' => isset($rawConfig['item-store-ttl'])
                        ? intval($rawConfig['item-store-ttl'])
                        : 15 * 60,
                ],
                'guidedNavigation' => isset($rawConfig['guidedNavigation']) ? $rawConfig['guidedNavigation'] : false,
                'toolStateServerStorage' => $rawConfig['tool-state-server-storage'] ?? [],
                'forceEnableLinearNextItemWarning' => $rawConfig['force-enable-linear-next-item-warning'] ?? false,
                'enableLinearNextItemWarningCheckbox' => $rawConfig['enable-linear-next-item-warning-checkbox'] ?? true,
                'skipPausedAssessmentDialog' => $rawConfig['skip-paused-assessment-dialog'] ?? false,
            ];
        }

        // Send a unique value so the frontent knows if the test has been reopened
        // in another tab (that allows it to not modify the local storage from two
        // different tabs)
        //
        $config['runNumberId'] = floor(microtime(true) * 100);

        return $config;
    }

    /**
     * Returns the config of the test runner
     * @return mixed
     */
    public function getConfig()
    {
        if (is_null($this->config)) {
            // build the test config using the new notation
            $this->config = $this->buildConfig();
        }
        return $this->config;
    }

    /**
     * Returns the value of a config entry.
     * The name can be a namespace, each name being separated by a dot, like: 'itemCaching.enabled'
     * @param string $name
     * @return mixed
     */
    public function getConfigValue($name)
    {
        $config = $this->getConfig();

        $path = explode('.', (string)$name);
        foreach ($path as $entry) {
            if (isset($config[$entry])) {
                $config =& $config[$entry];
            } else {
                return null;
            }
        }

        return $config;
    }

    /**
     * Returns the options related to the current test context
     * @param RunnerServiceContext $context The test context
     * @return mixed
     */
    protected function buildOptions(RunnerServiceContext $context)
    {
        $session = $context->getTestSession();

        // Comment allowed? Skipping allowed? Logout or Exit allowed ?
        $options = [
            'allowComment'      => \taoQtiTest_helpers_TestRunnerUtils::doesAllowComment($session),
            'allowSkipping'     => \taoQtiTest_helpers_TestRunnerUtils::doesAllowSkipping($session),
            'exitButton'        => \taoQtiTest_helpers_TestRunnerUtils::doesAllowExit($session, $context),
            'logoutButton'      => \taoQtiTest_helpers_TestRunnerUtils::doesAllowLogout($session),
            'validateResponses' => \taoQtiTest_helpers_TestRunnerUtils::doesValidateResponses($session),
            'sectionPause'      => $this->getSectionPauseService()->couldBePaused($session)
        ];

        // get the options from the categories owned by the current item
        $categories = $this->getCategories($context);
        $prefixCategoryLen = strlen(self::CATEGORY_OPTION_PREFIX);
        foreach ($categories as $category) {
            if (!strncmp($category, self::CATEGORY_OPTION_PREFIX, $prefixCategoryLen)) {
                // extract the option name from the category, transform to camelCase if needed
                $optionName = lcfirst(
                    str_replace(
                        ' ',
                        '',
                        ucwords(strtr(substr($category, $prefixCategoryLen), ['-' => ' ', '_' => ' ']))
                    )
                );

                // the options added by the categories are just flags
                $options[$optionName] = true;
            }
        }

        foreach ($this->getOverriddenOptionsRepository()->findAll() as $option) {
            $options[$option->getId()] = $option->isEnabled();
        }

        return $options;
    }

    /**
     * Returns the options related to the current test context
     * @param RunnerServiceContext $context The test context
     * @return mixed
     */
    public function getTestOptions(RunnerServiceContext $context)
    {
        if (is_null($this->options)) {
            // build the test config using the new notation
            $this->options = $this->buildOptions($context);
        }
        return $this->options;
    }

    /**
     * Get Categories.
     *
     * Get the categories of the current AssessmentItemRef in the route depending on a given $context.
     *
     * @param RunnerServiceContext $context
     * @return array An array of strings.
     */
    protected function getCategories(RunnerServiceContext $context)
    {
        return $context->getCurrentAssessmentItemRef()->getCategories()->getArrayCopy();
    }

    private function getSectionPauseService(): SectionPauseService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(SectionPauseService::SERVICE_ID);
    }

    private function getOverriddenOptionsRepository(): OverriddenOptionsRepositoryInterface
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(OverriddenOptionsRepositoryInterface::SERVICE_ID);
    }
}

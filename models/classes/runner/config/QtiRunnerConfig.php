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
use oat\tao\model\theme\ThemeService;
use oat\taoQtiTest\models\SectionPauseService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoTests\models\runner\time\TimePoint;

/**
 * Class QtiRunnerOptions
 * @package oat\taoQtiTest\models\runner\options
 */
class QtiRunnerConfig extends ConfigurableService implements RunnerConfig
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerConfig';

    const OPTION_CONFIG = 'config';

    /**
     * @deprecated since version 29.5.0, to be removed in 30.0.0. Use QtiRunnerService::TOOL_ITEM_THEME_SWITCHER instead
     */
    const TOOL_ITEM_THEME_SWITCHER = 'itemThemeSwitcher';

    /**
     * @deprecated since version 29.5.0, to be removed in 30.0.0. Use QtiRunnerService::TOOL_ITEM_THEME_SWITCHER_KEY instead
     */
    const TOOL_ITEM_THEME_SWITCHER_KEY = 'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher';

    const TARGET_CLIENT = 'client';

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
    protected function buildConfig() {
        if ($this->hasOption(self::OPTION_CONFIG)) {
            // load the configuration from service
            $config = $this->getOption(self::OPTION_CONFIG);
        } else {
            // fallback to get the raw server config, using the old notation
            $rawConfig = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
            // build the test config using the new notation
            $target = isset($rawConfig['timer']) && isset($rawConfig['timer']['target']) ? $rawConfig['timer']['target'] : null;
            $config = [
                'timerWarning' => isset($rawConfig['timerWarning']) ? $rawConfig['timerWarning'] : null,
                'catEngineWarning' => isset($rawConfig['catEngineWarning']) ? $rawConfig['catEngineWarning'] : null,
                'progressIndicator' => [
                    'type' => isset($rawConfig['progress-indicator']) ? $rawConfig['progress-indicator'] : null,
                    'renderer' => isset($rawConfig['progress-indicator-renderer']) ? $rawConfig['progress-indicator-renderer'] : null,
                    'scope' => isset($rawConfig['progress-indicator-scope']) ? $rawConfig['progress-indicator-scope'] : null,
                    'forced' => isset($rawConfig['progress-indicator-forced']) ? $rawConfig['progress-indicator-forced'] : false,
                    'showLabel' => !empty($rawConfig['progress-indicator-show-label']),
                    'showTotal' => !empty($rawConfig['progress-indicator-show-total']),
                    'categories' => isset($rawConfig['progress-categories']) ? $rawConfig['progress-categories'] : [],
                ],
                'review' => [
                    'enabled' => !empty($rawConfig['test-taker-review']),
                    'scope' => isset($rawConfig['test-taker-review-scope']) ? $rawConfig['test-taker-review-scope'] : null,
                    'useTitle' => !empty($rawConfig['test-taker-review-use-title']),
                    'forceTitle' => !empty($rawConfig['test-taker-review-force-title']),
                    'forceInformationalTitle' => !empty($rawConfig['test-taker-review-force-informational-title']),
                    'showLegend' => !empty($rawConfig['test-taker-review-show-legend']),
                    'defaultOpen' => !empty($rawConfig['test-taker-review-default-open']),
                    'itemTitle' => isset($rawConfig['test-taker-review-item-title']) ? $rawConfig['test-taker-review-item-title'] : null,
                    'informationalItemTitle' => isset($rawConfig['test-taker-review-informational-item-title']) ? $rawConfig['test-taker-review-informational-item-title'] : null,
                    'preventsUnseen' => !empty($rawConfig['test-taker-review-prevents-unseen']),
                    'canCollapse' => !empty($rawConfig['test-taker-review-can-collapse']),
                    'displaySubsectionTitle' => !empty($rawConfig['test-taker-review-display-subsection-title']),
                    'allowSkipahead' => isset($rawConfig['test-taker-review-skipahead']) ? $rawConfig['test-taker-review-skipahead'] : false,
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
                'enableAllowSkipping' => isset($rawConfig['enable-allow-skipping']) ? $rawConfig['enable-allow-skipping'] : false,
                'enableValidateResponses' => isset($rawConfig['enable-validate-responses']) ? $rawConfig['enable-validate-responses'] : false,
                'checkInformational' => isset($rawConfig['check-informational']) ? $rawConfig['check-informational'] : false,
                'enableUnansweredItemsWarning' => isset($rawConfig['test-taker-unanswered-items-message']) ? $rawConfig['test-taker-unanswered-items-message'] : true,
                'allowShortcuts' => !empty($rawConfig['allow-shortcuts']),
                'shortcuts' => isset($rawConfig['shortcuts']) ? $rawConfig['shortcuts'] : [],
                'itemCaching' => [
                    'enabled' => isset($rawConfig['allow-browse-next-item']) ? $rawConfig['allow-browse-next-item'] : false,
                    'amount' => isset($rawConfig['item-cache-size']) ? intval($rawConfig['item-cache-size']) : 3,
                ],
                'guidedNavigation' => isset($rawConfig['guidedNavigation']) ? $rawConfig['guidedNavigation'] : false,
                'toolStateServerStorage' => isset($rawConfig['tool-state-server-storage']) ? $rawConfig['tool-state-server-storage'] : [],
                'forceEnableLinearNextItemWarning' => isset($rawConfig['force-enable-linear-next-item-warning']) ? $rawConfig['force-enable-linear-next-item-warning'] : false,
                'enableLinearNextItemWarningCheckbox' => isset($rawConfig['enable-linear-next-item-warning-checkbox']) ? $rawConfig['enable-linear-next-item-warning-checkbox'] : true,
            ];
        }
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
            'sectionPause'      => $this->getServiceManager()->get(SectionPauseService::SERVICE_ID)->couldBePaused($session)
        ];

        // get the options from the categories owned by the current item
        $categories = $this->getCategories($context);
        $prefixCategory = 'x-tao-option-';
        $prefixCategoryLen = strlen($prefixCategory);
        foreach ($categories as $category) {
            if (!strncmp($category, $prefixCategory, $prefixCategoryLen)) {
                // extract the option name from the category, transform to camelCase if needed
                $optionName = lcfirst(str_replace(' ', '', ucwords(strtr(substr($category, $prefixCategoryLen), ['-' => ' ', '_' => ' ']))));

                // the options added by the categories are just flags
                $options[$optionName] = true;
            }
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
}

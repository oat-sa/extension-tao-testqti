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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\xmlEditor;

use core_kernel_classes_Resource;
use oat\generis\model\GenerisRdf;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\user\implementation\UserSettingsService;
use oat\tao\model\user\UserSettingsInterface;
use oat\tao\model\user\UserSettingsServiceInterface;
use qtism\data\storage\xml\XmlDocument;
use tao_models_classes_UserService;
use taoQtiTest_models_classes_QtiTestService;

class XmlEditor extends ConfigurableService implements XmlEditorInterface
{
    private const FEATURE_FLAG_XML_EDITOR_ENABLED = 'FEATURE_FLAG_XML_EDITOR_ENABLED';
    /** @var @deprecated */
    private const LEGACY_FEATURE_FLAG_XML_EDITOR_ENABLED = 'XML_EDITOR_ENABLED';

    /**
     * {@inheritdoc}
     */
    public function getTestXml(core_kernel_classes_Resource $test): string
    {
        return $this->getTestService()->getDoc($test)->saveToString();
    }

    /**
     * {@inheritdoc}
     */
    public function saveStringTest(core_kernel_classes_Resource $test, string $testString): bool
    {
        $doc = new XmlDocument();
        $doc->loadFromString($testString, true);
        $converter = new \taoQtiTest_models_classes_QtiTestConverter($doc);

        return $this->getTestService()->saveJsonTest($test, $converter->toJson());
    }

    /**
     * {@inheritdoc}
     */
    public function isLocked(): bool
    {
        if ($this->getUserInterfaceMode() == GenerisRdf::PROPERTY_USER_INTERFACE_MODE_SIMPLE) {
            return true;
        }

        if (
            $this->getFeatureFlagChecker()->isEnabled(self::FEATURE_FLAG_XML_EDITOR_ENABLED)
            || $this->getFeatureFlagChecker()->isEnabled(self::LEGACY_FEATURE_FLAG_XML_EDITOR_ENABLED)
        ) {
            return false;
        }

        return $this->hasOption('is_locked') ? (bool)$this->getOption('is_locked') : true;
    }

    private function getTestService(): taoQtiTest_models_classes_QtiTestService
    {
        return $this->getServiceLocator()->get(taoQtiTest_models_classes_QtiTestService::class);
    }

    private function getFeatureFlagChecker(): FeatureFlagChecker
    {
        return $this->getServiceManager()->getContainer()->get(FeatureFlagChecker::class);
    }
    private function getUserInterfaceModeService(): UserInterfaceModeService
    {
        return $this->getServiceManager()->getContainer()->get(UserInterfaceModeService::class);
    }

    private function getUserService(): tao_models_classes_UserService
    {
        return $this->getServiceManager()->getContainer()->get(tao_models_classes_UserService::class);
    }

    public function getUserSettingsService(): UserSettingsService
    {
        return $this->getServiceManager()->getContainer()->get(UserSettingsServiceInterface::class);
    }

    private function getUserInterfaceMode(): ?string
    {
        $userResource = $this->getUserService()->getCurrentUser();
        $userSettings = $this->getUserSettingsService()->get($userResource);

        return $userSettings->getSetting(UserSettingsInterface::INTERFACE_MODE);
    }
}

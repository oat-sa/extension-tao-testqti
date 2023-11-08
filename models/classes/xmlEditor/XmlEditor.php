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

use common_ext_ExtensionsManager;
use core_kernel_classes_Resource;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use qtism\data\storage\xml\XmlDocument;
use taoQtiTest_models_classes_QtiTestService;

class XmlEditor implements XmlEditorInterface
{
    private const FEATURE_FLAG_XML_EDITOR_ENABLED = 'FEATURE_FLAG_XML_EDITOR_ENABLED';
    private const CONFIG = 'xmlEditor';

    /** @var taoQtiTest_models_classes_QtiTestService */
    private taoQtiTest_models_classes_QtiTestService $qtiTestService;

    /** @var FeatureFlagChecker */
    private FeatureFlagChecker $featureFlagChecker;

    private array $options = [];

    public function __construct(
        common_ext_ExtensionsManager $extensionsManager,
        taoQtiTest_models_classes_QtiTestService $qtiTestService,
        FeatureFlagChecker $featureFlagChecker
    ) {
        $this->options = $extensionsManager
            ->getExtensionById('taoQtiTest')
            ->getConfig(self::CONFIG);
        $this->qtiTestService = $qtiTestService;
        $this->featureFlagChecker = $featureFlagChecker;
    }

    /**
     * {@inheritdoc}
     */
    public function getTestXml(core_kernel_classes_Resource $test): string
    {
        return $this->qtiTestService->getDoc($test)->saveToString();
    }

    /**
     * {@inheritdoc}
     */
    public function saveStringTest(core_kernel_classes_Resource $test, string $testString): bool
    {
        $doc = new XmlDocument();
        $doc->loadFromString($testString, true);
        $converter = new \taoQtiTest_models_classes_QtiTestConverter($doc);

        return $this->qtiTestService->saveJsonTest($test, $converter->toJson());
    }

    /**
     * {@inheritdoc}
     */
    public function isLocked(): bool
    {
        if ($this->featureFlagChecker->isEnabled(self::FEATURE_FLAG_XML_EDITOR_ENABLED)) {
            return false;
        }

        return isset($this->options['is_locked']) ? (bool)$this->options['is_locked'] : true;
    }
}

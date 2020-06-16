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

use oat\oatbox\service\ConfigurableService;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use taoQtiTest_models_classes_QtiTestConverterException;
use taoQtiTest_models_classes_QtiTestService;
use \core_kernel_classes_Resource;

class XmlEditor extends ConfigurableService implements XmlEditorInterface
{
    /**
     * {@inheritdoc}
     */
    public function getTestXml(core_kernel_classes_Resource $test) : string
    {
        return $this->getTestService()->getDoc($test)->saveToString();
    }

    /**
     * @param core_kernel_classes_Resource $test
     * @param string $testString
     * @return bool
     * @throws XmlStorageException
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function saveStringTest(core_kernel_classes_Resource $test, string $testString): bool
    {
        $doc = new XmlDocument();
        $doc->loadFromString($testString);
        $converter = new \taoQtiTest_models_classes_QtiTestConverter($doc);

        return $this->getTestService()->saveJsonTest($test, $converter->toJson());
    }

    /**
     * {@inheritdoc}
     */
    public function isLocked(): bool
    {
        return $this->hasOption('is_locked') ? (bool)$this->getOption('is_locked') : true;
    }

    private function getTestService() : taoQtiTest_models_classes_QtiTestService
    {
        return $this->getServiceLocator()->get(taoQtiTest_models_classes_QtiTestService::class);

    }
}

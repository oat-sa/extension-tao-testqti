<?php

declare(strict_types=1);

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


namespace oat\taoQtiTest\models\xmlEditor;

use oat\oatbox\service\ConfigurableService;
use qtism\data\storage\xml\XmlStorageException;
use taoQtiTest_models_classes_QtiTestService;
use \core_kernel_classes_Resource;
use taoQtiTest_models_classes_QtiTestServiceException;

/**
 * Class XmlEditor
 * @package oat\taoQtiTest\models\xmlEditor
 */
class XmlEditor extends ConfigurableService implements XmlEditorInterface
{
    /**
     * @param core_kernel_classes_Resource $test
     * @return string
     * @throws XmlStorageException
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getTestXml(core_kernel_classes_Resource $test) : string
    {
        return $this->getTestService()->getDoc($test)->saveToString();
    }

    /**
     * @return bool
     */
    public function isLocked(): bool
    {
        return $this->hasOption('is_locked') ? $this->getOption('is_locked') : true;
    }

    /**
     * @return taoQtiTest_models_classes_QtiTestService
     */
    private function getTestService() : taoQtiTest_models_classes_QtiTestService
    {
        return $this->getServiceLocator()->get(taoQtiTest_models_classes_QtiTestService::class);

    }
}

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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ConfigurableService;
use tao_models_classes_service_FileStorage;
use taoQtiTest_models_classes_QtiTestService;

class TestDefinitionSerializerService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TestDefinitionSerializerService';

    /**
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     * @throws \common_exception_InconsistentData
     * @throws \oat\tao\model\websource\WebsourceNotFound
     */
    public function getSerializedTestDefinition(QtiRunnerServiceContext $serviceContext)
    {
        return $this->parseXmlToArray($this->getTestDefinitionFilePath($serviceContext));
    }

    /**
     * @param string $filePath
     * @return array
     */
    private function parseXmlToArray($filePath)
    {
        $xml = simplexml_load_file($filePath);
        $parsedXml = json_decode(json_encode($xml), true);

        return $this->setSubObjectToArray($parsedXml, [
            taoQtiTest_models_classes_QtiTestService::XML_TEST_PART,
            taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_SECTION,
            taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_ITEM_REF,
        ]);
    }

    /**
     * Changes recursively the value of the given sub-keys into array in the given object
     *
     * @param array $object
     * @param array $keys
     * @return array
     */
    private function setSubObjectToArray($object, $keys)
    {
        $key = array_shift($keys);

        // if the object is an associative array, turn it into an indexed array
        if ($object[$key] !== array_values($object[$key])) {
            $object[$key] = [$object[$key]];
        }

        if (count($keys) > 0) {
            foreach ($object[$key] as $index => $subObject) {
                $object[$key][$index] = $this->setSubObjectToArray($subObject, $keys);
            }
        }

        return $object;
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     * @return string
     * @throws \common_exception_InconsistentData
     * @throws \oat\tao\model\websource\WebsourceNotFound
     */
    private function getTestDefinitionFilePath(QtiRunnerServiceContext $serviceContext)
    {
        return implode('/', [
            $this->getPrivateDirectoryPath($serviceContext->getTestCompilationUri()),
            $this->getQtiTestDefinitionFilePath($serviceContext),
        ]);
    }

    /**
     * @param string $testCompilationUri
     * @return string
     * @throws \oat\tao\model\websource\WebsourceNotFound
     * @throws \common_exception_InconsistentData
     */
    private function getPrivateDirectoryPath($testCompilationUri)
    {
        $privateDirectoryId = explode('|', $testCompilationUri)[0];

        return $this
            ->getFileStorageService()
            ->getDirectoryById($privateDirectoryId)
            ->getPath();
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     * @throws \common_exception_InconsistentData
     * @throws \oat\tao\model\websource\WebsourceNotFound
     * @return bool|string
     */
    private function getQtiTestDefinitionFilePath(QtiRunnerServiceContext $serviceContext)
    {
        $indexFilePath = implode('/', [
            $this->getPrivateDirectoryPath($serviceContext->getTestCompilationUri()),
            taoQtiTest_models_classes_QtiTestService::QTI_TEST_DEFINITION_INDEX,
        ]);

        return file_get_contents($indexFilePath);
    }


    /**
     * @return tao_models_classes_service_FileStorage
     */
    private function getFileStorageService()
    {
        return $this->getServiceLocator()->get(\tao_models_classes_service_FileStorage::SERVICE_ID);
    }
}

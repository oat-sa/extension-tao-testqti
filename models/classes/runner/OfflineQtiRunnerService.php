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
use oat\taoQtiTest\models\runner\map\RunnerMap;

/**
 * Service class for the offline version of Qti Test Runner
 */
class OfflineQtiRunnerService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/OfflineQtiRunnerService';

    /**
     * Returns an array of items, containing also confident data, like branching and response processing rules
     *
     * @param RunnerServiceContext $serviceContext
     * @return array
     * @throws \common_Exception
     * @throws \common_exception_Error
     * @throws \common_exception_InconsistentData
     * @throws \common_exception_InvalidArgumentType
     */
    public function getItems(RunnerServiceContext $serviceContext)
    {
        $this->getRunnerService()->assertQtiRunnerServiceContext($serviceContext);

        $runnerService = $this->getRunnerService();
        $testMap = $runnerService->getTestMap($serviceContext);
        $items = [];

        foreach ($this->getItemIdentifiersFromTestMap($testMap) as $itemIdentifier) {
            $itemRef = $runnerService->getItemHref($serviceContext, $itemIdentifier);

            $itemState = $runnerService->getItemState($serviceContext, $itemIdentifier);

            if (is_array($itemState) && (0 === count($itemState))) {
                $itemState = null;
            }

            /** @var QtiRunnerServiceContext $serviceContext */
            $items[$itemIdentifier] = [
                'baseUrl' => $runnerService->getItemPublicUrl($serviceContext, $itemRef),
                'itemData' => $this->getItemData($serviceContext, $itemRef),
                'itemState' => $itemState,
                'itemIdentifier' => $itemIdentifier,
                'portableElements' => $runnerService->getItemPortableElements($serviceContext, $itemRef),
            ];
        }

        return $items;
    }

    /**
     * Returns the itemData, extending with the variable elements
     *
     * @param RunnerServiceContext $context
     * @param string $itemRef
     * @return array
     * @throws \common_exception_InvalidArgumentType
     * @throws \common_Exception
     */
    private function getItemData(RunnerServiceContext $context, $itemRef)
    {
        $this->getRunnerService()->assertQtiRunnerServiceContext($context);

        $itemData = $this->getRunnerService()->getItemData($context, $itemRef);
        $itemDataVariable = $this->getRunnerService()->getItemVariableElementsData($context, $itemRef);
        $responses = $itemData['data']['responses'];

        foreach (array_keys($responses) as $responseId) {
            if (array_key_exists($responseId, $itemDataVariable)) {
                $itemData['data']['responses'][$responseId] = array_merge(...[
                    $responses[$responseId],
                    $itemDataVariable[$responseId],
                ]);
            }
        }

        return $itemData;
    }

    /**
     * Returns the item identifiers
     *
     * @param array $testMap
     * @return array
     */
    private function getItemIdentifiersFromTestMap($testMap)
    {
        return $this->getSubIdentifiersRecursively($testMap, [
            RunnerMap::MAP_ATTRIBUTE_PARTS,
            RunnerMap::MAP_ATTRIBUTE_SECTIONS,
            RunnerMap::MAP_ATTRIBUTE_ITEMS,
        ]);
    }

    /**
     * Calls itself recursively to return identifiers from nested arrays
     *
     * @param $array
     * @param $identifiers
     * @return array
     */
    private function getSubIdentifiersRecursively($array, $identifiers)
    {
        $identifier = array_shift($identifiers);
        if (count($identifiers) > 0) {
            $result = [];

            foreach ($array[$identifier] as $key => $value) {
                $result[] = $this->getSubIdentifiersRecursively(
                    $array[$identifier][$key],
                    $identifiers
                );
            }

            return array_merge(...$result);
        }

        return array_keys($array[$identifier]);
    }

    /**
     * @return ConfigurableService|QtiRunnerService
     */
    private function getRunnerService()
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }
}

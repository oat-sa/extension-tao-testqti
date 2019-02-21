<?php

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\map\RunnerMap;

/**
 * Service class for the offline version of Qti Test Runner
 *
 * @package oat\taoQtiTest\models\runner
 */
class OfflineQtiRunnerService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/OfflineQtiRunnerService';

    /**
     * Returns an array of items, containing also confident data, like branching and response processing rules
     *
     * @param $serviceContext
     * @return array
     * @throws \common_Exception
     * @throws \common_exception_Error
     * @throws \common_exception_InconsistentData
     * @throws \common_exception_InvalidArgumentType
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getItems($serviceContext)
    {
        /** @var QtiRunnerService $runnerService */
        $runnerService = $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
        $testMap = $runnerService->getTestMap($serviceContext);
        $items = [];

        foreach ($this->getItemIdentifiersFromTestMap($testMap) as $itemIdentifier) {
            $itemRef = $runnerService->getItemHref($serviceContext, $itemIdentifier);

            $items[$itemIdentifier] = [
                'baseUrl' => $runnerService->getItemPublicUrl($serviceContext, $itemRef),
                'itemData' => $runnerService->getItemData($serviceContext, $itemRef),
                'itemState' => $runnerService->getItemState($serviceContext, $itemIdentifier),
                'itemMetaData' => $runnerService->getFeedbacks($serviceContext, $itemRef),
                'itemBranchingRules' => $serviceContext->getTestMeta()['branchRules'],
                'itemIdentifier' => $itemIdentifier,
                'portableElements' => $runnerService->getItemPortableElements($serviceContext, $itemRef),
            ];
        }
        return $items;
    }

    /**
     * @param $testMap
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
}
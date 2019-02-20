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
        $identifiers = [];

        if (!array_key_exists(RunnerMap::MAP_ATTRIBUTE_PARTS, $testMap)) {
            return $identifiers;
        }

        $partIdentifiers = array_keys($testMap[RunnerMap::MAP_ATTRIBUTE_PARTS]);

        foreach ($partIdentifiers as $partIdentifier) {
            $part = $testMap[RunnerMap::MAP_ATTRIBUTE_PARTS][$partIdentifier];

            if (!array_key_exists(RunnerMap::MAP_ATTRIBUTE_SECTIONS, $part)) {
                continue;
            }

            $sectionIdentifiers = array_keys($part[RunnerMap::MAP_ATTRIBUTE_SECTIONS]);

            foreach ($sectionIdentifiers as $sectionIdentifier) {
                $section = $part[RunnerMap::MAP_ATTRIBUTE_SECTIONS][$sectionIdentifier];

                if (!array_key_exists(RunnerMap::MAP_ATTRIBUTE_ITEMS, $section)) {
                    continue;
                }

                $itemIdentifiers = array_keys($section[RunnerMap::MAP_ATTRIBUTE_ITEMS]);

                foreach ($itemIdentifiers as $itemIdentifier) {
                    $identifiers[] = $itemIdentifier;
                }
            }
        }

        return $identifiers;
    }
}
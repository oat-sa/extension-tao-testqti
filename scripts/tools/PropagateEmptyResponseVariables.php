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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\tools;

use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\taoResultServer\models\classes\ResultServerService;
use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentTest;
use qtism\data\TestPart;
use tao_models_classes_service_ServiceCallHelper;
use taoResultServer_models_classes_OutcomeVariable;
use taoResultServer_models_classes_ReadableResultStorage as ReadableResultStorage;
use taoResultServer_models_classes_ResponseVariable;

class PropagateEmptyResponseVariables extends ScriptAction
{
    private const OPTION_DELIVERY_EXECUTION = 'deliveryExecutionId';
    private const OPTION_WET_RUN = 'wetRun';

    private const DE_ENDED_STATUSES = [
        DeliveryExecutionInterface::STATE_FINISHED,
        DeliveryExecutionInterface::STATE_TERMINATED
    ];

    private static $testDefinitionsByDeliveryId = [];

    protected function provideOptions()
    {
        return [
            self::OPTION_DELIVERY_EXECUTION => [
                'prefix' => 'de',
                'longPrefix' => self::OPTION_DELIVERY_EXECUTION,
                'required' => true,
                'description' => 'A comma-separated list of Deliveries Execution ids to keep on the instance.',
            ],
            self::OPTION_WET_RUN => [
                'prefix' => 'wr',
                'longPrefix' => self::OPTION_WET_RUN,
                'required' => false,
                'description' => 'Bit of wet run value',
            ],
        ];
    }

    protected function provideDescription()
    {
        // TODO: Implement provideDescription() method.
    }

    /**
     * @inheritDoc
     */
    protected function run()
    {
        $outcome = [];
        $deliveryExecutionIdList = explode(',', $this->getOption(self::OPTION_DELIVERY_EXECUTION));
        $isWetRun = (bool)$this->getOption(self::OPTION_WET_RUN) ?? 0;

        $resultServer = $this->getResultServer();
        $resultStorage = $resultServer->getResultStorage();

        $variables = $this->createVariables();
        foreach ($deliveryExecutionIdList as $deliveryExecutionId) {
            $deliveryExecution = $this->getServiceProxy()->getDeliveryExecution($deliveryExecutionId);
            if (in_array($deliveryExecution, self::DE_ENDED_STATUSES, true)) {
                $outcome[] = sprintf('[%s] Delivery execution not finished', $deliveryExecutionId);
                continue;
            }

            $itemsId = $this->fetchUniqueItemsIdFromResponseVariables($resultStorage, $deliveryExecutionId);
            $testDefinition = $this->fetchTestDefinition($deliveryExecution);
            $assessmentItemHrefByItemId = $this->extractAssocAssessmentItemHrefByItemId($testDefinition);
            $propagated = 0;
            foreach ($assessmentItemHrefByItemId as $itemId => $itemHref) {
                if (in_array($itemId, $itemsId, true)) {
                    continue;
                }
                if ($isWetRun) {
                    [$itemUri, , $testUri] = explode('|', $itemHref);
                    $callItemId = sprintf(sprintf('%s.%s.%s', $deliveryExecutionId, $itemId, 0));
                    $resultStorage->storeItemVariables(
                        $deliveryExecutionId,
                        $testUri,
                        $itemUri,
                        $variables,
                        $callItemId
                    );
                }
                $propagated++;
            }
            $outcome[] = sprintf(
                '[%s] Response variables were propagated for %s items',
                $deliveryExecutionId,
                $propagated
            );
        }

        return Report::createSuccess(implode(PHP_EOL, $outcome));
    }

    private function fetchTestDefinition(DeliveryExecution $deliveryExecution): AssessmentTest
    {
        $compiledDeliveryUri = $deliveryExecution->getDelivery()->getUri();

        if (!isset(self::$testDefinitionsByDeliveryId[$compiledDeliveryUri])) {
            $runtime = $this->getRuntimeService()->getRuntime($compiledDeliveryUri);
            $inputParameters = tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, []);

            self::$testDefinitionsByDeliveryId[$compiledDeliveryUri] = $this->getQtiTestUtil()->getTestDefinition(
                $inputParameters['QtiTestCompilation']
            );
        }

        return self::$testDefinitionsByDeliveryId[$compiledDeliveryUri];
    }

    private function fetchUniqueItemsIdFromResponseVariables(
        ReadableResultStorage $resultStorage,
        string                $deliveryExecutionId
    ): array
    {
        $resultVariables = $resultStorage->getDeliveryVariables($deliveryExecutionId);
        //filter Item Variables
        $itemFilteredVariables = array_filter($resultVariables, static function (array $variable) {
            return $variable[0]->callIdItem !== null;
        });
        // map items id
        $items = array_map(static function (array $variable) {
            $exploded = explode('.', $variable[0]->callIdItem);
            $occurrence = array_pop($exploded);
            return array_pop($exploded);
        }, $itemFilteredVariables);

        return array_unique($items);
    }

    private function extractAssocAssessmentItemHrefByItemId(AssessmentTest $assessmentTest): array
    {
        $result = [];
        /** @var TestPart $testPart */
        foreach ($assessmentTest->getTestParts() as $testPart) {
            foreach ($testPart->getAssessmentSections() as $assessmentSection) {
                /** @var AssessmentItemRef $sectionPart */
                foreach ($assessmentSection->getSectionParts() as $sectionPart) {
                    $result[$sectionPart->getIdentifier()] = $sectionPart->getHref();
                }
            }
        }
        return $result;
    }

    private function createVariables(): array
    {
        $numAttempts = (new taoResultServer_models_classes_ResponseVariable())
            ->setIdentifier('numAttempts')
            ->setCandidateResponse('1')
            ->setCardinality('single')
            ->setBaseType('integer');
        $duration = (new taoResultServer_models_classes_ResponseVariable())
            ->setIdentifier('duration')
            ->setCandidateResponse('PT0S')
            ->setCardinality('single')
            ->setBaseType('duration');
        $response = (new taoResultServer_models_classes_ResponseVariable())
            ->setIdentifier('RESPONSE')
            ->setCandidateResponse('')
            ->setCardinality('single')
            ->setBaseType('identifier');
        $completionsStatus = (new taoResultServer_models_classes_OutcomeVariable())
            ->setValue('completed')
            ->setIdentifier('SCORE')
            ->setCardinality('single')
            ->setBaseType('identifier');
        $score = (new taoResultServer_models_classes_OutcomeVariable())
            ->setValue('0')
            ->setIdentifier('SCORE')
            ->setCardinality('single')
            ->setBaseType('float');

        return [$numAttempts, $duration, $response, $completionsStatus, $score,];
    }

    protected function getServiceProxy()
    {
        return $this->getServiceLocator()->get(ServiceProxy::SERVICE_ID);
    }

    private function getQtiTestUtil(): QtiTestUtils
    {
        return $this->getServiceLocator()->get(QtiTestUtils::SERVICE_ID);
    }

    private function getResultServer(): ResultServerService
    {
        return $this->getServiceLocator()->get(ResultServerService::SERVICE_ID);
    }

    private function getRuntimeService(): RuntimeService
    {
        return $this->getServiceLocator()->get(RuntimeService::SERVICE_ID);
    }
}

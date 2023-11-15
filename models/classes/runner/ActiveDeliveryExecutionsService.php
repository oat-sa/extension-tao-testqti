<?php

namespace oat\taoQtiTest\models\runner;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use Psr\Log\LoggerInterface;

class ActiveDeliveryExecutionsService
{
    private LoggerInterface $logger;
    private DeliveryExecutionService $deliveryExecutionService;

    public function __construct(
        LoggerInterface $logger,
        // @fixme DeliveryExecutionService is from taoDeliver
        DeliveryExecutionService $deliveryExecutionService
    ) {
        $this->logger = $logger;
        $this->deliveryExecutionService = $deliveryExecutionService;
    }

    public function getDeliveryIdByExecutionId(string $executionId): ?string
    {
        // @todo Use the ontology
        $executionClass = new core_kernel_classes_Class(DeliveryExecutionInterface::CLASS_URI);
        $deliveryProperty = new core_kernel_classes_Property(
            DeliveryExecutionInterface::PROPERTY_DELIVERY
        );

        $executionInstance = $executionClass->getResource($executionId);
        $deliveryUri = $executionInstance->getUniquePropertyValue($deliveryProperty);

        if ($deliveryUri) {
            /** @noinspection PhpToStringImplementationInspection */
            return (string) $deliveryUri;
        }

        return null;
    }

    /**
     * @return string[]
     */
    public function getExecutionIdsForOtherDeliveries(string $userUri, string $currentExecutionId): array
    {
        $currentDeliveryUri = (string) $this->getDeliveryIdByExecutionId($currentExecutionId);
        $executions = $this->getActiveDeliveryExecutionsByUser($userUri);

        $executionIdsForOtherDeliveries = [];

        foreach ($executions as $executionInstance) {
            if (
                $executionInstance->getIdentifier() === $currentExecutionId
                //|| $executionInstance->getDelivery()->getUri() != $currentDelivery->getUri()
                || $executionInstance->getDelivery()->getUri() === $currentDeliveryUri
            ) {
                $this->logger->debug(
                    sprintf(
                        '%s: execution %s belongs to delivery %s == %s ------------------',
                        self::class,
                        $executionInstance->getUri(),
                        $executionInstance->getDelivery()->getUri(),
                        $currentDeliveryUri
                        //$currentDelivery->getUri()
                    )
                );

                continue;
            }

            $executionIdsForOtherDeliveries[] = $executionInstance->getUri();
        }

        return $executionIdsForOtherDeliveries;
    }

    /**
     * @return DeliveryExecutionInterface[]
     */
    public function getActiveDeliveryExecutionsByUser(string $userUri): array
    {
        // @todo direct instantiation + searchInstances won't be testable
        //  http://www.tao.lu/Ontologies/TAODelivery.rdf#DeliveryExecutionDelivery
        $executionClass = new core_kernel_classes_Class(DeliveryExecutionInterface::CLASS_URI);
        $executionInstances = $executionClass->searchInstances([
            DeliveryExecutionInterface::PROPERTY_SUBJECT  => $userUri,
            DeliveryExecutionInterface::PROPERTY_STATUS => DeliveryExecutionInterface::STATE_ACTIVE,
        ], [
            'like' => false
        ]);

        $this->logger->critical(
            sprintf('%s: %d instances ------------------', self::class, count($executionInstances))
        );

        $deliveryProperty = new core_kernel_classes_Property(
            DeliveryExecutionInterface::PROPERTY_DELIVERY
        );
        $statusProperty = new core_kernel_classes_Property(
            DeliveryExecutionInterface::PROPERTY_STATUS
        );

        $executions = [];

        foreach ($executionInstances as $executionInstance) {
            /** @noinspection PhpToStringImplementationInspection */
            $this->logger->critical(
                sprintf(
                    '%s: instance %s instance.delivery: %s state: %s ------------------',
                    self::class,
                    $executionInstance->getUri(),
                    $executionInstance->getUniquePropertyValue($deliveryProperty)->getUri(),
                    $executionInstance->getUniquePropertyValue($statusProperty)
                )
            );

            $executions[] = $this->deliveryExecutionService->getDeliveryExecution(
                $executionInstance->getUri()
            );
        }

        return $executions;
    }
}

<?php

namespace oat\taoQtiTest\models\runner\offline;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\offline\action\MoveAction;
use oat\taoQtiTest\models\runner\offline\action\SkipAction;

class OfflineService extends ConfigurableService
{
    public function process($data)
    {
        if (empty($data)) {
            throw new \common_exception_InconsistentData('No action to check. Processing action requires data.');
        }

        $response = [];
        foreach ($data as $entry) {

            $action = $this->resolve($entry);

            try {
                $responseAction = $action->process();
            } catch (\common_Exception $e) {
                $responseAction = ['error' => $e->getMessage()];
            }
            $response[] = [
                'action' => [
                    'name'       => $action->getName(),
                    'timestamp'  => $action->getTimeStamp(),
                    'parameters' => $action->getParameters(),
                ],
                'response' => $responseAction
            ];
        }

        return json_encode($response, JSON_PRETTY_PRINT);
    }

    /**
     * Resolve an offline runner action
     *
     * @param $data
     * @return TestRunnerAction
     * @throws \ResolverException
     * @throws \common_exception_InconsistentData
     */
    protected function resolve($data)
    {
        if (!isset($data['action']) || !isset($data['timestamp']) || !isset($data['parameters']) || !is_array($data['parameters'])) {
            throw new \common_exception_InconsistentData(
                'Action parameters have to contain "action", "timestamp" and "parameters" fields.');
        }

        $availableActions = $this->getAvailableActions();
        $actionName = $data['action'];

        $actionClass = null;

        // Search by key (e.q. key)
        if (isset($availableActions[$actionName])) {
            $actionClass = $availableActions[$actionName];
        }

        if (is_null($actionClass) || !is_a($actionClass, TestRunnerAction::class, true)) {
            throw new \ResolverException('Action name "' . $actionName . '" could not be resolved.');
        }

        return $this->getServiceManager()->propagate(new $actionClass($actionName, $data['timestamp'], $data['parameters']));
    }

    protected function getAvailableActions()
    {
        return [
            'move' => MoveAction::class,
            'skip' => SkipAction::class
        ];
    }
}
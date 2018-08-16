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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\communicator;

use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\runtime\tests\AssessmentTestSessionState;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * Class TestStateChannel
 *
 * Describes the test session state
 *
 * @package oat\taoQtiTest\models\runner\communicator
 */
class TestStateChannel implements ServiceLocatorAwareInterface, CommunicationChannel
{
    use ServiceLocatorAwareTrait;
    
    const CHANNEL_NAME = 'teststate';
    
    /**
     * Get name of channel
     * @return string
     */
    public function getName()
    {
        return self::CHANNEL_NAME;
    }

    /**
     * Generate output message based on test session state
     * @param QtiRunnerServiceContext $context Current runner context
     * @param array $data
     * @return array
     */
    public function process(QtiRunnerServiceContext $context, array $data = [])
    {
        $result = null;
        $session = $context->getTestSession();
        $state = $session->getState();
        $sessionId = $session->getSessionId();

        $messageService = $this->getServiceLocator()->get(QtiRunnerMessageService::SERVICE_ID);
        $stateService = $this->getServiceLocator()->get(ExtendedStateService::SERVICE_ID);
        $events = $stateService->getEvents($sessionId);
        $ids = [];
        foreach ($events as $event) {
            if ($event['type'] == self::CHANNEL_NAME) {
                $ids[] = $event['id'];
                if (isset($event['data']['state'])) {
                    $state = $event['data']['state'];
                } else {
                    \common_Logger::w('The state is missing from the ' . self::CHANNEL_NAME . ' event context');
                }

                if (isset($event['data']['message'])) {
                    //translate the message to the current user language.
                    $message = __($event['data']['message']);
                } else {
                    $message = $messageService->getStateMessage($context->getTestSession());
                    \common_Logger::w('The message is missing from the ' . self::CHANNEL_NAME . ' event context');
                }

                if (!$result || $state == AssessmentTestSessionState::CLOSED) {

                    if ($state == AssessmentTestSessionState::CLOSED) {
                        $type = 'close';
                    } else if ($state == AssessmentTestSessionState::SUSPENDED) {
                        $type = 'pause';
                    } else {
                        $type = null;
                    }

                    if(is_null($type)){
                        \common_Logger::w('Inconsistent ' . self::CHANNEL_NAME . ' event');
                    } else {
                        $result = [
                            'type' => $type,
                            'code' => $state,
                            'message' => $message,
                        ];
                    }
                }
            }
        }

        if (count($ids)) {
            $stateService->removeEvents($sessionId, $ids);
        }

        return $result;
    }
}

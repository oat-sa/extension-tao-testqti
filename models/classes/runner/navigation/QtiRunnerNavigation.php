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
 * Copyright (c) 2016-2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiTest\models\runner\navigation;

use common_Exception;
use common_exception_InconsistentData;
use common_exception_InvalidArgumentType;
use common_exception_NotImplemented;
use common_Logger;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy as TaoDeliveryServiceProxy;
use oat\taoQtiTest\models\event\QtiMoveEvent;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\data\AssessmentSection;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\event\EventManager;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\Route;

/**
 * Class QtiRunnerNavigation
 * @package oat\taoQtiTest\models\runner\navigation
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
class QtiRunnerNavigation
{
    private static ?TaoDeliveryServiceProxy $deliveryExecutionServiceProxy;

    private static ?common_Logger $logger;

    public static function setDeliveryExecutionServiceProxy(
        ?TaoDeliveryServiceProxy $serviceProxy
    ): void {
        self::$deliveryExecutionServiceProxy = $serviceProxy;
    }

    public static function setLogger(?common_Logger $logger)
    {
        self::$logger = $logger;
    }

    /**
     * Gets a QTI runner navigator.
     *
     * @param string $direction
     * @param string $scope
     * @return RunnerNavigation
     * @throws common_exception_InconsistentData
     * @throws common_exception_NotImplemented
     */
    public static function getNavigator($direction, $scope)
    {
        $className = __NAMESPACE__ . '\QtiRunnerNavigation' . ucfirst($direction) . ucfirst($scope);
        if (class_exists($className)) {
            $navigator = new $className();
            if ($navigator instanceof RunnerNavigation) {
                return $navigator;
            }

            throw new common_exception_InconsistentData('Navigator must be an instance of RunnerNavigation');
        }

        throw new common_exception_NotImplemented('The action is invalid!');
    }

    /**
     * @param string $direction
     * @param string $scope
     * @param RunnerServiceContext $context
     * @param integer $ref
     * @return boolean
     * @throws QtiRunnerPausedException
     * @throws common_Exception
     * @throws common_exception_InvalidArgumentType
     * @throws common_exception_InconsistentData
     * @throws common_exception_NotImplemented
     */
    public static function move($direction, $scope, RunnerServiceContext $context, $ref)
    {
        /* @var ?AssessmentTestSession $session */
        $session = $context->getTestSession();
        $navigator = self::getNavigator($direction, $scope);

        if (self::isSessionSuspended($context) || self::isExecutionPaused($context)) {
            self::getLogger()->logDebug(
                self::class . '::move session is suspended or execution paused'
            );

            throw new QtiRunnerPausedException();
        }

        if ($context instanceof QtiRunnerServiceContext) {
            $from = $session->isRunning() ? $session->getRoute()->current() : null;

            self::getEventManager()->trigger(
                new QtiMoveEvent(QtiMoveEvent::CONTEXT_BEFORE, $session, $from)
            );
        }

        $result = $navigator->move($context, $ref);

        if ($context instanceof QtiRunnerServiceContext) {
            $to = $session->isRunning() ? $session->getRoute()->current() : null;

            self::getEventManager()->trigger(
                new QtiMoveEvent(QtiMoveEvent::CONTEXT_AFTER, $session, $from, $to)
            );
        }

        return $result;
    }

    /**
     * Check if a timed section is exited
     * @param RunnerServiceContext $context
     * @param int $nextPosition
     */
    public static function checkTimedSectionExit(RunnerServiceContext $context, $nextPosition): void
    {
        $timerConfig = $context->getTestConfig()->getConfigValue('timer');

        if (empty($timerConfig['keepUpToTimeout'])) {
            /* @var AssessmentTestSession $session */
            $session = $context->getTestSession();
            $route = $session->getRoute();
            $section = $session->getCurrentAssessmentSection();

            // As we have only one identifier for the whole adaptive section
            // it will consider a jump of section on the first item
            if (
                !self::isAdaptive($context)
                && self::jumpsOutOfSection($route, $section, $nextPosition)
                && self::isTimeLimited($section)
            ) {
                self::endItemSessions($session, $section);
            }
        }
    }

    private static function endItemSessions(
        AssessmentTestSession $session,
        AssessmentSection $section
    ): void {
        foreach ($section->getComponentsByClassName('assessmentItemRef') as $assessmentItemRef) {
            $itemSessions = $session->getAssessmentItemSessions($assessmentItemRef->getIdentifier());

            if ($itemSessions !== false) {
                foreach ($itemSessions as $itemSession) {
                    $itemSession->endItemSession();
                }
            }
        }
    }

    private static function jumpsOutOfSection(
        Route $route,
        AssessmentSection $section,
        $nextPosition
    ): bool {
        if ($nextPosition >= 0 && $nextPosition < $route->count()) {
            $nextSection = $route->getRouteItemAt($nextPosition);
            $nextSectionId = $nextSection->getAssessmentSection()->getIdentifier();

            return $section->getIdentifier() !== $nextSectionId;
        }

        return false;
    }

    private static function isTimeLimited(AssessmentSection $section): bool
    {
        $limits = $section->getTimeLimits();

        return $limits != null && $limits->hasMaxTime();
    }

    private static function isAdaptive(RunnerServiceContext $context): bool
    {
        return $context instanceof QtiRunnerServiceContext && $context->isAdaptive();
    }

    private static function isSessionSuspended(RunnerServiceContext $context): bool
    {
        $session = $context->getTestSession();

        if ($session instanceof AssessmentTestSession) {
            if ($session->getState() === AssessmentTestSessionState::SUSPENDED) {
                self::getLogger()->logDebug(
                    sprintf('%s DeliveryExecution is suspended', self::class)
                );

                return true;
            }
        }

        return false;
    }

    private static function isExecutionPaused(RunnerServiceContext $context): bool
    {
        $executionService = self::getDeliveryExecutionService();

        if ($executionService !== null) {
            $execution = $executionService->getDeliveryExecution(
                $context->getTestExecutionUri()
            );

            if ($execution->getState()->getUri() === DeliveryExecutionInterface::STATE_PAUSED) {
                self::getLogger()->logDebug(
                    sprintf('%s DeliveryExecution is Paused', self::class)
                );

                return true;
            }
        }

        return false;
    }

    private static function getDeliveryExecutionService(): ?TaoDeliveryServiceProxy
    {
        if (isset(self::$deliveryExecutionServiceProxy)) {
            return self::$deliveryExecutionServiceProxy;
        }

        return class_exists(TaoDeliveryServiceProxy::class)
            ? TaoDeliveryServiceProxy::singleton()
            : null;
    }

    private static function getLogger(): common_Logger
    {
        if (!self::$logger instanceof common_Logger) {
            self::$logger = common_Logger::singleton();
        }

        return self::$logger;
    }

    private static function getEventManager(): EventManager
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return ServiceManager::getServiceManager()->get(EventManager::SERVICE_ID);
    }
}

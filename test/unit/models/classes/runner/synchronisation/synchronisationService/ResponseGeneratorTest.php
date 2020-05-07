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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 *
 * @author Oleksandr Zagovorychev <zagovorichev@gmail.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\synchronisationService;

use common_Exception;
use common_exception_InconsistentData;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\ResponseGenerator;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\TestRunnerActionResolver;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;
use ResolverException;

class ResponseGeneratorTest extends TestCase
{
    public function testPrepareActions(): void
    {
        $testRunnerAction1Mock = $this->createMock(TestRunnerAction::class);
        $testRunnerAction1Mock->method('getTimestamp')->willReturn(3);
        $testRunnerAction2Mock = $this->createMock(TestRunnerAction::class);
        $testRunnerAction2Mock->method('getTimestamp')->willReturn(2);

        $testRunnerActionResolverMock = $this->createMock(TestRunnerActionResolver::class);
        $testRunnerActionResolverMock
            ->method('resolve')
            ->willReturnCallback(static function(array $action) use ($testRunnerAction1Mock, $testRunnerAction2Mock) {
                switch ($action[0]) {
                    case 'a';
                        return $testRunnerAction1Mock;
                    case 'b';
                        throw new common_exception_InconsistentData('PHPUnit error InconsistentData');
                    case 'c';
                        return $testRunnerAction2Mock;
                    case 'd';
                        throw new ResolverException('PHPUnit Resolver Exception');
                }

                throw new common_exception_InconsistentData('Incorrect Unit test');
            });

        $serviceLocator = $this->getServiceLocatorMock([
            TestRunnerActionResolver::class => $testRunnerActionResolverMock,
        ]);

        $responseGenerator = new ResponseGenerator();
        $responseGenerator->setServiceLocator($serviceLocator);
        $actions = $responseGenerator->prepareActions([['a'], ['b'], ['c'], ['d']], []);

        $this->assertSame([
            0 => 'b',
            'error' => 'PHPUnit error InconsistentData',
            'success' => false,
        ], $actions[0]);
        $this->assertSame([
            0 => 'd',
            'error' => 'PHPUnit Resolver Exception',
            'success' => false,
        ], $actions[1]);
        $this->assertSame($testRunnerAction2Mock, $actions[2]);
        $this->assertSame($testRunnerAction1Mock, $actions[3]);
    }

    public function testFieldTransformersForExceptions(): void
    {
        $testRunnerAction1Mock = $this->createMock(TestRunnerAction::class);
        $testRunnerAction1Mock->method('getTimestamp')->willReturn(3);
        $testRunnerAction2Mock = $this->createMock(TestRunnerAction::class);
        $testRunnerAction2Mock->method('getTimestamp')->willReturn(2);

        $testRunnerActionResolverMock = $this->createMock(TestRunnerActionResolver::class);
        $testRunnerActionResolverMock->method('resolve')->willThrowException(new ResolverException('msg'));

        $serviceLocator = $this->getServiceLocatorMock([
            TestRunnerActionResolver::class => $testRunnerActionResolverMock,
        ]);

        $responseGenerator = new ResponseGenerator();
        $responseGenerator->setServiceLocator($serviceLocator);
        $actions = $responseGenerator->prepareActions([['a'], ['action' => 'actionName', 'parameters' => ['all parameters']]], []);

        $this->assertSame([
            [
                0 => 'a',
                'error' => 'msg',
                'success' => false,
            ],
            [
                'error' => 'msg',
                'success' => false,
                'requestParameters' => ['all parameters'],
                'name' => 'actionName',
            ]
        ], $actions);
    }

    /**
     * Use provided last timestamp if no need to use durations
     */
    public function testGetLastRegisteredTime(): void
    {
        $serviceLocator = $this->getServiceLocatorMock([]);

        $testTimerMock = $this->createMock(TestTimer::class);
        $testTimerMock->method('getTimer')->willReturnSelf();
        $testTimerMock->method('getLastRegisteredTimestamp')
            ->willReturn(2.0);

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $serviceContext->method('getTestSession')->willReturn($testTimerMock);

        $responseGenerator = new ResponseGenerator();
        $responseGenerator->setServiceLocator($serviceLocator);

        $last = $responseGenerator->getLastActionTimestamp([], $serviceContext, 3.01);
        $this->assertSame(2.0, $last);
    }

    public function testGetLastRegisteredTimeWithActionDuration(): void
    {
        $serviceLocator = $this->getServiceLocatorMock([]);

        $now = $lastRegistered = 20.05;

        $testTimerMock = $this->createMock(TestTimer::class);
        $testTimerMock->method('getTimer')->willReturnSelf();
        $testTimerMock->method('getLastRegisteredTimestamp')
            ->willReturn($lastRegistered);

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $serviceContext->method('getTestSession')->willReturn($testTimerMock);

        $responseGenerator = new ResponseGenerator();
        $responseGenerator->setServiceLocator($serviceLocator);

        $testRunnerAction1 = $this->createMock(TestRunnerAction::class);
        $testRunnerAction1->method('hasRequestParameter')->willReturn(true);
        $testRunnerAction1->method('getRequestParameter')->willReturn(10);

        $testRunnerAction2 = $this->createMock(TestRunnerAction::class);
        $testRunnerAction2->method('hasRequestParameter')->willReturn(true);
        $testRunnerAction2->method('getRequestParameter')->willReturn(5);

        $last = $responseGenerator->getLastActionTimestamp([
            $testRunnerAction1,
            $testRunnerAction2,
            []
        ], $serviceContext, $now);
        $this->assertSame($now - (10 + 5 + 0.002), $last);
    }

    public function testGetActionResponseEmptyAction(): void
    {
        $responseGenerator = new ResponseGenerator();

        $action = $this->createMock(TestRunnerAction::class);
        $action->method('getRequestParameter')->willReturn(false);
        $action->method('hasRequestParameter')->willReturn(false);
        $action->method('process')->willReturn(['returned response']);
        $self = $this;
        $action->method('setTime')->willReturnCallback(static function ($t) use ($self) {
            $self->assertSame(1.0, $t); // 1 (now)
        });

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);

        $response = $responseGenerator->getActionResponse($action, 1, 2, $serviceContext);
        $this->assertSame([
            0 => 'returned response',
            'name' => null,
            'timestamp' => null,
            'requestParameters' => null,
        ], $response);
    }

    public function testGetActionResponseHasDuration(): void
    {
        $responseGenerator = new ResponseGenerator();

        $action = $this->createMock(TestRunnerAction::class);
        $action->method('getRequestParameter')->willReturn(1);
        $action->method('hasRequestParameter')->willReturn(true);
        $action->method('process')->willReturn(['returned response']);
        $action->method('getName')->willReturn('name');
        $action->method('getTimeStamp')->willReturn(10);
        $action->method('getRequestParameters')->willReturn(['params']);
        $self = $this;
        $action->method('setTime')->willReturnCallback(static function ($t) use ($self) {
            $self->assertSame(3.001, $t); // 2 (last) + 1 (requestParam) + .001 (const)
        });

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $serviceContext->method('isSyncingMode')->willReturn(true);

        $response = $responseGenerator->getActionResponse($action, 1, 2, $serviceContext);
        $this->assertSame([
            0 => 'returned response',
            'name' => 'name',
            'timestamp' => 10,
            'requestParameters' => ['params'],
        ], $response);
    }

    public function testGetActionResponseException(): void
    {
        $responseGenerator = new ResponseGenerator();

        $action = $this->createMock(TestRunnerAction::class);
        $action->method('getRequestParameter')->willReturn(false);
        $action->method('getName')->willReturn('name');
        $action->method('getTimeStamp')->willReturn(10);
        $action->method('getRequestParameters')->willReturn(['params']);

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $serviceContext->method('setSyncingMode')->willThrowException(new common_Exception('PHPUnit exception'));
        $response = $responseGenerator->getActionResponse($action, 1, 2, $serviceContext);
        $this->assertSame([
            'error' => 'PHPUnit exception',
            'success' => false,
            'name' => 'name',
            'timestamp' => 10,
            'requestParameters' => ['params'],
        ], $response);
    }
}

class TestTimer {
    public function getTimer(): self
    {
        return $this;
    }

    public function getLastRegisteredTimestamp(): float
    {
        return 0;
    }
}


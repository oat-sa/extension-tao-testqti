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

use common_exception_InconsistentData;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\TestRunnerActionResolver;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;
use ReflectionClass;
use ReflectionException;
use ReflectionMethod;
use ResolverException;
use TypeError;

class TestRunnerActionResolverTest extends TestCase
{

    /**
     * @return array
     */
    public function checkClassExceptions(): array
    {
        return [
            [
                'class' => '',
                'name' => '',
                'exception' => ResolverException::class,
                'message' => 'Action name "" could not be resolved.',
            ],
            [
                'class' => null,
                'name' => null,
                'exception' => TypeError::class,
                'message' => 'Argument 1 passed to oat\taoQtiTest\models\runner\synchronisation\synchronisationService\TestRunnerActionResolver::checkClass() must be of the type string, null given',
            ],
            [
                'class' => 'a',
                'name' => null,
                'exception' => TypeError::class,
                'message' => 'Argument 2 passed to oat\taoQtiTest\models\runner\synchronisation\synchronisationService\TestRunnerActionResolver::checkClass() must be of the type string, null given',
            ],
            [
                'class' => 'a',
                'name' => 'b',
                'exception' => ResolverException::class,
                'message' => 'Action name "b" could not be resolved.',
            ],
        ];
    }

    /**
     * @dataProvider checkClassExceptions
     * @param $actionClass
     * @param $actionName
     * @param string $exception
     * @param string $message
     * @throws ReflectionException
     */
    public function testCheckClassException($actionClass, $actionName, string $exception, string $message): void
    {
        $this->expectException($exception);
        $this->expectExceptionMessage($message);

        $checkClassMethod = self::getProtectedMethod('checkClass');
        $resolver = new TestRunnerActionResolver();
        $checkClassMethod->invokeArgs($resolver, [$actionClass, $actionName]);
    }

    /**
     * @throws ReflectionException
     */
    public function testCheckClass(): void
    {
        $checkClassMethod = self::getProtectedMethod('checkClass');
        $resolver = new TestRunnerActionResolver();
        $checkClassMethod->invokeArgs($resolver, [TestRunnerAction::class, 'phpUnitTest']);
        $this->assertTrue(true, 'no exceptions');
    }

    /**
     * @return array
     */
    public function checkDataExceptions(): array
    {
        return [
            [
                'data' => '',
                'exception' => common_exception_InconsistentData::class,
                'message' => 'Action parameters have to contain "action", "timestamp" and "parameters" fields.',
            ],
            [
                'data' => [],
                'exception' => common_exception_InconsistentData::class,
                'message' => 'Action parameters have to contain "action", "timestamp" and "parameters" fields.',
            ],
            [
                'data' => [
                    'action' => '',
                    'timestamp' => '',
                    'parameters' => '',
                ],
                'exception' => common_exception_InconsistentData::class,
                'message' => 'Action parameters have to contain "parameters" field as an array.',
            ]
        ];
    }

    /**
     * @dataProvider checkDataExceptions
     * @param $data
     * @param string $exception
     * @param string $message
     * @throws ReflectionException
     */
    public function testCheckDataExceptions($data, string $exception, string $message): void
    {
        $this->expectException($exception);
        $this->expectExceptionMessage($message);

        $checkClassMethod = self::getProtectedMethod('checkData');
        $resolver = new TestRunnerActionResolver();
        $checkClassMethod->invokeArgs($resolver, [$data]);
        $this->assertTrue(true, 'no exceptions');
    }

    /**
     * @throws ReflectionException
     */
    public function testCheckData(): void
    {
        $checkClassMethod = self::getProtectedMethod('checkData');
        $resolver = new TestRunnerActionResolver();
        $checkClassMethod->invokeArgs($resolver, [[
            'action' => '',
            'timestamp' => '',
            'parameters' => [],
        ]]);
        $this->assertTrue(true, 'no exceptions');
    }

    /**
     * @throws ResolverException
     * @throws common_exception_InconsistentData
     */
    public function testResolve(): void
    {
        $mock = $this->createMock(TestRunnerAction::class);
        $mock->method('setServiceLocator')->willReturn(true);

        $serviceLocatorMock = $this->getServiceLocatorMock();

        $resolver = new TestRunnerActionResolver();
        $resolver->setServiceLocator($serviceLocatorMock);

        $action = $resolver->resolve([
            'action' => 'phpUnitAction',
            'timestamp' => '',
            'parameters' => ['a', 'b', 'c'],
        ], [
            'phpUnitAction' => get_class($mock),
        ]);
        
        $this->assertTrue(true, 'resolved and returned TestRunnerAction');
    }

    /**
     * @param $name
     * @return ReflectionMethod
     * @throws ReflectionException
     */
    protected static function getProtectedMethod($name): ReflectionMethod
    {
        $class = new ReflectionClass(TestRunnerActionResolver::class);
        $method = $class->getMethod($name);
        $method->setAccessible(true);
        return $method;
    }
}

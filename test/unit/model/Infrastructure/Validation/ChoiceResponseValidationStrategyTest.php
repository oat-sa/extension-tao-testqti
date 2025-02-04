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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Infrastructure\Validation;

use oat\taoQtiTest\model\Infrastructure\Validation\ChoiceResponseValidationStrategy;
use oat\taoQtiTest\models\classes\runner\QtiRunnerInvalidResponsesException;
use PHPUnit\Framework\TestCase;
use qtism\common\datatypes\QtiIdentifier;
use qtism\runtime\common\MultipleContainer;
use qtism\runtime\common\ResponseVariable;
use qtism\runtime\common\State;
use Throwable;

class ChoiceResponseValidationStrategyTest extends TestCase
{
    private ChoiceResponseValidationStrategy $subject;

    public function setUp(): void
    {
        $this->definedChoiceId1 = new QtiIdentifier('choice_1');
        $this->definedChoiceId2 = new QtiIdentifier('choice_2');
        $this->definedResponse1 = new ResponseVariable(
            'RESPONSE_1',
            1,
            0,
            new MultipleContainer(0, [$this->definedChoiceId1, $this->definedChoiceId2])
        );

        $this->state = new State();
        $this->state->setVariable($this->definedResponse1);

        $this->itemDefinition = [
            'data' => [
                'body' => [
                    'elements' => [
                        'interaction1' => [
                            'qtiClass' => 'test',
                        ],
                        'interaction2' => [
                            'qtiClass' => 'choiceInteraction',
                            'attributes' => ['responseIdentifier' => $this->definedResponse1->getIdentifier()],
                            'choices' => [
                                'choice_1' => ["identifier" => (string) $this->definedChoiceId1->getValue()],
                                'choice_2' => ["identifier" => (string) $this->definedChoiceId2->getValue()],
                            ]
                        ],
                    ]
                ]
            ],
        ];

        $this->subject = new ChoiceResponseValidationStrategy();
    }

    public function testIsApplicable(): void
    {
        $this->assertTrue($this->subject->isApplicable($this->itemDefinition));

        unset($this->itemDefinition['data']['body']['elements']['interaction2']);
        $this->assertFalse($this->subject->isApplicable($this->itemDefinition));
    }

    public function testValidate(): void
    {
        try {
            $this->subject->validate($this->itemDefinition, $this->state);
        } catch (Throwable) {
            $this->fail();
        }

        $this->expectException(QtiRunnerInvalidResponsesException::class);
        $this->expectExceptionMessage('Invalid choice identifiers: [fakeChoiceIdByUser]');
        $this->definedChoiceId2->setValue('fakeChoiceIdByUser');
        $this->subject->validate($this->itemDefinition, $this->state);
    }
}

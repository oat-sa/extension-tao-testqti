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

use oat\taoQtiTest\model\Infrastructure\Validation\ExtraQtiInteractionResponseValidator;
use oat\taoQtiTest\model\Infrastructure\Validation\InteractionResponseValidationStrategy;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use qtism\runtime\common\State;

class ExtraQtiInteractionResponseValidatorTest extends TestCase
{
    private ExtraQtiInteractionResponseValidator $subject;
    private InteractionResponseValidationStrategy|MockObject $interactionResponseValidationStrategy;
    private InteractionResponseValidationStrategy|MockObject $interactionResponseValidationStrategy2;

    public function setUp(): void
    {
        $this->interactionResponseValidationStrategy = $this->createMock(InteractionResponseValidationStrategy::class);
        $this->interactionResponseValidationStrategy2 = $this->createMock(InteractionResponseValidationStrategy::class);

        $this->subject = new ExtraQtiInteractionResponseValidator(
            $this->interactionResponseValidationStrategy,
            $this->interactionResponseValidationStrategy2
        );
    }

    public function testValidateCallsApplicableStrategy(): void
    {
        $this->interactionResponseValidationStrategy->expects($this->once())
            ->method('isApplicable')
            ->willReturn(false);
        $this->interactionResponseValidationStrategy2->expects($this->once())
            ->method('isApplicable')
            ->willReturn(true);

        $this->interactionResponseValidationStrategy->expects($this->never())
            ->method('validate');
        $this->interactionResponseValidationStrategy2->expects($this->once())
            ->method('validate');

        $this->subject->validate([], new State());
    }
}

<?php

/*
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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Infrastructure\Validation;

use oat\taoQtiTest\models\classes\runner\QtiRunnerInvalidResponsesException;
use qtism\runtime\common\State;

class ChoiceResponseValidationStrategy implements InteractionResponseValidationStrategy
{
    private const QTI_CLASS = 'choiceInteraction';

    public function isApplicable(array $itemData): bool
    {
        if (!isset($itemData['data']['body']['elements']) || !is_array($itemData['data']['body']['elements'])) {
            return false;
        }

        foreach ($itemData['data']['body']['elements'] as $element) {
            if ($element['qtiClass'] === self::QTI_CLASS) {
                return true;
            }
        }

        return false;
    }

    public function validate(array $itemData, State $responses): void
    {
        foreach ($itemData['data']['body']['elements'] as $element) {
            if ($element['qtiClass'] !== self::QTI_CLASS || !isset($element['choices'])) {
                continue;
            }

            $userChoiceIds = $this->getQtiIdentifiersForChoicesByResponseDeclarationId(
                $responses,
                $element['attributes']['responseIdentifier']
            );
            $validChoiceIds = [];
            foreach ($element['choices'] as $choice) {
                $validChoiceIds[] = $choice['identifier'];
            }

            $diff = array_diff($userChoiceIds, $validChoiceIds);
            if ($diff !== []) {
                throw new QtiRunnerInvalidResponsesException(sprintf(
                    'Invalid choice identifiers: [%s]',
                    implode(',', $diff)
                ));
            }
        }
    }

    private function getQtiIdentifiersForChoicesByResponseDeclarationId(State $responses, string $key): array
    {
        $result = [];
        foreach ($responses->getVariable($key)->getValue() as $response) {
            $result[] = (string) $response->getValue();
        }

        return $result;
    }
}

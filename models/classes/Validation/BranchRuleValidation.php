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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\Validation;

use qtism\data\storage\xml\XmlDocument;

class BranchRuleValidation
{
    private const ERROR_MISSING_TARGET = 'BranchRule element is missing target attribute';

    /**
     * Validate that all branchRule elements in the given XmlDocument have a target attribute
     * @throws BranchRuleException
     */
    public function validate(XmlDocument $doc): void
    {
        $errors = []; // Initialize errors array

        //Find in doc all branchRule elements
        $branchRules = $doc->getDocumentComponent()->getComponentsByClassName('branchRule');
        foreach ($branchRules as $branchRule) {
            // Get target attribute
            $target = $branchRule->getTarget();
            if (empty($target)) {
                $errors[] = self::ERROR_MISSING_TARGET;
            } else {
                $targetElement = $doc->getDocumentComponent()->getComponentByIdentifier($target);
                if ($targetElement === null) {
                    $errors[] = sprintf('BranchRule target "%s" does not exist in the document', $target);
                }
            }
        }

        if (!empty($errors)) {
            throw new BranchRuleException(implode('; ', $errors));
        }
    }
}

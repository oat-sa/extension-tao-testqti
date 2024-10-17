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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\UniqueId\Form\Modifier;

use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\form\Modifier\AbstractFormModifier;
use oat\tao\model\TaoOntology;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierRetriever;
use tao_helpers_form_Form;
use tao_helpers_Uri;

class UniqueIdFormModifier extends AbstractFormModifier
{
    private Ontology $ontology;
    private QtiIdentifierRetriever $qtiIdentifierRetriever;
    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(
        Ontology $ontology,
        QtiIdentifierRetriever $qtiIdentifierRetriever,
        FeatureFlagCheckerInterface $featureFlagChecker
    ) {
        $this->ontology = $ontology;
        $this->featureFlagChecker = $featureFlagChecker;
        $this->qtiIdentifierRetriever = $qtiIdentifierRetriever;
    }

    public function modify(tao_helpers_form_Form $form, array $options = []): void
    {
        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            return;
        }

        $encodedProperty = tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER);
        $uniqueIdValue = $form->getValue($encodedProperty);

        if (!empty($uniqueIdValue)) {
            return;
        }

        $instance = $this->ontology->getResource($form->getValue('uri'));
        $identifier = $this->qtiIdentifierRetriever->retrieve($instance);

        if ($identifier) {
            $form->setValue($encodedProperty, $identifier);
        }
    }
}

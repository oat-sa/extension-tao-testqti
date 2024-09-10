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

namespace oat\taoQtiTest\models\Form\Modifier;

use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\form\Modifier\AbstractFormModifier;
use oat\tao\model\TaoOntology;
use tao_helpers_form_Form as Form;
use tao_helpers_Uri;
use taoQtiTest_models_classes_QtiTestService;

class TranslationInstanceFormModifier extends AbstractFormModifier
{
    public const ID = 'tao_qti_test.form_modifier.translation_instance';

    private taoQtiTest_models_classes_QtiTestService $testQtiService;
    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(
        Ontology $ontology,
        taoQtiTest_models_classes_QtiTestService $testQtiService,
        FeatureFlagCheckerInterface $featureFlagChecker
    ) {
        parent::__construct($ontology);

        $this->testQtiService = $testQtiService;
        $this->featureFlagChecker = $featureFlagChecker;
    }

    public function supports(Form $form, array $options = []): bool
    {
        if (!$this->featureFlagChecker->isEnabled(FeatureFlagCheckerInterface::FEATURE_TRANSLATION_ENABLED)) {
            return false;
        }

        $instance = $this->getInstance($form, $options);

        return $instance !== null && $instance->isInstanceOf($this->ontology->getClass(TaoOntology::CLASS_URI_TEST));
    }

    public function modify(Form $form, array $options = []): void
    {
        $uniqueIdElement = $form->getElement(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER));

        if (!$uniqueIdElement) {
            return;
        }

        $instance = $this->ontology->getResource($form->getValue(self::FORM_INSTANCE_URI));
        $jsonTest = $this->testQtiService->getJsonTest($instance);
        $id = json_decode($jsonTest, true)['identifier'] ?? null;

        if ($id) {
            $uniqueIdElement->setValue($id);
        }
    }
}

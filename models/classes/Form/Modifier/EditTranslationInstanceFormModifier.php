<?php

namespace oat\taoQtiTest\models\Form\Modifier;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\form\Modifier\FormModifierInterface;
use oat\tao\model\TaoOntology;
use tao_helpers_form_Form as Form;
use tao_helpers_Uri;
use taoQtiTest_models_classes_QtiTestService;

class EditTranslationInstanceFormModifier implements FormModifierInterface
{
    public const ID = 'tao_qti_test.form_modifier.edit_translation_instance';

    private Ontology $ontology;
    private taoQtiTest_models_classes_QtiTestService $testQtiService;

    public function __construct(Ontology $ontology, taoQtiTest_models_classes_QtiTestService $testQtiService)
    {
        $this->ontology = $ontology;
        $this->testQtiService = $testQtiService;
    }

    public function supports(Form $form, array $options = []): bool
    {
        $instanceUri = $form->getValue(self::FORM_INSTANCE_URI);

        if (!$instanceUri) {
            return false;
        }

        $instance = $this->ontology->getResource($instanceUri);

        // @TODO Check if FF for translation enabled
        return $instance->isInstanceOf($this->ontology->getClass(TaoOntology::CLASS_URI_TEST));
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

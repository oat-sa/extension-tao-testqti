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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *
 */

use oat\taoTests\models\MissingTestmodelException;

/**
 * Export form for QTI packages
 *
 * @access  public
 * @author  Joel Bout, <joel.bout@tudor.lu>
 * @package taoItems
 */
abstract class taoQtiTest_models_classes_export_ExportForm extends tao_helpers_form_FormContainer
{
    // --- ASSOCIATIONS ---

    // --- ATTRIBUTES ---

    // --- OPERATIONS ---

    /** @var core_kernel_classes_Resource */
    private $testModel;

    /**
     * @access public
     * @return mixed
     * @throws common_Exception
     * @author Joel Bout, <joel.bout@tudor.lu>
     */
    public function initForm()
    {
        $this->form = new tao_helpers_form_xhtml_Form('export');

        $this->form->setDecorators(
            [
                'element' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div']),
                'group' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-group']),
                'error' => new tao_helpers_form_xhtml_TagWrapper(
                    ['tag' => 'div', 'cssClass' => 'form-error ui-state-error ui-corner-all']
                ),
                'actions-bottom' => new tao_helpers_form_xhtml_TagWrapper(
                    ['tag' => 'div', 'cssClass' => 'form-toolbar']
                ),
                'actions-top' => new tao_helpers_form_xhtml_TagWrapper(
                    ['tag' => 'div', 'cssClass' => 'form-toolbar']
                )
            ]
        );

        $exportElt = tao_helpers_form_FormFactory::getElement('export', 'Free');
        $exportElt->setValue(
            '<a href="#" class="form-submitter btn-success small"><span class="icon-export"></span> ' . __(
                'Export'
            ) . '</a>'
        );

        $this->form->setActions([$exportElt], 'bottom');
    }

    /**
     * overriden
     *
     * @access public
     * @return mixed
     *
     * @throws common_Exception
     * @throws MissingTestmodelException
     *
     * @author Joel Bout, <joel.bout@tudor.lu>
     */
    public function initElements()
    {
        $testService = $this->getTestService();
        $testModel = $this->getTestModel();

        $fileName = '';
        $options = [];
        if (isset($this->data['items'])) {
            $fileName = $this->getFileName($this->data['file_name']);
            $options = $this->getInstanceOptions(...array_values($this->data['items']));
        } elseif (isset($this->data['instance'])) {
            $test = $this->data['instance'];
            if (
                $test instanceof core_kernel_classes_Resource
                && $testModel->equals($testService->getTestModel($test))
            ) {
                $fileName = $this->getFileName($test->getLabel());
                $options = $this->getInstanceOptions($test);
            }
        } else {
            $class = $this->data['class'] ?? $testService->getRootClass();

            if ($class instanceof core_kernel_classes_Class) {
                $fileName = $this->getFileName($class->getLabel());
                $options = $this->getInstanceOptions(...$class->getInstances());
            }
        }

        $nameElt = tao_helpers_form_FormFactory::getElement('filename', 'Textbox');
        $nameElt->setDescription(__('File name'));
        $nameElt->setValue($fileName);
        $nameElt->setUnit('.zip');
        $nameElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
        $this->form->addElement($nameElt);

        $instanceElt = tao_helpers_form_FormFactory::getElement('instances', 'Checkbox');
        $instanceElt->setDescription(__('Test'));
        $instanceElt->setOptions(tao_helpers_Uri::encodeArray($options, tao_helpers_Uri::ENCODE_ARRAY_KEYS));
        foreach (array_keys($options) as $value) {
            $instanceElt->setValue($value);
        }
        $this->form->addElement($instanceElt);

        $this->form->createGroup('options', '<h3>' . $this->getFormGroupName() . '</h3>', ['filename', 'instances']);
    }

    protected function getInstanceOptions(core_kernel_classes_Resource ...$resources): array
    {
        $testService = $this->getTestService();
        $testModel = $this->getTestModel();

        $options = [];

        foreach ($resources as $resource) {
            if ($testModel->equals($testService->getTestModel($resource))) {
                $options[$resource->getUri()] = $resource->getLabel();
            }
        }

        return $options;
    }

    private function getTestService(): taoTests_models_classes_TestsService
    {
        return taoTests_models_classes_TestsService::singleton();
    }

    private function getTestModel(): core_kernel_classes_Resource
    {
        if ($this->testModel === null) {
            $this->testModel = new core_kernel_classes_Resource(
                taoQtiTest_models_classes_QtiTestService::INSTANCE_TEST_MODEL_QTI
            );
        }

        return $this->testModel;
    }

    protected function getFileName(string $name): string
    {
        return strtolower(tao_helpers_Display::textCleaner($name, '*'));
    }

    /**
     * Get the form group name to be display
     * @return string
     */
    abstract protected function getFormGroupName();
}

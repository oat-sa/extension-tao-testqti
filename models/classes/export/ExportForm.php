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
 * Copyright (c)
 * 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 * 2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 * 2012-2022 (further updates) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\Export;

use common_Exception;
use core_kernel_classes_Class;
use core_kernel_classes_Resource as Resource;
use Exception;
use Laminas\ServiceManager\ServiceLocatorAwareTrait;
use oat\taoTests\models\MissingTestmodelException;
use tao_helpers_Display as Display;
use tao_helpers_form_FormContainer as FormContainer;
use tao_helpers_form_FormFactory as FormFactory;
use tao_helpers_form_xhtml_Form as Form;
use tao_helpers_form_xhtml_TagWrapper as TagWrapper;
use tao_helpers_Uri as Uri;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;
use taoTests_models_classes_TestsService as TestsService;

class ExportForm extends FormContainer
{
    use ServiceLocatorAwareTrait;

    private static string $title;

    private Resource $testModel;

    public function __construct(array $data = [], array $options = [], string $title = '')
    {
        static::$title = $title;

        parent::__construct($data, $options);
    }

    /**
     * @access public
     * @return void
     * @throws common_Exception
     * @throws Exception
     * @author Joel Bout, <joel.bout@tudor.lu>
     */
    public function initForm()
    {
        $this->form = new Form('export');

        $this->form->setDecorators(
            [
                'element'           => new TagWrapper(['tag' => 'div']),
                'group'             => new TagWrapper(['tag' => 'div', 'cssClass' => 'form-group']),
                'error'             => new TagWrapper(['tag' => 'div', 'cssClass' => 'form-error ui-state-error ui-corner-all']),
                'actions-bottom'    => new TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar']),
                'actions-top'       => new TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar'])
            ]
        );

        $exportElement = FormFactory::getElement('export', 'Free');
        $exportElement->setValue(
            sprintf('<a href="#" class="form-submitter btn-success small"><span class="icon-export"></span>%s</a>', __('Export'))
        );

        $this->form->setActions([$exportElement]);
    }

    /**
     * @throws common_Exception
     * @throws MissingTestmodelException
     *
     * @author Joel Bout, <joel.bout@tudor.lu>
     */
    public function initElements(): void
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
                $test instanceof Resource
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

        $fileNameElement = FormFactory::getElement('filename', 'Textbox');
        $fileNameElement->setDescription(__('File name'));
        $fileNameElement->setValue($fileName);
        $fileNameElement->setUnit('.zip');
        $fileNameElement->addValidator(FormFactory::getValidator('NotEmpty'));

        $this->form->addElement($fileNameElement);

        $instancesElement = FormFactory::getElement('instances', 'Checkbox');
        $instancesElement->setDescription(__('Test'));
        $instancesElement->setOptions(Uri::encodeArray($options, Uri::ENCODE_ARRAY_KEYS));
        foreach (array_keys($options) as $value) {
            $instancesElement->setValue($value);
        }

        $this->form->addElement($instancesElement);

        $this->form->createGroup(
            'options',
            sprintf('<h3>%s</h3>', static::$title),
            ['filename', 'instances']
        );
    }

    /** @throws MissingTestmodelException */
    protected function getInstanceOptions(Resource ...$resources): array
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

    protected function getFileName(string $name): string
    {
        return strtolower(Display::textCleaner($name, '*'));
    }

    /** @noinspection PhpIncompatibleReturnTypeInspection */
    private function getTestService(): TestsService
    {
        return TestsService::singleton();
    }

    private function setTestModel(Resource $model): Resource
    {
        $this->testModel = $model;

        return $this->testModel;
    }

    private function getTestModel(): Resource
    {
        return $this->testModel ?? $this->setTestModel(new Resource(QtiTestService::INSTANCE_TEST_MODEL_QTI));
    }
}

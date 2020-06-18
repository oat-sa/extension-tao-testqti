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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\forms;

use core_kernel_classes_Resource;
use tao_helpers_form_FormContainer;
use tao_helpers_form_FormFactory;
use tao_helpers_form_xhtml_Form;
use tao_helpers_form_xhtml_TagWrapper;

class XmlEditForm extends tao_helpers_form_FormContainer
{
    public function __construct(core_kernel_classes_Resource $test, string $xmlString, array $options = [])
    {
        parent::__construct(
            [
                'id' => $test->getUri(),
                'xmlString' => $xmlString
            ],
            $options
        );
    }

    /**
     * {@inheritdoc}
     */
    protected function initForm() : void
    {
        $this->form = new tao_helpers_form_xhtml_Form('test_xml_editor_form');

        $this->form->setDecorators([
            'element' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div']),
            'error'   => new tao_helpers_form_xhtml_TagWrapper([
                'tag' => 'div',
                'cssClass' => 'form-error'
            ])
        ]);

        $action = tao_helpers_form_FormFactory::getElement('save', 'Free');
        $action->setValue('<a href="#" class="form-submitter btn-success small"><span class="icon-save"></span> ' . __('Save') . '</a>');

        $this->form->setActions([$action], 'bottom');
    }

    /**
     * {@inheritdoc}
     */
    protected function initElements() : void
    {
        $element = tao_helpers_form_FormFactory::getElement('xmlString', 'textarea');
        $element->addAttribute('rows', '20');
        $element->setDescription('XML');
        $element->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
        $this->getForm()->addElement($element);

        $element = tao_helpers_form_FormFactory::getElement('id', 'Hidden');
        $this->getForm()->addElement($element);
    }
}

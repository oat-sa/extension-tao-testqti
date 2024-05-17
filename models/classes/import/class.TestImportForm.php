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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung
 *                         (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor
 *                         (under the project TAO-SUSTAIN & TAO-DEV);
 */

/**
 * Import form for QTI packages
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI

 */
class taoQtiTest_models_classes_import_TestImportForm extends tao_helpers_form_FormContainer
{
    public const METADATA_FORM_ELEMENT_NAME = 'metadata';

    /**
     * (non-PHPdoc)
     * @see tao_helpers_form_FormContainer::initForm()
     */
    public function initForm()
    {
        $this->form = new tao_helpers_form_xhtml_Form('export');

        $this->form->setDecorators([
            'element' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div']),
            'group' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-group']),
            'error' => new tao_helpers_form_xhtml_TagWrapper([
                'tag' => 'div',
                'cssClass' => 'form-error ui-state-error ui-corner-all',
            ]),
            'actions-bottom' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar']),
            'actions-top' => new tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar'])
        ]);

        $submitElt = tao_helpers_form_FormFactory::getElement('import', 'Free');
        $submitElt->setValue(
            '<a href="#" class="form-submitter btn-success small"><span class="icon-import"></span> '
                . __('Import') . '</a>'
        );


        $this->form->setActions([$submitElt], 'bottom');
    }

    /**
     * (non-PHPdoc)
     * @see tao_helpers_form_FormContainer::initElements()
     */
    public function initElements()
    {
        //create file upload form box
        $fileElt = tao_helpers_form_FormFactory::getElement('source', 'AsyncFile');
        $fileElt->setDescription(__("Add a zip file containing QTI/APIP tests and items"));
        if (isset($_POST['import_sent_qti'])) {
            $fileElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
        } else {
            $fileElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty', ['message' => '']));
        }
        $fileElt->addValidators([
            tao_helpers_form_FormFactory::getValidator(
                'FileMimeType',
                [
                    'mimetype' => [
                        'application/zip',
                        'application/x-zip',
                        'application/x-zip-compressed',
                        'application/octet-stream',
                    ],
                    'extension' => ['zip'],
                ]
            ),
            tao_helpers_form_FormFactory::getValidator(
                'FileSize',
                ['max' => \oat\generis\Helper\SystemHelper::getFileUploadLimit()]
            )
        ]);


        $this->form->addElement($fileElt);

        $this->form->createGroup(
            'file',
            __('Import a QTI/APIP Content Package'),
            [
                'source',
            ]
        );

        $this->addMetadataImportElement();
        $qtiSentElt = tao_helpers_form_FormFactory::getElement('import_sent_qti', 'Hidden');
        $qtiSentElt->setValue(1);
        $this->form->addElement($qtiSentElt);
    }

    private function isMetadataDisabled(): bool
    {
        return isset($this->options[taoQtiTest_models_classes_import_TestImport::DISABLED_FIELDS]) &&
        in_array(
            taoQtiTest_models_classes_import_TestImport::METADATA_FIELD,
            $this->options[taoQtiTest_models_classes_import_TestImport::DISABLED_FIELDS]
        );
    }

    private function addMetadataImportElement()
    {
        if (!$this->isMetadataDisabled()) {
            $metadataImport = tao_helpers_form_FormFactory::getElement(self::METADATA_FORM_ELEMENT_NAME, 'Checkbox');
            $metadataImport->setOptions([self::METADATA_FORM_ELEMENT_NAME => __('QTI metadata as properties')]);
            $metadataImport->setDescription(__('Import'));
            $metadataImport->setLevel(1);
            $this->form->addElement($metadataImport);
            $this->form->addToGroup('file', self::METADATA_FORM_ELEMENT_NAME);
        }
    }
}

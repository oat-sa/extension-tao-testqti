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

use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiTest\models\classes\forms\XmlEditForm;
use oat\taoQtiTest\models\xmlEditor\XmlEditorInterface;
use tao_helpers_form_FormContainer as FormContainer;

class taoQtiTest_actions_XmlEditor extends tao_actions_ServiceModule
{
    use OntologyAwareTrait;

   public function edit() : void
   {
       if (!$this->hasPostParameter('id')) {
            $this->returnError(__('Missed required parameter \'id\''));
            return;
       }
       $test = $this->getResource($this->getPostParameter('id'));
       $title = __('XML Content');

       if ($this->getXmlEditorService()->isLocked()) {
           $title = __('This functionality is blocked. Please contact with your administrator for more details.');
       } else {
           try {
               $xmlString = $this->getXmlEditorService()->getTestXml($test);

               $formContainer = new XmlEditForm(
                   $test,
                   $xmlString,
                   [FormContainer::CSRF_PROTECTION_OPTION => true]
               );
               $form = $formContainer->getForm();
               if ($form->isSubmited() && $form->isValid()) {
                   $this->getXmlEditorService()->saveStringTest($test, $form->getValues()['xmlString']);
                   $this->setData('message', __('Saved'));
               }
               $this->setData('form', $form->render());

           } catch (Exception $e) {
               $title = __('Something went wrong...');
               common_Logger::e($e->getMessage());
           }
       }
       $this->setData('formTitle', $title);
       $this->setView('XmlEditor/xml_editor.tpl');
   }

    /**
     * @return XmlEditorInterface
     */
   private function getXmlEditorService() : XmlEditorInterface
   {
       return $this->getServiceLocator()->get(XmlEditorInterface::SERVICE_ID);
   }
}

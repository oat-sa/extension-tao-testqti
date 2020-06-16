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
use oat\taoQtiTest\models\xmlEditor\XmlEditorInterface;

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

       if ($this->getXmlEditorService()->isLocked()) {
           $this->setData('lockMessage', __('This functionality is blocked. Please contact with your administrator for more details.'));
           $this->setData('isLocked', true);
       } else {
           try {
               $xmlString = $this->getXmlEditorService()->getTestXml($test);
           } catch (\Exception $e) {
               $xmlString = $e->getMessage();
           }
           $this->setData('xmlBody', $xmlString);
       }
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

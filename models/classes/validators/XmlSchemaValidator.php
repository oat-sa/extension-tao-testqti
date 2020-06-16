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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\validators;

use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use tao_helpers_form_Validator;

class XmlSchemaValidator extends tao_helpers_form_Validator
{

    /**
     * @param string $value
     * @return bool
     */
    public function evaluate($value)
    {
        $doc = new XmlDocument();
        try {
            $doc->loadFromString($value, true);
        } catch (XmlStorageException $e) {
            $errors = $e->getErrors();
            $message = '';
            /** @var \LibXMLError $error */
            foreach ($errors->getArrayCopy() as $error){
                $message .= $error->message;
            }
            $this->setMessage($message);
            return false;
        }
        return true;

    }

    /**
     * Default error message
     *
     * @return string
     */
    protected function getDefaultMessage()
    {
        return __('XML is not valid');
    }

}

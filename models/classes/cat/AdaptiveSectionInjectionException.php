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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\cat;

/**
 * This Exception class must be thrown in reaction to an error occuring
 * during a adaptive section injection process.
 *
 * @author Aleksej Tikhanovich <aleksej@taotesting.com>
 *
 */
class AdaptiveSectionInjectionException extends CatException
{

    private $invalidItemIdentifiers;

    /**
     * Create a new AdaptiveSectionInjectionException object.
     *
     * @param string $message A human readable message explaining the error.
     * @param array $invalidItemIdentifiers An array of string containing the invalid items identifiers.
     * @param int $code (optional) A machine understandable error code. This should be used by very specific implementations only.
     * @param \Exception $previous A previous caught exception that led to this one.
     */
    public function __construct($message, array $invalidItemIdentifiers, $code = 0, \Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->setInvalidItemIdentifiers($invalidItemIdentifiers);
    }
    
    public function getInvalidItemIdentifiers()
    {
        return $this->invalidItemIdentifiers;
    }
    
    private function setInvalidItemIdentifiers(array $invalidItemIdentifiers)
    {
        $this->invalidItemIdentifiers = $invalidItemIdentifiers;
    }
}

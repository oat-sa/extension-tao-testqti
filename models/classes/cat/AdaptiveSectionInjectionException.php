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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\cat;

use \Exception;

/**
 * This Exception class must be thrown in reaction to an error occuring
 * during a adaptive section injection process.
 *
 * @author Aleksej Tikhanovich <jerome@taotesting.com>
 *
 */
class AdaptiveSectionInjectionException extends Exception
{

    /**
     * Create a new AdaptiveSectionInjectionException object.
     *
     * @param string $message A human readable message explaining the error.
     * @param integer $code (optional) A machine understandable error code. This should be used by very specific implementations only.
     * @param Exception $previous A previous caught exception that led to this one.
     */
    public function __construct($message, $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner;

/**
 * Class QtiRunnerItemResponseException
 * @package oat\taoQtiTest\models\runner
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class QtiRunnerItemResponseException extends \common_Exception implements \common_exception_UserReadableException
{

    /**
     * QtiRunnerItemResponseException constructor.
     * @param string $message
     * @param int $code
     */
    public function __construct($message = 'Wrong item response', $code = 200)
    {
        parent::__construct($message, $code);
    }

    /**
     * @return string
     */
    public function getUserMessage()
    {
        return $this->getMessage();
    }
}

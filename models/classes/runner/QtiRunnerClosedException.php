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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner;

use qtism\runtime\tests\AssessmentTestSessionState;

class QtiRunnerClosedException extends \common_Exception implements \common_exception_UserReadableException
{
    /**
     * Create a new QtiRunnerClosedException object.
     *
     * @param string $message A technical information message.
     * @param integer $code A code to explicitly identify the nature of the error.
     */
    public function __construct(
        $message = 'The assessment has been terminated. You cannot interact with it anymore.',
        $code = AssessmentTestSessionState::CLOSED
    ) {
        parent::__construct($message, $code);
    }

    /**
     * Returns a translated human-readable message for the end-user.
     *
     * @return string A human-readable message.
     */
    public function getUserMessage()
    {
        return __('The assessment has been terminated. You cannot interact with it anymore.');
    }
}

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
 * CAT Engine Not Found Exception.
 * 
 * This Exception must be thrown in case a CAT Engine is requested but
 * not endpoint configuration could be found for it.
 */
class CatEngineNotFoundException extends CatException
{
    /** @var string The requested endpoint URL. */
    private $requestedEndpoint;
    
    /**
     * New CatEngineNotFoundException object.
     * 
     * Creates a new CatEngineNotFoundException object to be thrown.
     * 
     * @param string $message
     * @param string $requestedEndpoint The requested endpoint URL that made the exception occuring.
     * @param integer $code
     * @param \Exception $previous
     */
    public function __construct($message, $requestedEndpoint, $code = 0, \Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->setRequestedEndpoint($requestedEndpoint);
    }
    
    /**
     * Get Requested Endpoint.
     * 
     * Get the requested endpoint URL.
     * 
     * @return string
     */
    public function getRequestedEndpoint()
    {
        return $this->requestedEndpoint;
    }
    
    /**
     * Set Requested Endpoint.
     * 
     * Set the requested endpoint URL.
     * 
     * @param string $requestedEndpoint
     */
    private function setRequestedEndpoint($requestedEndpoint)
    {
        $this->requestedEndpoint = $requestedEndpoint;
    }
}

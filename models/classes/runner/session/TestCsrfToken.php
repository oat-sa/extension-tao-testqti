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

namespace oat\taoQtiTest\models\runner\session;

use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoTests\models\runner\AbstractCsrfToken;

/**
 * Class TestCsrfToken
 *
 * Handles CSRF token through the PHP session and the ExtendedStateStorage
 *
 * @package oat\taoTests\models\runner
 */
class TestCsrfToken extends AbstractCsrfToken
{
    /**
     * The name of the storage key for the current session token
     */
    const TOKEN_KEY = 'SECURITY_TOKEN_';

    /**
     * The token name
     * 
     * @var string
     */
    protected $sessionId;

    /**
     * temporary variable until proper servicemanager integration
     * @var ExtendedStateService
     */
    private static $extendedStateService;

    /**
     * temporary helper until proper servicemanager integration
     * @return ExtendedStateService
     */
    static public function getExtendedStateService()
    {
        if (!isset(self::$extendedStateService)) {
            self::$extendedStateService = new ExtendedStateService();
        }
        return self::$extendedStateService;
    }
    
    /**
     * SessionCsrfToken constructor.
     * @param string $sessionId The identifier of the test session
     */
    public function __construct($sessionId)
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Gets the identifier of the test session
     * @return string
     */
    public function getSessionId()
    {
        return $this->sessionId;
    }
    
    /**
     * Generates and returns the CSRF token
     * @return string
     */
    public function getCsrfToken()
    {
        $service = self::getExtendedStateService();

        $token = $this->generateToken();

        $service->setSecurityToken($this->getSessionId(), $token);
        
        return $token;
    }

    /**
     * Validates a given token with the current CSRF token
     * @param string $token The given token to validate
     * @param int $lifetime A max life time for the current token, default to infinite
     * @return bool
     */
    public function checkCsrfToken($token, $lifetime = 0)
    {
        $valid = true;
        $sessionId = $this->getSessionId();
        $session = \PHPSession::singleton();
        $sessionTokenKey = self::TOKEN_KEY . $sessionId;
        
        $service = self::getExtendedStateService();
        $sessionToken = $service->getSessionToken($this->getSessionId());
        $currentTimestamp = $service->getSecurityTimestamp($this->getSessionId());
        $currentToken = $service->getSecurityToken($this->getSessionId());
        
        if ($session->hasAttribute($sessionTokenKey)) {
            $valid = $session->getAttribute($sessionTokenKey) == $sessionToken;
        }

        if ($valid && $lifetime && $currentTimestamp) {
            $valid = $lifetime >= time() - $currentTimestamp;
        }

        if ($valid) {
            $valid = $currentToken == $token;
        }

        return $valid;
    }

    /**
     * Revokes the current CSRF token
     * @return void
     */
    public function revokeCsrfToken()
    {
        $sessionId = $this->getSessionId();
        
        $service = self::getExtendedStateService();
        $service->resetSecurity($sessionId);
        
        \PHPSession::singleton()->setAttribute(self::TOKEN_KEY . $sessionId, $service->getSessionToken($sessionId));
    }
}

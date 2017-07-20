<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\libCat\CatEngine;

/**
 * Wrap a Cat Engine in a service.
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoDelivery
 */
class CatService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CatService';
    
    const OPTION_ENGINE_CLASS = 'class';
    
    const OPTION_ENGINE_ARGS = 'args';
    
    private $engine = null;
    
    /**
     * Returns the Adaptive Engine
     * 
     * Returns an CateEngine implementation object.
     * 
     * @return oat\libCat\CatEngine
     */
    public function getEngine() {
        if (is_null($this->engine)) {
            $class = $this->getOption(self::OPTION_ENGINE_CLASS);
            $args = $this->getOption(self::OPTION_ENGINE_ARGS);
            $this->engine = new $class(...$args);
        }
        return $this->engine;
    }    
}

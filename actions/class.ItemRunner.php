<?php

use oat\taoQtiItem\controller\AbstractQtiItemRunner;

class taoQtiTest_actions_ItemRunner extends AbstractQtiItemRunner
{
    
    /**
     * The endpoint specific to QTI Items in a QTI Test runner context
     * @return string
     */
    protected function getResultServerEndpoint()
    {
        return _url('', 'TestRunner', 'taoQtiTest');
    }
    
    /**
     * Define additional parameters for the result server
     * @return array
     */
    protected function getResultServerParams()
    {
        return [
            'testServiceCallId' => $this->getRequestParameter('QtiTestParentServiceCallId'),
            'testDefinition'    => $this->getRequestParameter('QtiTestDefinition'),
            'itemDataPath'      => $this->getRequestParameter('itemDataPath')
        ];
    }
    
    protected function selectView()
    {
        $this->setInitialVariableElements();
        $this->setView('item_runner.tpl');
    }
}

<?php

class taoQtiTest_actions_ItemRunner extends taoItems_actions_ItemRunner {
    
    /**
     * The endpoint specific to QTI Items in a QTI Test runner context
     * @return string
     */
    protected function getResultServerEndpoint(){
        return _url('', 'TestRunner','taoQtiTest');
    }
    
    /**
     * Define additionnal parameters for the result server
     * @return array
     */
    protected function getResultServerParams(){
        return array(
            'testServiceCallId' => $this->getRequestParameter('QtiTestParentServiceCallId'),
            'testDefinition'    => $this->getRequestParameter('QtiTestDefinition'),
            'testCompilation'   => $this->getRequestParameter('QtiTestCompilation')
        );
    }
    
    protected function selectView() {
        $this->setView('item_runner.tpl');
    }
}
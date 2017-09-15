<?php

namespace oat\taoQtiTest\models\runner;

interface CompilationContext
{
    public function getCompilationDirectory();
    
    public function getTestExecutionUri();
}

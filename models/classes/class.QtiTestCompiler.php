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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

use qtism\runtime\rendering\markup\xhtml\XhtmlRenderingEngine;
use qtism\data\storage\php\PhpDocument;
use qtism\data\QtiComponentIterator;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlCompactDocument;
use qtism\data\state\OutcomeDeclaration;
use qtism\data\state\DefaultValue;
use qtism\data\state\Value;
use qtism\data\state\ValueCollection;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

/**
 * Compiles a QTI Test and related QTI Items.
 *
 * @access public
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * @subpackage models_classes
 */
class taoQtiTest_models_classes_QtiTestCompiler extends taoTests_models_classes_TestCompiler
{
    /**
     * Compile a QTI Test and the related QTI Items.
     * 
     * @param core_kernel_file_File $destinationDirectory The directory where the compiled files must be put.
     * @return tao_models_classes_service_ServiceCall A ServiceCall object that represent the way to call the newly compiled test.
     * @throws tao_models_classes_CompilationFailedException If an error occurs during the compilation.
     */
    public function compile() {
        
        $testService = taoQtiTest_models_classes_QtiTestService::singleton();
        $test = $this->getResource();
        
        common_Logger::i('Compiling QTI test ' . $test->getLabel().' and the related QTI Items');
        
        // 1. Compile the test definition itself.
        $testContentProperty = new core_kernel_classes_Property(TEST_TESTCONTENT_PROP);
        $testContent = new core_kernel_file_File($test->getUniquePropertyValue($testContentProperty)->getUri());
        $itemResolver = new taoQtiTest_helpers_ItemResolver('');
        
        $originalDoc = $testService->getDoc($test);
        common_Logger::t("QTI Test XML document successfully loaded.");
        
        $compiledDoc = XmlCompactDocument::createFromXmlAssessmentTestDocument($originalDoc, $itemResolver);
        common_Logger::t("QTI Test XML document successfuly transformed in a compact version.");
        
        // 2. Compile the items of the test.
        $iterator = new QtiComponentIterator($compiledDoc->getDocumentComponent(), array('assessmentItemRef'));
        $itemCount = 0;
        foreach ($iterator as $assessmentItemRef) {
            $itemToCompile = new core_kernel_classes_Resource($assessmentItemRef->getHref());
            $itemService = $this->subCompile($itemToCompile);
            $inputValues = tao_models_classes_service_ServiceCallHelper::getInputValues($itemService, array());
            $assessmentItemRef->setHref($inputValues['itemUri'] . '|' . $inputValues['itemPath'] . '|' . $this->getResource()->getUri());
            $itemCount++;
            
            common_Logger::d("QTI Item successfuly compiled and registered as a service call in the QTI Test Definition.");
        }
        
        if ($itemCount === 0) {
            $msg = "Cannot compile a QTI Test without any QTI Items.";
            $code = taoQtiTest_models_classes_QtiTestCompilationFailedException::NO_ITEMS;
            throw new taoQtiTest_models_classes_QtiTestCompilationFailedException($msg, $test, $code);
        }
        
        // First save as XML in order to explode the rubricBlocks.
        $destinationDirectory = $this->spawnPrivateDirectory(); 
        $compiledDocDir = $destinationDirectory->getPath();
        $xmlCompactPath = $compiledDocDir . 'compact-test.xml';
        $compiledDoc->setExplodeRubricBlocks(true);
        $compiledDoc->save($xmlCompactPath);
        unlink($xmlCompactPath);
        
        $compiledDocPath = $compiledDocDir . 'compact-test.php';
        $phpCompiledDoc = new PhpDocument('2.1');
        $phpCompiledDoc->setDocumentComponent($compiledDoc->getDocumentComponent());
        
        // Add an LtiOutcome OutcomeDeclaration.
        $outcomeDeclarations = $phpCompiledDoc->getDocumentComponent()->getOutcomeDeclarations();
        $outcomeDeclarations[] = new OutcomeDeclaration('LtiOutcome', BaseType::FLOAT, Cardinality::SINGLE, new DefaultValue(new ValueCollection(array(new Value(0.0, BaseType::FLOAT)))));
        
        // 3. Compile rubricBlocks and serialize on disk.
        $rootComponent = $phpCompiledDoc->getDocumentComponent();
        $rubricBlockRefs = $rootComponent->getComponentsByClassName('rubricBlockRef');
        $renderingEngine = new XhtmlRenderingEngine();
        
        foreach ($rubricBlockRefs as $rubric) {
            // loading...
            common_Logger::d("Loading rubricBlock '" . $rubric->getHref() . "'...");
            
            $rubricDoc = new XmlDocument();
            $rubricDoc->load($compiledDocDir . $rubric->getHref());
            
            common_Logger::d("rubricBlock '" . $rubric->getHref() . "' successfully loaded.");
            
            // rendering...
            common_Logger::d("Rendering rubricBlock '" . $rubric->getHref() . "'...");
            
            $pathinfo = pathinfo($rubric->getHref());
            $renderingFile = $compiledDocDir . $pathinfo['filename'] . '.php';
            $domRendering = $renderingEngine->render($rubricDoc->getDocumentComponent());
            $domRendering->formatOutput = true;
            $domRendering->saveHTMLFile($renderingFile);
            
            common_Logger::d("rubricBlockRef '" . $rubric->getHref() . "' successfully rendered.");
            
            unlink($compiledDocDir . $rubric->getHref());
            $rubric->setHref('./' . $pathinfo['filename'] . '.php');
        }
        
        $phpCompiledDoc->save($compiledDocPath);
        common_Logger::d("QTI-PHP Test Compilation file registered at '" . $compiledDocPath . '".');
        
        // 4. Build the service call.
        $service = new tao_models_classes_service_ServiceCall(new core_kernel_classes_Resource(INSTANCE_QTITEST_TESTRUNNERSERVICE));
        $param = new tao_models_classes_service_ConstantParameter(
                        // Test Definition URI passed to the QtiTestRunner service.
                        new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTDEFINITION),
                        $test
        );
        $service->addInParameter($param);
        
        $param = new tao_models_classes_service_ConstantParameter(
                        // Test Compilation URI passed to the QtiTestRunner service.
                        new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTCOMPILATION),
                        $destinationDirectory->getId()
        );
        $service->addInParameter($param);
        
        common_Logger::d("QTI Test successfuly compiled.");
        
        return $service;
    }
}
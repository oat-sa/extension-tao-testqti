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
 * Copyright (c) 2013-2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

use qtism\runtime\rendering\markup\xhtml\XhtmlRenderingEngine;
use qtism\runtime\rendering\css\CssScoper;
use qtism\data\storage\php\PhpDocument;
use qtism\data\QtiComponentIterator;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlCompactDocument;
use qtism\data\AssessmentTest;
use qtism\data\content\RubricBlockRef;
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
    private static $publicMimeTypes = array('text/css',
                                               'image/png', 
                                               'image/jpeg', 
                                               'image/gif', 
                                               'text/html',
                                               'application/x-shockwave-flash',
                                               'video/x-flv',
                                               'image/bmp',
                                               'image/svg+xml',
                                               'audio/mpeg',
                                               'audio/ogg',
                                               'video/quicktime',
                                               'video/webm',
                                               'video/ogg',
                                               'application/pdf',
                                               'application/x-font-woff',
                                               'application/vnd.ms-fontobject',
                                               'application/x-font-ttf');
   
    /**
     * 
     * @var tao_models_classes_service_StorageDirectory
     */
    private $publicDirectory = null;
    
    /**
     * 
     * @var tao_models_classes_service_StorageDirectory
     */
    private $privateDirectory = null;
    
    protected function getPublicDirectory() {
        return $this->publicDirectory;
    }
    
    protected function setPublicDirectory(tao_models_classes_service_StorageDirectory $directory) {
        $this->publicDirectory = $directory;
    }
    
    protected function getPrivateDirectory() {
        return $this->privateDirectory;
    }
    
    protected function setPrivateDirectory(tao_models_classes_service_StorageDirectory $directory) {
        $this->privateDirectory = $directory;
    }
    
    protected function initCompilation() {
        $this->setPrivateDirectory($this->spawnPrivateDirectory());
        $this->setPublicDirectory($this->spawnPublicDirectory());
    }
    
    /**
     * Compile a QTI Test and the related QTI Items.
     * 
     * @param core_kernel_file_File $destinationDirectory The directory where the compiled files must be put.
     * @return tao_models_classes_service_ServiceCall A ServiceCall object that represent the way to call the newly compiled test.
     * @throws tao_models_classes_CompilationFailedException If an error occurs during the compilation.
     */
    public function compile() {
        $this->initCompilation();
        
        $testService = taoQtiTest_models_classes_QtiTestService::singleton();
        $test = $this->getResource();
        $compiledDocDir = $this->getPrivateDirectory()->getPath();
        $publicCompiledDocDir = $this->getPublicDirectory()->getPath();
        
        // 0. Copy the resources composing the test into the private complilation directory.
        $this->copyPrivateResources();
        
        // 1. Compile the test definition itself.
        $compiledDoc = $this->compactTest();
        
        // 2. Compile the items of the test.
        $this->compileItems($compiledDoc);
        
        // 3. Explode the rubric blocks in the test into rubric block refs.
        $this->explodeRubricBlocks($compiledDoc);
        
        // 4. Update test definition with additional runtime info.
        $assessmentTest = $compiledDoc->getDocumentComponent();
        $this->updateTestDefinition($assessmentTest);
        
        // 5. Compile rubricBlocks and serialize on disk.
        $rubricBlockRefs = $assessmentTest->getComponentsByClassName('rubricBlockRef');
        $renderingEngine = new XhtmlRenderingEngine();
        $renderingEngine->setStylesheetPolicy(XhtmlRenderingEngine::STYLESHEET_SEPARATE);
        $renderingEngine->setXmlBasePolicy(XhtmlRenderingEngine::XMLBASE_PROCESS);
        $renderingEngine->setRootBase('tao://qti-directory');
        $cssScoper = new CssScoper();
        
        foreach ($rubricBlockRefs as $rubric) {
            $this->compileRubricBlock($rubric, $renderingEngine, $cssScoper);
        }
        
        $compiledDocPath = $compiledDocDir . 'compact-test.php';
        $phpCompiledDoc = new PhpDocument('2.1');
        $phpCompiledDoc->setDocumentComponent($assessmentTest);
        $phpCompiledDoc->save($compiledDocPath);
        common_Logger::d("QTI-PHP Test Compilation file registered at '" . $compiledDocPath . "'.");

        // 6. Copy the needed files into the public directory.
        $this->copyPublicResources(); 
        
        // 7. Build the service call.
        $serviceCall = $this->buildServiceCall();
        
        common_Logger::t("QTI Test successfuly compiled.");
        
        return $serviceCall;
    }
    
    protected function compactTest() {
        $testService = taoQtiTest_models_classes_QtiTestService::singleton();
        $test = $this->getResource();
        $testContent = $testService->getTestContent($test);
        
        common_Logger::i('Compiling QTI test ' . $test->getLabel() . '.');
        
        // 1. Compile the test definition itself.
        $itemResolver = new taoQtiTest_helpers_ItemResolver('');
        
        $originalDoc = $testService->getDoc($test);
        common_Logger::t("QTI Test XML document successfully loaded.");
        
        $compiledDoc = XmlCompactDocument::createFromXmlAssessmentTestDocument($originalDoc, $itemResolver);
        common_Logger::t("QTI Test XML document successfuly transformed in a compact version.");
        
        return $compiledDoc;
    }
    
    protected function compileItems(XmlCompactDocument $compactDoc) {
        $iterator = new QtiComponentIterator($compactDoc->getDocumentComponent(), array('assessmentItemRef'));
        $itemCount = 0;
        foreach ($iterator as $assessmentItemRef) {
            $itemToCompile = new core_kernel_classes_Resource($assessmentItemRef->getHref());
            $itemService = $this->subCompile($itemToCompile);
            $inputValues = tao_models_classes_service_ServiceCallHelper::getInputValues($itemService, array());
            $assessmentItemRef->setHref($inputValues['itemUri'] . '|' . $inputValues['itemPath'] . '|' . $this->getResource()->getUri());
            $itemCount++;
        
            common_Logger::t("QTI Item successfuly compiled and registered as a service call in the QTI Test Definition.");
        }
        
        if ($itemCount === 0) {
            $msg = "A QTI Test must contain at least one QTI Item to be compiled. None found.";
            $code = taoQtiTest_models_classes_QtiTestCompilationFailedException::NO_ITEMS;
            throw new taoQtiTest_models_classes_QtiTestCompilationFailedException($msg, $test, $code);
        }
    }
    
    protected function explodeRubricBlocks(XmlCompactDocument $compiledDoc) {
        $savePath = $this->getPrivateDirectory()->getPath() . 'compact-test.xml';
        $compiledDoc->setExplodeRubricBlocks(true);
        $compiledDoc->save($savePath);
        unlink($savePath);
    }
    
    protected function updateTestDefinition(AssessmentTest $assessmentTest) {
        $outcomeDeclarations = $assessmentTest->getOutcomeDeclarations();
        $outcomeDeclarations[] = new OutcomeDeclaration('LtiOutcome', BaseType::FLOAT, Cardinality::SINGLE, new DefaultValue(new ValueCollection(array(new Value(0.0, BaseType::FLOAT)))));
    }
    
    protected function copyPrivateResources() {
        $testService = taoQtiTest_models_classes_QtiTestService::singleton();
        $test = $this->getResource();
        $testPath = $testService->getTestContent($test)->getAbsolutePath();
        
        $subContent = tao_helpers_File::scandir($testPath, array('recursive' => false, 'absolute' => true));
        foreach ($subContent as $subC) {
            tao_helpers_File::copy($subC, $this->getPrivateDirectory()->getPath() . basename($subC));
        }
    }
    
    protected function buildServiceCall() {
        $service = new tao_models_classes_service_ServiceCall(new core_kernel_classes_Resource(INSTANCE_QTITEST_TESTRUNNERSERVICE));
        $param = new tao_models_classes_service_ConstantParameter(
                        // Test Definition URI passed to the QtiTestRunner service.
                        new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTDEFINITION),
                        $this->getResource()
        );
        $service->addInParameter($param);
        
        $param = new tao_models_classes_service_ConstantParameter(
                        // Test Compilation URI passed to the QtiTestRunner service.
                        new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTCOMPILATION),
                        $this->getPrivateDirectory()->getId() . '|' . $this->getPublicDirectory()->getId()
        );
        $service->addInParameter($param);
        
        return $service;
    }
    
    protected function compileRubricBlock(RubricBlockRef $rubric, XhtmlRenderingEngine $renderingEngine, CssScoper $cssScoper) {
        $compiledDocDir = $this->getPrivateDirectory()->getPath();
        $publicCompiledDocDir = $this->getPublicDirectory()->getPath();
        
        // -- loading...
        common_Logger::t("Loading rubricBlock '" . $rubric->getHref() . "'...");
        
        $rubricDoc = new XmlDocument();
        $rubricDoc->load($compiledDocDir . $rubric->getHref());
        
        common_Logger::t("rubricBlock '" . $rubric->getHref() . "' successfully loaded.");
        
        // -- rendering...
        common_Logger::t("Rendering rubricBlock '" . $rubric->getHref() . "'...");
        
        $pathinfo = pathinfo($rubric->getHref());
        $renderingFile = $compiledDocDir . $pathinfo['filename'] . '.php';
        
        $domRendering = $renderingEngine->render($rubricDoc->getDocumentComponent());
        $domRendering->formatOutput = true;
        $mainStringRendering = $domRendering->saveXML($domRendering->documentElement);
        
        $rubricDocStylesheets = $rubricDoc->getDocumentComponent()->getStylesheets();
        if (empty($rubricDocStylesheets) === false) {
            // Prepend stylesheets rendering to the main rendering.
            $styleRendering = $renderingEngine->getStylesheets();
            $mainStringRendering = $styleRendering->ownerDocument->saveXML($styleRendering) . $mainStringRendering;
        
            foreach ($rubricDocStylesheets as $rubricDocStylesheet) {
                $stylesheetPath = taoQtiTest_helpers_Utils::storedQtiResourcePath($compiledDocDir, $rubricDocStylesheet->getHref());
                file_put_contents($stylesheetPath, $cssScoper->render($stylesheetPath, $rubricDoc->getDocumentComponent()->getId()));
            }
        }
        
        $mainStringRendering = str_replace('tao://qti-directory/', '<?php echo $taoQtiBasePath; ?>', $mainStringRendering);
        file_put_contents($renderingFile, $mainStringRendering);
        common_Logger::t("rubricBlockRef '" . $rubric->getHref() . "' successfully rendered.");
        
        unlink($compiledDocDir . $rubric->getHref());
        $rubric->setHref('./' . $pathinfo['filename'] . '.php');
    }
    
    protected function copyPublicResources() {
        
        $compiledDocDir = $this->getPrivateDirectory()->getPath();
        $publicCompiledDocDir = $this->getPublicDirectory()->getPath();
        
        foreach (tao_helpers_File::scandir($compiledDocDir, array('recursive' => true, 'only' => tao_helpers_File::$FILE, 'absolute' => true)) as $file) {
            $mime = tao_helpers_File::getMimeType($file, true);
            $pathinfo = pathinfo($file);
            
            // Exclude CSS files because already copied when dealing with rubric blocks.
            if (in_array($mime, self::getPublicMimeTypes()) === true && $pathinfo['extension'] !== 'php') {
                $file = str_replace($compiledDocDir, '', $file);
                
                common_Logger::t("Copying public resource '${file}'.");
                taoQtiTest_helpers_Utils::storeQtiResource($publicCompiledDocDir, $file, $compiledDocDir);
            }
        }
    }
    
    static protected function getPublicMimeTypes() {
        return self::$publicMimeTypes;
    }
}
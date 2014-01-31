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
use qtism\data\storage\StorageException;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\QtiComponentCollection;
use qtism\data\SectionPartCollection;
use qtism\data\AssessmentItemRef;

/**
 * the QTI TestModel service.
 *
 * @author Joel Bout <joel@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jerome Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * @subpackage models_classes
 */
class taoQtiTest_models_classes_QtiTestService extends tao_models_classes_Service {
     
    const CONFIG_QTITEST_FOLDER = 'qtiTestFolder';

    /**
     * Get the QTI Test document formated in JSON.
     * 
     * @param core_kernel_classes_Resource $test
     * @return string the json
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getJsonTest(core_kernel_classes_Resource $test){
        
        $doc = $this->getDoc($test);
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        return $converter->toJson();
    }
    
    /**
     * Save the json formated test into the test resource.
     * 
     * @param core_kernel_classes_Resource $test
     * @param string $json
     * @return boolean true if saved
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function saveJsonTest(core_kernel_classes_Resource $test, $json) {
        $saved = false;
        
        if(!empty($json)){
            $doc = $this->getDoc($test);
            
            $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
            $converter->fromJson($json);
            
            $saved = $this->saveDoc($test, $doc);
        }
        return $saved;
    }
    
    public function fromJson($json){
        $doc = new XmlDocument('2.1');
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $converter->fromJson($json);
        return $doc;
    }
    
    /**
     * Get the items that are part of a given $test.
     * 
     * @param core_kernel_classes_Resource $test A Resource describing a QTI Assessment Test.
     * @return array An array of core_kernel_classes_Resource objects.
     */
    public function getItems( core_kernel_classes_Resource $test ) {
    	return $this->getDocItems($this->getDoc($test));
    }
    
    /**
     * Assign items to a test and save it.
     * @param core_kernel_classes_Resource $test
     * @param array $items
     * @return boolean true if set
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function setItems(core_kernel_classes_Resource $test, array $items) {
        
        $doc = $this->getDoc($test);
        $bound = $this->setItemsToDoc($doc, $items);
        
        if($this->saveDoc($test, $doc)){
            return $bound == count($items);
        }
        
        return false;
    }
    
      /**
     * Save the QTI test : set the items sequence and some options.
     * 
     * @param core_kernel_classes_Resource $test A Resource describing a QTI Assessment Test.
     * @param array $items the items sequence
     * @param array $options the test's options
     * @return boolean if nothing goes wrong
     * @throws StorageException If an error occurs while serializing/unserializing QTI-XML content. 
     */
    public function save( core_kernel_classes_Resource $test, array $items) {
        try {
            $doc = $this->getDoc($test);
            $this->setItemsToDoc($doc, $items);
            $saved  = $this->saveDoc($test, $doc);
        }
    	catch (StorageException $e) {
    		throw new taoQtiTest_models_classes_QtiTestServiceException(
                        "An error occured while dealing with the QTI-XML test: ".$e->getMessage(), 
                        taoQtiTest_models_classes_QtiTestServiceException::TEST_WRITE_ERROR
                   );
    	}
    	
    	return $saved;
    }

    /**
     * Get an identifier for a component of $qtiType.
     * This identifier must be unique across the whole document.
     * 
     * @param XmlDocument $doc
     * @param type $qtiType the type name
     * @return the identifier
     */
    public function getIdentifierFor(XmlDocument $doc, $qtiType){
        $components = $doc->getDocumentComponent()->getIdentifiableComponents();
        $i = 1;
        do {
            $identifier = $this->generateIdentifier($doc, $qtiType, $i);
            $i++;
        } while(!$this->isIdentifierUnique($components, $identifier));
        
        return $identifier;
    }
    
    /**
     * Check whether an identifier is unique against a list of components
     * @param QtiComponentCollection $components
     * @param type $identifier
     * @return boolean
     */
    private function isIdentifierUnique(QtiComponentCollection $components, $identifier) {
        foreach($components as $component){
            if($component->getIdentifier() == $identifier){
                return false;
            }
        }
        return true;
    }
    
    /**
     * Generate an identifier from a qti type, using the syntax "qtitype-index"
     * @param XmlDocument $doc
     * @param type $qtiType
     * @param type $offset
     * @return the identifier
     */
    private function generateIdentifier(XmlDocument $doc, $qtiType, $offset = 1) {
        $typeList = $doc->getDocumentComponent()->getComponentsByClassName($qtiType);
        return $qtiType . '-' . (count($typeList) + $offset);
    }
    
    /**
     * Import a QTI Test and the Items within into the TAO Platform.
     * 
     * @param core_kernel_classes_Resource $testResource
     * @param string $file The path to the IMS Content Package archive you want to import as a QTI Test.
     * @return common_report_Report A report about how the importation behaved.
     */
    public function importTest(core_kernel_classes_Resource $testResource, $file, $itemClass) {
        
        $report = new common_report_Report(common_report_Report::TYPE_INFO);
        $qtiPackageParser = new taoQtiTest_models_classes_PackageParser($file);
        $qtiPackageParser->validate();

        $itemImportService = taoQTI_models_classes_QTI_ImportService::singleton();
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $testService = taoTests_models_classes_TestsService::singleton();
        $itemMap = array();
        
        if ($qtiPackageParser->isValid()) {
            //extract the package
            $folder = $qtiPackageParser->extract();
            
            if(!is_dir($folder)) {
                throw new taoQTI_models_classes_QTI_exception_ExtractException();
            }

            //load and validate the manifest
            $qtiManifestParser = new taoQtiTest_models_classes_ManifestParser($folder.'imsmanifest.xml');
            $qtiManifestParser->validate();
            
            if ($qtiManifestParser->isValid() === true) {
                $tests = $qtiManifestParser->getResources('imsqti_test_xmlv2p1');
                
                if (empty($tests) === true) {
                    
                    // There are no test definition described by the imsmanifest.xml file.
                    $report->add(common_report_Report::createFailure(__('No Test Definition found in the IMS Manifest file.')));
                }
                else if (count($tests) > 1) {
                    
                    // @todo support multiple tests in the same QTI Content Package.
                    $report->add(common_report_Report::createFailure(__('More than one Test Definition found the IMS Manifest file.')));
                }
                else {
                    
                    // First step is to import all the items that are dependencies of the test.
                    $itemError = false;
                    $testQtiResource = current($tests);
                    $dependencies = $testQtiResource->getDependencies();
                    
                    if (count($dependencies) > 0) {
                        
                        foreach ($dependencies as $qtiDependency) {
                            // Find the resource referenced by the dependency.
                            $qtiDependencyReferences = $qtiManifestParser->getResources($qtiDependency, taoQtiTest_models_classes_ManifestParser::FILTER_RESOURCE_IDENTIFIER);
                            
                            if (count($qtiDependencyReferences) > 0) {
                        
                                $qtiResource = current($qtiDependencyReferences);
                        
                                if (taoQTI_models_classes_QTI_Resource::isAssessmentItem($qtiResource->getType())) {
                        
                                    $itemReport = new common_report_Report(common_report_Report::TYPE_SUCCESS, '');
                                    $qtiFile = $folder . $qtiResource->getFile();
                                    $itemReport = $itemImportService->importQTIFile($qtiFile, $itemClass);
                                    $rdfItem = $itemReport->getData();
                        
                                    if ($rdfItem) {
                                        $itemPath = taoItems_models_classes_ItemsService::singleton()->getItemFolder($rdfItem);
                        
                                        foreach ($qtiResource->getAuxiliaryFiles() as $auxResource) {
                                            // $auxResource is a relativ URL, so we need to replace the slashes with directory separators
                                            $auxPath = $folder . str_replace('/', DIRECTORY_SEPARATOR, $auxResource);
                                            $relPath = helpers_File::getRelPath($qtiFile, $auxPath);
                                            $destPath = $itemPath . $relPath;
                                            tao_helpers_File::copy($auxPath, $destPath, true);
                                        }
                                        $itemMap[$qtiResource->getIdentifier()] = $rdfItem;
                                        $itemReport->setMessage(__('IMS QTI Item referenced as "%s" in the IMS Manifest file imported successfully.', $qtiResource->getIdentifier()));
                                    }
                                    else {
                                        $itemReport->setType(common_report_Report::TYPE_ERROR);
                                        $itemReport->setMessage(__('IMS QTI Item referenced as "%s" in the IMS Manifest file could not be imported.', $qtiResource->getIdentifier()));
                                        $itemError = ($itemError === false) ? true : $itemError;
                                    }
                        
                                    $report->add($itemReport);
                                }
                            }
                            else {
                                $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, __('The dependency to the IMS QTI Item expected to be referenced as "%s" in the IMS Manifest file could not be resolved.', $qtiDependency), $qtiDependency));
                                $itemError = ($itemError === false) ? true : $itemError;
                            }
                        }
                        
                        // If items did not produce errors, we import the test definitio.
                        if ($itemError === false) {
                            common_Logger::i('Importing test...');
                            // Second step is to take care of the test definition and the related media (auxiliary files).
                            $testDefinition = new XmlDocument();
                            try {
                                $testDefinition->load($folder . str_replace('/', DIRECTORY_SEPARATOR, $testQtiResource->getFile()), true);
                                
                                // 1. Import test definition (i.e. the QTI-XML Test file).
                                $testContent = $this->importTestDefinition($testResource, $testDefinition, $testQtiResource, $itemMap, $folder, $report);
                                
                                // 2. Import test auxilliary files (e.g. stylesheets, images, ...).
                                $this->importTestAuxiliaryFiles($testContent, $testQtiResource, $folder, $report);
                            }
                            catch (StorageException $e) {
                                // Source of the exception = $testDefinition->load()
                                $eStrs = array();
                                if (($libXmlErrors = $e->getErrors()) !== null) {
                                    foreach ($libXmlErrors as $libXmlError) {
                                        $eStrs[] = __('QTI-XML error at line %1$d column %2$d "%3$s".', $libXmlError->line, $libXmlError->column, trim($libXmlError->message));
                                    }
                                }
                                $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, __("The IMS QTI Test referenced as \"%s\" in the IMS Manifest file could not be imported:\n%s", $testQtiResource->getIdentifier(), implode("\n", $eStrs))));
                            }
                        }
                        else {
                            $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, __("One or more Items of the IMS QTI Test referenced as \"%s\" in the IMS Manifest file could not be imported.", $testQtiResource->getIdentifier())));
                        }
                    }
                    else {
                        // No depencies found (i.e. no item resources bound to the test).
                        $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, __("The IMS QTI Test to be imported do not refer to any Item.")));
                    }
                }
            }
            
            tao_helpers_File::deltree($folder);
        }
        else {
            $report->add(common_report_Report::createFailure(__('The IMS QTI Test Package could not be extracted. The archive might be corrupted.')));
        }
        
        if ($report->containsError() === true) {
            // We consider a test as an atomic component, we then rollback it.
        
            // Delete all imported items.
            foreach ($itemMap as $item) {
                common_Logger::i("Rollbacking item '" . $item->getLabel() . "'...");
                @$itemService->deleteItem($item);
            }
        
            // Delete the target Item RDFS Class.
            common_Logger::i("Rollbacking Items target RDFS class '" . $itemClass->getLabel() . "'...");
            $itemClass->delete();
        
            // Delete test definition.
            common_Logger::i("Rollbacking test '" . $testResource->getLabel() . "...");
            @$testService->deleteTest($testResource);
        
            if (count($itemMap) > 0) {
                $report->add(new common_report_Report(common_report_Report::TYPE_WARNING, __('The imported resources were rolled back.')));
            }
            
            common_Logger::i("Successful Rollback");
        }
        
        return $report;
    }

    /**
     * Import the Test itself  by importing its QTI-XML definition into the system, after
     * the QTI Items composing the test were also imported.
     * 
     * The $itemMapping argument makes the implementation of this method able to know
     * what are the items that were imported. The $itemMapping is an associative array
     * where keys are the assessmentItemRef's identifiers and the values are the core_kernel_classes_Resources of
     * the items that are now stored in the system.
     * 
     * When this method returns false, it means that an error occured at the level of the content of the imported test
     * itself e.g. an item referenced by the test is not present in the content package. In this case, $report might
     * contain useful information to return to the client.
     *
     * @param core_kernel_classes_Resource $testResource A Test Resource the new content must be bind to.
     * @param XmlDocument $testDefinition An XmlAssessmentTestDocument object.
     * @param taoQTI_models_classes_QTI_Resource $qtiResource The manifest resource describing the test to be imported.
     * @param array $itemMapping An associative array that represents the mapping between assessmentItemRef elements and the imported items.
     * @param string $extractionFolder The absolute path to the temporary folder containing the content of the imported IMS QTI Package Archive.
     * @param common_report_Report $report A Report object to be filled during the import.
     * @return core_kernel_file_File The newly created test content.
     * @throws taoQtiTest_models_classes_QtiTestServiceException If an unexpected runtime error occurs.
     */    
    protected function importTestDefinition(core_kernel_classes_Resource $testResource, XmlDocument $testDefinition, taoQTI_models_classes_QTI_Resource $qtiResource, array $itemMapping, $extractionFolder, common_report_Report $report) {
        
        $assessmentItemRefs = $testDefinition->getDocumentComponent()->getComponentsByClassName('assessmentItemRef');
        $assessmentItemRefsCount = count($assessmentItemRefs);
        $itemMappingCount = count($itemMapping);
        
        if ($assessmentItemRefsCount === 0) {
            $report->add(common_report_Report::createFailure(__('The IMS QTI Test referenced as "%s" in the IMS Manifest file does not contain any Item reference.', $testDefinition->getTitle())));
        }
        
        foreach ($assessmentItemRefs as $itemRef) {
            $itemRefIdentifier = $itemRef->getIdentifier();
        
            if (isset($itemMapping[$itemRefIdentifier]) === false || !$itemMapping[$itemRefIdentifier] instanceof core_kernel_classes_Resource) {
                return false;
            }
            else {
                $itemRef->setHref($itemMapping[$itemRefIdentifier]->getUri());
            }
        }
        
        // Bind the newly created test content to the Test Resource in database.
        $ds = DIRECTORY_SEPARATOR;
        $testContent = $this->createContent($testResource);
        $testPath = $testContent->getAbsolutePath();
        $finalPath = taoQtiTest_helpers_Utils::storeQtiResource($testContent, $qtiResource, $extractionFolder, false, TAOQTITEST_FILENAME);
        
        // Delete template test.xml file (created by self::createContent() method) from the root.
        // (Absolutely necessary when the test.xml file is not in the root folder of the archive)
        unlink($testPath . $ds . TAOQTITEST_FILENAME);
        
        try {
            $testDefinition->save($finalPath);
        }
        catch (StorageException $e) {
            throw new taoQtiTest_models_classes_QtiTestServiceException("An error occured while saving with the QTI-XML test.", taoQtiTest_models_classes_QtiTestServiceException::TEST_WRITE_ERROR);
        }
        
        return $testContent;
    }
    
    /**
     * Imports the auxiliary files (file elements contained in the resource test element to be imported) into 
     * the TAO Test Content directory.
     * 
     * If some file cannot be copied, warnings will be committed.
     * 
     * @param core_kernel_file_File $testContent The pointer to the TAO Test Content directory where auxilliary files will be stored.
     * @param taoQTI_models_classes_QTI_Resource $qtiResource The manifest resource describing the test to be imported.
     * @param string $extractionFolder The absolute path to the temporary folder containing the content of the imported IMS QTI Package Archive.
     * @param common_report_Report A report about how the importation behaved.
     */
    protected function importTestAuxiliaryFiles(core_kernel_file_File $testContent,taoQTI_models_classes_QTI_Resource $qtiResource, $extractionFolder, common_report_Report $report) {
        
        foreach ($qtiResource->getAuxiliaryFiles() as $aux) {
            try {
                taoQtiTest_helpers_Utils::storeQtiResource($testContent, $aux, $extractionFolder);
            }
            catch (common_exception_Error $e) {
                $report->add(new common_report_Report(common_report_Report::TYPE_WARNING, __('The file "' . $aux . '" associated with the IMS QTI Test could not be imported.')));
            }
        }
    }
    
    /**
     * Get the core_kernel_file_File object corresponding to the location
     * of the test content (a directory!) on the file system.
     * 
     * @param core_kernel_classes_Resource $test
     * @return null|core_kernel_file_File
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    private function getTestFile(core_kernel_classes_Resource $test){
        
        if(is_null($test)){
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                    'The selected test is null', 
                    taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
               );
        }
            
        $testModel = $test->getOnePropertyValue(new core_kernel_classes_Property(PROPERTY_TEST_TESTMODEL));
        if(is_null($testModel) || $testModel->getUri() != INSTANCE_TEST_MODEL_QTI) {
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                    'The selected test is not a QTI test', 
                    taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
               );
        }
        $file = $test->getOnePropertyValue(new core_kernel_classes_Property(TEST_TESTCONTENT_PROP));
        if(!is_null($file)){
            return new core_kernel_file_File($file);
        }
        return null;
    }
    
    /**
     * Get the QTI reprensentation of a test content.
     * 
     * @param core_kernel_classes_Resource $test the test to get the content from
     * @param type $validate enable validation
     * @return XmlDocument the QTI representation from the test content
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getDoc(core_kernel_classes_Resource $test) {
        
        $doc = new XmlDocument('2.1');
        
        if(!is_null($test)){
            
            $dir = $this->getTestFile($test);
            if (is_null($dir)) {
                $dir = $this->createContent($test);
            } else {
                $dir = new core_kernel_file_File($dir);
            }
            
            $testPath = $dir->getAbsolutePath();
            try {
                // Search for the test.xml file in the test content directory.
                $files = tao_helpers_File::scandir($testPath, array('recursive' => true, 'absolute' => true, 'only' => tao_helpers_File::$FILE));
                $dirContent = array();
                
                foreach ($files as $f) {
                    $pathinfo = pathinfo($f);
                    common_Logger::i($pathinfo['filename']);
                    if ($pathinfo['filename'] . '.' . $pathinfo['extension'] === TAOQTITEST_FILENAME) {
                        $dirContent[] = $f;
                    }
                }
                
                if (count($dirContent) === 0) {
                    throw new Exception('No QTI-XML test file found.');
                }
                else if (count($dirContent) > 1) {
                    throw new Exception('Multiple QTI-XML test file found.');
                }
                
                $filePath = current($dirContent);
                $doc->load($filePath);
            } catch (Exception $e) {
                throw new taoQtiTest_models_classes_QtiTestServiceException(
                        "An error occured while loading QTI-XML test file '${testPath}' : ".$e->getMessage(), 
                        taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
                    );
            }
        }
        return $doc;
    }
    
    /**
     * Convenience method that extracts entries of a $path array that correspond
     * to a given $fileName.
     * 
     * @param array $paths An array of strings representing absolute paths within a given directory.
     * @return array $extractedPath The paths that meet the $fileName criterion.
     */
    private function filterTestContentDirectory(array $paths, $fileName) {
        $returnValue = array();
        
        foreach ($paths as $path) {
            $pathinfo = pathinfo($path);
            $pattern = $pathinfo['filename'];
            
            if (!empty($pathinfo['extension'])) {
                $pattern .= $pathinfo['extension'];
            }
            
            if ($fileName === $pattern) {
                $returnValue[] = $path;
            }
        }
        
        return $returnValue;
    }
    
    /**
     * Get the items from a QTI test document.
     * @param \qtism\data\storage\xml\XmlDocument $doc
     * @return core_kernel_classes_Resource
     */
    private function getDocItems( XmlDocument $doc ){
        $itemArray = array();
    	foreach ($doc->getDocumentComponent()->getComponentsByClassName('assessmentItemRef') as $itemRef) {
            $itemArray[] = new core_kernel_classes_Resource($itemRef->getHref());
    	}
    	return $itemArray;
    }
    
    /**
     * Assign items to a QTI test.
     * @param XmlDocument $doc
     * @param array $items
     * @return type
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    private function setItemsToDoc( XmlDocument $doc, array $items, $sectionIndex = 0) {
        
        $sections = $doc->getDocumentComponent()->getComponentsByClassName('assessmentSection');
        if(!isset($sections[$sectionIndex])){
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                        'No section found in test at index : ' . $sectionIndex, 
                        taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
                    );
        }
        $section = $sections[$sectionIndex];
        
        $itemContentProperty = new core_kernel_classes_Property(TAO_ITEM_CONTENT_PROPERTY);
        $itemRefs = new SectionPartCollection();
        $itemRefIdentifiers = array();
        foreach ($items as $itemResource) {
            $itemContent = new core_kernel_file_File($itemResource->getUniquePropertyValue($itemContentProperty));

            $itemDoc = new XmlDocument();

            try {
                $itemDoc->load($itemContent->getAbsolutePath());
            }
            catch (StorageException $e) {
                $msg = "An error occured while reading QTI-XML item '".$itemResource->getUri()."'.";

                if (is_null($e->getPrevious()) !== true) {
                    $msg .= ": " . $e->getPrevious()->getMessage();
                }
            $itemRefIdentifiers = array();
                throw new taoQtiTest_models_classes_QtiTestServiceException(
                        $msg, 
                        taoQtiTest_models_classes_QtiTestServiceException::ITEM_READ_ERROR
                    );
            }
            $itemRefIdentifier = $itemDoc->getDocumentComponent()->getIdentifier();

            //enable more than one reference
            if(array_key_exists($itemRefIdentifier, $itemRefIdentifiers)){
                    $itemRefIdentifiers[$itemRefIdentifier] += 1;
                    $itemRefIdentifier .= '-'. $itemRefIdentifiers[$itemRefIdentifier];
            } else {
                $itemRefIdentifiers[$itemRefIdentifier] = 0;
            }
            $itemRefs[] = new AssessmentItemRef($itemRefIdentifier, $itemResource->getUri());

        }
        $section->setSectionParts($itemRefs);
            
           
        
        return count($itemRefs);
    }
    
    /**
     * Save the content of test from a QTI Document
     * @param core_kernel_classes_Resource $test
     * @param qtism\data\storage\xml\XmlDocument $doc
     * @return boolean true if saved
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    private function saveDoc( core_kernel_classes_Resource $test, XmlDocument $doc){
        $saved = false;
        
        if(!is_null($test) && !is_null($doc)){
            $file = $this->getTestFile($test);
            if (!is_null($file)) {
                $testPath = $file->getAbsolutePath();
                try {
                    // Search for the test.xml file in the test content directory.
                    $files = tao_helpers_File::scandir($testPath, array('recursive' => true, 'absolute' => true, 'only' => tao_helpers_File::$FILE));
                    $dirContent = array();
                    
                    foreach ($files as $f) {
                        $pathinfo = pathinfo($f);
                        
                        if ($pathinfo['filename'] . '.' . $pathinfo['extension'] === TAOQTITEST_FILENAME) {
                            $dirContent[] = $f;
                        }
                    }
                    
                    if (count($dirContent) === 0) {
                        throw new Exception('No QTI-XML test file found.');
                    }
                    else if (count($dirContent) > 1) {
                        throw new Exception('Multiple QTI-XML test file found.');
                    }
                    
                    $finalPath = current($dirContent);
                    $doc->save($finalPath);
                    $saved = true;
                } catch (Exception $e) {
                    throw new taoQtiTest_models_classes_QtiTestServiceException(
                        "An error occured while writing QTI-XML test '${testPath}': ".$e->getMessage(), 
                         taoQtiTest_models_classes_QtiTestServiceException::ITEM_WRITE_ERROR
                    );
                }
            }
        }
        return $saved;
    }

    /**
     * Create the defautl content of a QTI test.
     * 
     * @param core_kernel_classes_Resource $test
     * @return core_kernel_file_File the content file
     * @throws taoQtiTest_models_classes_QtiTestServiceException If a runtime error occurs while creating the test content.
     */
    public function createContent( core_kernel_classes_Resource $test) {
        
    	$props = self::getQtiTestDirectory()->getPropertiesValues(array(
				PROPERTY_FILE_FILESYSTEM,
				PROPERTY_FILE_FILEPATH
			));
    	
        $repository = new core_kernel_versioning_Repository(current($props[PROPERTY_FILE_FILESYSTEM]));
        $path = (string) current($props[PROPERTY_FILE_FILEPATH]);
        
        // $directory is the directory where test related resources will be stored.
        $directoryPath = md5($test->getUri()) . DIRECTORY_SEPARATOR;
        $directory = $repository->createFile('', $directoryPath);
        mkdir($directory->getAbsolutePath(), 0770, true);
        
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $emptyTestXml = $this->getQtiTestTemplateFileAsString();
        
        // Set the test label as title.
        $emptyTestXml = str_replace('{testTitle}', $test->getLabel(), $emptyTestXml);
        $emptyTestXml = str_replace('{taoVersion}', TAO_VERSION, $emptyTestXml);
        
        $filePath = $this->getQtiTestDirectory()->getAbsolutePath() . DIRECTORY_SEPARATOR . $directoryPath . TAOQTITEST_FILENAME;
        if (file_put_contents($filePath, $emptyTestXml) === false) {
            $msg = "Unable to write raw QTI Test template at location '${filePath}'.";
            throw new taoQtiTest_models_classes_QtiTestServiceException($msg, taoQtiTest_models_classes_QtiTestServiceException::TEST_WRITE_ERROR);
        }
        
        common_Logger::i("Created QTI Test content at location '" . $directory->getAbsolutePath() . "'.");
        $test->editPropertyValues(new core_kernel_classes_Property(TEST_TESTCONTENT_PROP), $directory);
        return $directory;
    }
    
    /**
     * Delete the content of a QTI test
     * @param core_kernel_classes_Resource $test
     * @throws common_exception_Error
     */
    public function deleteContent( core_kernel_classes_Resource $test) {
        $content = $test->getOnePropertyValue(new core_kernel_classes_Property(TEST_TESTCONTENT_PROP));

        if (!is_null($content)) {
            $file = new core_kernel_file_File($content);
            
            try {
                $path = $file->getAbsolutePath();
                
                if (is_dir($path)) {
                    if (!tao_helpers_File::delTree($path)) {
                        throw new common_exception_Error("Unable to remove test content directory located at '" . $file->getAbsolutePath() . "'.");
                    }
                }
            }
            catch (common_Exception $e) {
                // Empty file...
            }
            
            $file->delete();
            $test->removePropertyValue(new core_kernel_classes_Property(TEST_TESTCONTENT_PROP), $file);
        }
    }
    
    /**
     * Set the directory where the tests' contents are stored.
     * @param core_kernel_file_File $folder
     */
    public function setQtiTestDirectory(core_kernel_file_File $folder) {
    	$ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    	$ext->setConfig(self::CONFIG_QTITEST_FOLDER, $folder->getUri());
    }
    
    /**
     * Get the directory where the tests' contents are stored.
     * 
     * @return core_kernel_file_File
     * @throws common_Exception
     */
    public function getQtiTestDirectory() {
    	
    	$ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $uri = $ext->getConfig(self::CONFIG_QTITEST_FOLDER);
        if (empty($uri)) {
            throw new common_Exception('No default repository defined for uploaded files storage.');
        }
        return new core_kernel_file_File($uri);
    }
    
    /**
     * Get the content of the QTI Test template file as an XML string.
     * 
     * @return string|boolean The QTI Test template file content or false if it could not be read.
     */
    public function getQtiTestTemplateFileAsString() {
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        return file_get_contents($ext->getDir() . 'models' . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'qtiTest.xml');
    }
}
?>

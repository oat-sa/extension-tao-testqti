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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\taoQtiItem\model\qti\Resource;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\php\PhpDocument;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\Directory;

/**
 * Miscellaneous utility methods for the QtiTest extension.
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class taoQtiTest_helpers_Utils {
    
    /**
     * Store a file referenced by $qtiResource into the final $testContent folder. If the path provided
     * by $qtiResource contains sub-directories, they will be created before copying the file (even
     * if $copy = false).
     * 
     * @param Directory $testContent The pointer to the TAO Test Content folder.
     * @param oat\taoQtiItem\model\qti\Resource|string $qtiResource The QTI resource to be copied into $testContent. If given as a string, it must be the relative (to the IMS QTI Package) path to the resource file.
     * @param string $origin The path to the directory (root folder of extracted IMS QTI package) containing the QTI resource to be copied.
     * @param boolean $copy If set to false, the file will not be actually copied.
     * @param string $rename A new filename  e.g. 'file.css' to be used at storage time.
     * @return string The path were the file was copied/has to be copied (depending on the $copy argument).
     * @throws InvalidArgumentException If one of the above arguments is invalid.
     * @throws common_Exception If the copy fails.
     */
    static public function storeQtiResource(Directory $testContent, $qtiResource, $origin, $copy = true, $rename = '') {
        $fss = ServiceManager::getServiceManager()->get(FileSystemService::SERVICE_ID);
        $fs = $fss->getFileSystem($testContent->getFileSystem()->getId());
        $contentPath = $testContent->getPrefix();

        $ds = DIRECTORY_SEPARATOR;
        $contentPath = rtrim($contentPath, $ds);
        
        if ($qtiResource instanceof Resource) {
            $filePath = $qtiResource->getFile();
        }
        else if (is_string($qtiResource) === true) {
            $filePath = $qtiResource;
        }
        else {
            throw new InvalidArgumentException("The 'qtiResource' argument must be a string or a taoQTI_models_classes_QTI_Resource object.");
        }
        
        $resourcePathinfo = pathinfo($filePath);
        
        if (empty($resourcePathinfo['dirname']) === false && $resourcePathinfo['dirname'] !== '.') {
            // The resource file is not at the root of the archive but in a sub-folder.
            // Let's copy it in the same way into the Test Content folder.
            $breadCrumb = $contentPath . $ds . str_replace('/', $ds, $resourcePathinfo['dirname']);
            $breadCrumb = rtrim($breadCrumb, $ds);
            $finalName = (empty($rename) === true) ? ($resourcePathinfo['filename'] . '.' . $resourcePathinfo['extension']) : $rename;
            $finalPath = $breadCrumb . $ds . $finalName;
        }
        else {
            // The resource file is at the root of the archive.
            // Overwrite template test.xml (created by self::createContent() method above) file with the new one.
            $finalName = (empty($rename) === true) ? ($resourcePathinfo['filename'] . '.' . $resourcePathinfo['extension']) : $rename;
            $finalPath = $contentPath . $ds . $finalName;
        }
        
        if ($copy === true) {
            $origin = str_replace('/', $ds, $origin);
            $origin = rtrim($origin, $ds);
            $sourcePath = $origin . $ds . str_replace('/', $ds, $filePath);

            if (is_readable($sourcePath) === false) {
                throw new common_Exception("An error occured while copying the QTI resource from '${sourcePath}' to '${finalPath}'.");
            }
            
            $fh = fopen($sourcePath, 'r');
            $success = $fs->writeStream($finalPath, $fh);
            fclose($fh);
            
            if (!$success) {
                throw new common_Exception("An error occured while copying the QTI resource from '${sourcePath}' to '${finalPath}'.");
            }
            
        }
        
        return $finalPath;
    }
    
    /**
     * Returns an empty IMS Manifest file as a DOMDocument, ready to be fill with
     * new information about IMS QTI Items and Tests.
     * 
     * @param $version The requested QTI version. Can be "2.1" or "2.2". Default is "2.1".
     * @return DOMDocument
     */
    static public function emptyImsManifest($version = '2.1') {
        $manifestFileName = ($version === '2.1') ? 'imsmanifest' : 'imsmanifestQti22';
        $templateRenderer = new taoItems_models_classes_TemplateRenderer(ROOT_PATH . 'taoQtiItem/model/qti/templates/' . $manifestFileName . '.tpl.php', array(
            'qtiItems' => array(),
            'manifestIdentifier' => 'QTI-TEST-MANIFEST-' . tao_helpers_Display::textCleaner(uniqid('tao', true), '-')
        ));
            
        $manifest = new DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $manifest->loadXML($templateRenderer->render());
        return $manifest;
    }
    
    /**
     * It is sometimes necessary to identify the link between assessmentItemRefs described in a QTI Test definition and the resources
     * describing items in IMS Manifest file. This utility method helps you to achieve this.
     * 
     * The method will return an array describing the IMS Manifest resources that were found in an IMS Manifest file on basis of
     * the assessmentItemRefs found in an AssessmentTest definition. The keys of the arrays are assessmentItemRef identifiers and
     * values are IMS Manifest Resources. 
     * 
     * If an IMS Manifest Resource cannot be found for a given assessmentItemRef, the value in the returned array will be false.
     * 
     * @param XmlDocument $test A QTI Test Definition.
     * @param taoQtiTest_models_classes_ManifestParser $manifestParser A Manifest Parser.
     * @param string $basePath The base path of the folder the IMS archive is exposed as a file system component.
     * @return array An array containing two arrays (items and dependencies) where keys are identifiers and values are oat\taoQtiItem\model\qti\Resource objects or false.
     */
    static public function buildAssessmentItemRefsTestMap(XmlDocument $test, taoQtiTest_models_classes_ManifestParser $manifestParser, $basePath) {
        $assessmentItemRefs = $test->getDocumentComponent()->getComponentsByClassName('assessmentItemRef');
        $map = array('items' => array(), 'dependencies' => array());
        $itemResources = $manifestParser->getResources(Resource::getItemTypes(), taoQtiTest_models_classes_ManifestParser::FILTER_RESOURCE_TYPE);
        $allResources = $manifestParser->getResources();

        // cleanup $basePath.
        $basePath = rtrim($basePath, "/\\");
        $basePath = helpers_File::truePath($basePath);
        $basePath .= DIRECTORY_SEPARATOR;
        
        $documentURI = preg_replace("/^file:\/{1,3}/", '', $test->getDomDocument()->documentURI);
        $testPathInfo = pathinfo($documentURI);
        $testBasePath = tao_helpers_File::truePath($testPathInfo['dirname']) . DIRECTORY_SEPARATOR;
        
        foreach ($assessmentItemRefs as $itemRef) {

            // Find the QTI Resource (in IMS Manifest) related to the item ref.
            // To achieve this, we compare their path.
            $itemRefRelativeHref = str_replace('/', DIRECTORY_SEPARATOR, $itemRef->getHref());
            $itemRefRelativeHref = ltrim($itemRefRelativeHref, "/\\");
            $itemRefCanonicalHref = helpers_File::truePath($testBasePath . $itemRefRelativeHref);
            $map['items'][$itemRef->getIdentifier()] = false;
            
            // Compare with items referenced in the manifest.
            foreach ($itemResources as $itemResource) {
                
                $itemResourceRelativeHref = str_replace('/', DIRECTORY_SEPARATOR, $itemResource->getFile());
                $itemResourceRelativeHref = ltrim($itemResourceRelativeHref, "/\\");
                
                $itemResourceCanonicalHref = helpers_File::truePath($basePath . $itemResourceRelativeHref);
                
                // With some Windows flavours (Win7, Win8), the $itemRefCanonicalHref comes out with
                // a leading 'file:\' component. Let's clean this. (str_replace is binary-safe \0/)
                $os = tao_helpers_Environment::getOperatingSystem();
                if ($os === 'WINNT' || $os === 'WIN32' || $os === 'Windows') {
                    $itemRefCanonicalHref = str_replace('file:\\', '', $itemRefCanonicalHref);
                    
                    // And moreover, it sometimes refer the temp directory as Windows\TEMP instead of Windows\Temp.
                    $itemRefCanonicalHref = str_replace('\\TEMP\\', '\\Temp\\', $itemRefCanonicalHref);
                }
                
                // With some MacOS flavours, the $itemRefCanonicalHref comes out with
                // a leading '/private' component. Clean it!
                if ($os === 'Darwin') {
                    $itemRefCanonicalHref = str_replace('/private', '', $itemRefCanonicalHref);
                }
                
                if ($itemResourceCanonicalHref == $itemRefCanonicalHref && is_file($itemResourceCanonicalHref)) {
                    // assessmentItemRef <-> IMS Manifest resource successful binding!
                    $map['items'][$itemRef->getIdentifier()] = $itemResource;

                    //get dependencies for each item
                    foreach($itemResource->getDependencies() as $dependencyIdentifier){
                        /** @var taoQtiTest_models_classes_QtiResource $resource */
                        foreach($allResources as $resource){
                            if($dependencyIdentifier == $resource->getIdentifier()){
                                $map['dependencies'][$dependencyIdentifier] = $resource;
                                break;
                            }
                        }
                    }
                    break;
                }
            }


        }
        return $map;
    }
    
    /**
     * Retrieve the Test Definition the test session is built from as an AssessmentTest object. 
     * 
     * @param string $qtiTestCompilation (e.g. <i>'http://sample/first.rdf#i14363448108243883-|http://sample/first.rdf#i14363448109065884+'</i>)
     * 
     * @return AssessmentTest The AssessmentTest object the current test session is built from.
     */
    static public function getTestDefinition($qtiTestCompilation)
    {
        $directoryIds = explode('|', $qtiTestCompilation);

        $data = \tao_models_classes_service_FileStorage::singleton()
            ->getDirectoryById($directoryIds[0])
            ->read(TAOQTITEST_COMPILED_FILENAME);
            
        // Store a copy to get it in opcache...
        $expectedCacheDir = sys_get_temp_dir() . '/taooldtestrunnerphpcache';
        $expectedCacheFile = $expectedCacheDir . '/' . md5($qtiTestCompilation) . '.php';
        
        if (!is_dir($expectedCacheDir)) {
            mkdir($expectedCacheDir);
        }
        
        if (!is_file($expectedCacheFile)) {
            file_put_contents($expectedCacheFile, $data);
        }

        common_Logger::d("Loading QTI-PHP file from '${expectedCacheFile}'.");
        $doc = new PhpDocument();
        $doc->load($expectedCacheFile);

        return $doc->getDocumentComponent();
    }
}

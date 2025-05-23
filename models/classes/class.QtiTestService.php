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
 * Copyright (c) 2013-2024 (original work) Open Assessment Technologies SA;
 */

use oat\generis\model\data\event\ResourceCreated;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\reporting\Report;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\tao\model\resources\ResourceAccessDeniedException;
use oat\tao\model\resources\SecureResourceServiceInterface;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\Command\DeleteItemCommand;
use oat\taoQtiItem\model\qti\converter\ManifestConverter;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetaMetadataImportMapper;
use oat\taoQtiItem\model\qti\metadata\importer\PropertyDoesNotExistException;
use oat\taoQtiItem\model\qti\metadata\imsManifest\MetaMetadataExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardianResource;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\ontology\MappedMetadataInjector;
use oat\taoQtiItem\model\qti\PackageParser;
use oat\taoQtiItem\model\qti\Resource;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiTest\models\cat\AdaptiveSectionInjectionException;
use oat\taoQtiTest\models\cat\CatEngineNotFoundException;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\classes\event\TestImportedEvent;
use oat\taoQtiTest\models\metadata\MetadataTestContextAware;
use oat\taoQtiTest\models\Qti\Converter\AssessmentSectionConverter;
use oat\taoQtiTest\models\Qti\Converter\TestConverter;
use oat\taoQtiTest\models\render\QtiPackageImportPreprocessing;
use oat\taoQtiTest\models\test\AssessmentTestXmlFactory;
use oat\taoTests\models\event\TestUpdatedEvent;
use Psr\Container\ContainerInterface;
use qtism\common\utils\Format;
use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentSectionRef;
use qtism\data\QtiComponentCollection;
use qtism\data\SectionPartCollection;
use qtism\data\storage\StorageException;
use qtism\data\storage\xml\marshalling\UnmarshallingException;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use taoQtiTest_models_classes_import_TestImportForm as TestImportForm;
use taoTests_models_classes_TestsService as TestService;

/**
 * the QTI TestModel service.
 *
 * @author Joel Bout <joel@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jerome Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 */
class taoQtiTest_models_classes_QtiTestService extends TestService
{
    public const CONFIG_QTITEST_FILESYSTEM = 'qtiTestFolder';

    public const CONFIG_QTITEST_ACCEPTABLE_LATENCY = 'qtiAcceptableLatency';

    public const QTI_TEST_DEFINITION_INDEX = '.index/qti-test.txt';

    public const PROPERTY_QTI_TEST_IDENTIFIER = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiTestIdentifier';

    public const INSTANCE_TEST_MODEL_QTI = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiTestModel';

    public const TAOQTITEST_FILENAME = 'tao-qtitest-testdefinition.xml';

    public const METADATA_GUARDIAN_CONTEXT_NAME = 'tao-qtitest';

    // phpcs:disable Generic.Files.LineLength
    public const INSTANCE_FORMAL_PARAM_TEST_DEFINITION = 'http://www.tao.lu/Ontologies/TAOTest.rdf#FormalParamQtiTestDefinition';
    public const INSTANCE_FORMAL_PARAM_TEST_COMPILATION = 'http://www.tao.lu/Ontologies/TAOTest.rdf#FormalParamQtiTestCompilation';
    // phpcs:enable Generic.Files.LineLength

    public const TEST_COMPILED_FILENAME = 'compact-test';
    public const TEST_COMPILED_META_FILENAME = 'test-meta';
    public const TEST_COMPILED_METADATA_FILENAME = 'test-metadata.json';
    public const TEST_COMPILED_INDEX = 'test-index.json';
    public const TEST_COMPILED_HREF_INDEX_FILE_PREFIX = 'assessment-item-ref-href-index-';
    public const TEST_COMPILED_HREF_INDEX_FILE_EXTENSION = '.idx';

    public const TEST_REMOTE_FOLDER = 'tao-qtitest-remote';
    public const TEST_RENDERING_STATE_NAME = 'taoQtiTestState';
    public const TEST_BASE_PATH_NAME = 'taoQtiBasePath';
    public const TEST_PLACEHOLDER_BASE_URI = 'tao://qti-directory';
    public const TEST_VIEWS_NAME = 'taoQtiViews';

    public const XML_TEST_PART = 'testPart';
    public const XML_ASSESSMENT_SECTION = 'assessmentSection';
    public const XML_ASSESSMENT_ITEM_REF = 'assessmentItemRef';

    private const IN_PROGRESS_LABEL = 'in progress';

    /**
     * @var MetadataImporter Service to manage Lom metadata during package import
     */
    protected $metadataImporter;

    /**
     * @var bool If true, it will guard and check metadata that comes from package.
     */
    protected $useMetadataGuardians = true;

    /**
     * @var bool If true, items contained in the test must be all found by one metadata guardian.
     */
    protected $itemMustExist = false;

    /**
     * @var bool If true, items found by metadata guardians will be overwritten.
     */
    protected $itemMustBeOverwritten = false;

    /**
     * @var bool If true, registered validators will be invoked for each test item to be imported.
     */
    protected $useMetadataValidators = true;

    public function enableMetadataGuardians()
    {
        $this->useMetadataGuardians = true;
    }

    public function disableMetadataGuardians()
    {
        $this->useMetadataGuardians = false;
    }

    public function enableMetadataValidators()
    {
        $this->useMetadataValidators = true;
    }

    public function disableMetadataValidators()
    {
        $this->useMetadataValidators = false;
    }

    public function enableItemMustExist()
    {
        $this->itemMustExist = true;
    }

    public function disableItemMustExist()
    {
        $this->itemMustExist = false;
    }

    public function enableItemMustBeOverwritten()
    {
        $this->itemMustBeOverwritten = true;
    }

    public function disableItemMustBeOverwritten()
    {
        $this->itemMustBeOverwritten = false;
    }

    /**
     * Get the QTI Test document formated in JSON.
     *
     * @param core_kernel_classes_Resource $test
     *
     * @return string the json
     *
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getJsonTest(core_kernel_classes_Resource $test): string
    {
        $doc = $this->getDoc($test);
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);

        return $converter->toJson();
    }

    /**
     * Checks if target class has all the properties needed to import the metadata.
     * @param array $metadataValues
     * @param array $mappedMetadataValues
     * @return array
     */
    private function checkMissingClassProperties(array $metadataValues, array $mappedMetadataValues): array
    {
        $metadataValueUris = $this->getMetadataImporter()->metadataValueUris($metadataValues);
        return array_diff(
            $metadataValueUris,
            array_keys(array_merge($mappedMetadataValues['testProperties'], $mappedMetadataValues['itemProperties']))
        );
    }

    /**
     * @inheritDoc
     */
    protected function setDefaultModel($test): void
    {
        $this->setTestModel($test, $this->getResource(self::INSTANCE_TEST_MODEL_QTI));
    }

    /**
     * Save the json formated test into the test resource.
     *
     * @param core_kernel_classes_Resource $test
     * @param string $json
     *
     * @return bool true if saved
     *
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     */
    public function saveJsonTest(core_kernel_classes_Resource $test, $json): bool
    {
        $saved = false;

        if (!empty($json)) {
            $this->verifyItemPermissions($test, $json);

            $doc = $this->getDoc($test);

            $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
            $currentIdentifier = $converter->toArray()['identifier'];

            $converter->fromJson($json);

            if (
                $this->getFeatureFlagChecker()->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
                && $currentIdentifier !== $converter->toArray()['identifier']
            ) {
                throw new taoQtiTest_models_classes_QtiTestServiceException(
                    'QTI identifier is unique and cannot be modified'
                );
            }

            $saved = $this->saveDoc($test, $doc);

            # Update the test's updated_at property
            $now = microtime(true);
            $property = $this->getProperty(TaoOntology::PROPERTY_UPDATED_AT);
            $test->editPropertyValues($property, $now);

            $this->getEventManager()->trigger(new TestUpdatedEvent($test->getUri()));
        }
        return $saved;
    }

    public function fromJson($json)
    {
        $doc = new XmlDocument('2.1');
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $converter->fromJson($json);
        return $doc;
    }

    /**
     * Get the items that are part of a given $test.
     *
     * @param core_kernel_classes_Resource $test A Resource describing a QTI Assessment Test.
     * @return array An array of core_kernel_classes_Resource objects. The array is associative. Its keys are actually
     *               the assessmentItemRef identifiers.
     */
    public function getItems(core_kernel_classes_Resource $test)
    {
        return $this->getDocItems($this->getDoc($test));
    }

    /**
     * Assign items to a test and save it.
     * @param core_kernel_classes_Resource $test
     * @param array $items
     * @return boolean true if set
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function setItems(core_kernel_classes_Resource $test, array $items)
    {
        $doc = $this->getDoc($test);
        $bound = $this->setItemsToDoc($doc, $items);

        if ($this->saveDoc($test, $doc)) {
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
    public function save(core_kernel_classes_Resource $test, array $items)
    {
        try {
            $doc = $this->getDoc($test);
            $this->setItemsToDoc($doc, $items);
            $saved = $this->saveDoc($test, $doc);
        } catch (StorageException $e) {
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                "An error occured while dealing with the QTI-XML test: " . $e->getMessage(),
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
     * @param string $qtiType the type name
     * @return string the identifier
     */
    public function getIdentifierFor(XmlDocument $doc, $qtiType)
    {
        $components = $doc->getDocumentComponent()->getIdentifiableComponents();
        $index = 1;
        do {
            $identifier = $this->generateIdentifier($doc, $qtiType, $index);
            $index++;
        } while (!$this->isIdentifierUnique($components, $identifier));

        return $identifier;
    }

    /**
     * Check whether an identifier is unique against a list of components
     *
     * @param QtiComponentCollection $components
     * @param string $identifier
     * @return boolean
     */
    private function isIdentifierUnique(QtiComponentCollection $components, $identifier)
    {
        foreach ($components as $component) {
            if ($component->getIdentifier() == $identifier) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generate an identifier from a qti type, using the syntax "qtitype-index"
     *
     * @param XmlDocument $doc
     * @param string $qtiType
     * @param int $offset
     * @return string the identifier
     */
    private function generateIdentifier(XmlDocument $doc, $qtiType, $offset = 1)
    {
        $typeList = $doc->getDocumentComponent()->getComponentsByClassName($qtiType);
        return $qtiType . '-' . (count($typeList) + $offset);
    }

    /**
     * Import a QTI Test Package containing one or more QTI Test definitions.
     *
     * @param core_kernel_classes_Class $targetClass The Target RDFS class where you want the Test Resources to be
     *                                               created.
     * @param string|File $file The path to the IMS archive you want to import tests from.
     * @return common_report_Report An import report.
     * @throws common_exception
     * @throws common_exception_Error
     * @throws common_exception_FileSystemError
     */
    public function importMultipleTests(
        core_kernel_classes_Class $targetClass,
        $file,
        bool $overwriteTest = false,
        ?string $itemClassUri = null,
        array $form = [],
        ?string $overwriteTestUri = null,
        ?string $packageLabel = null
    ) {
        $testClass = $targetClass;
        $report = new Report(Report::TYPE_INFO);
        $validPackage = false;
        $validManifest = false;
        $testsFound = false;

        $qtiPackageImportPreprocessingService = $this->getQtiPackageImportPreprocessing();
        $preprocessingReport = $qtiPackageImportPreprocessingService->run($file);

        if ($preprocessingReport) {
            $report->add($preprocessingReport);
        }

        // Validate the given IMS Package itself (ZIP integrity, presence of an 'imsmanifest.xml' file.
        // phpcs:disable Generic.Files.LineLength
        $invalidArchiveMsg = __("The provided archive is invalid. Make sure it is not corrupted and that it contains an 'imsmanifest.xml' file.");
        // phpcs:enable Generic.Files.LineLength

        try {
            $qtiPackageParser = new PackageParser($file);
            $qtiPackageParser->validate();
            $validPackage = true;
        } catch (Exception $e) {
            $report->add(Report::createError($invalidArchiveMsg));
        }

        // Validate the manifest (well formed XML, valid against the schema).
        if ($validPackage === true) {
            $folder = $qtiPackageParser->extract();
            if (is_dir($folder) === false) {
                $report->add(Report::createError($invalidArchiveMsg));
            } else {
                $file = $folder . 'imsmanifest.xml';
                $qtiManifestParser = new taoQtiTest_models_classes_ManifestParser($file);
                $this->propagate($qtiManifestParser);
                // For taoSetup PsrContainer is not available
                // It is not required to perform manifest conversion in this process
                // therefore we can skip it during taoSetup
                if ($this->getPsrContainer()->has(ManifestConverter::class)) {
                    $this->getManifestConverter()->convertToQti2($file, $qtiManifestParser);
                }
                // We validate manifest file against QTI 3.0
                $qtiManifestParser->validate();
                if ($qtiManifestParser->isValid() === true) {
                    $validManifest = true;

                    $tests = [];
                    foreach (Resource::getTestTypes() as $type) {
                        $tests = array_merge($tests, $qtiManifestParser->getResources($type));
                    }

                    $testsFound = (count($tests) !== 0);

                    if ($testsFound !== true) {
                        $report->add(
                            Report::createError(
                            // phpcs:disable Generic.Files.LineLength
                                __("Package is valid but no tests were found. Make sure that it contains valid QTI tests.")
                            // phpcs:enable Generic.Files.LineLength
                            )
                        );
                    } else {
                        $alreadyImportedQtiResources = [];

                        foreach ($tests as $qtiTestResource) {
                            $importTestReport = $this->importTest(
                                $testClass,
                                $qtiTestResource,
                                $qtiManifestParser,
                                $folder,
                                $alreadyImportedQtiResources,
                                $overwriteTest,
                                $itemClassUri,
                                !empty($form[TestImportForm::METADATA_FORM_ELEMENT_NAME]) ?? false,
                                $overwriteTestUri,
                                $packageLabel
                            );
                            $report->add($importTestReport);

                            if ($data = $importTestReport->getData()) {
                                $alreadyImportedQtiResources = array_unique(
                                    array_merge(
                                        $alreadyImportedQtiResources,
                                        $data->itemQtiResources
                                    )
                                );
                            }
                        }
                    }
                } else {
                    $msg = __("The 'imsmanifest.xml' file found in the archive is not valid.");
                    $report->add(Report::createError($msg));
                }

                // Cleanup the folder where the archive was extracted.
                tao_helpers_File::deltree($folder);
            }
        }

        if ($report->containsError() === true) {
            $report->setMessage(__('The IMS QTI Test Package could not be imported.'));
            $report->setType(Report::TYPE_ERROR);
        } else {
            $report->setMessage(__('IMS QTI Test Package successfully imported.'));
            $report->setType(Report::TYPE_SUCCESS);
        }

        if (
            $report->containsError() === true
            && $validPackage === true
            && $validManifest === true
            && $testsFound === true
        ) {
            $this->clearRelatedResources($report);
        }

        return $report;
    }

    /**
     * @param common_report_Report $report
     *
     * @throws common_exception_Error
     * @throws common_exception_FileSystemError
     */
    public function clearRelatedResources(common_report_Report $report): void
    {
        // We consider a test package as an atomic component, we then rollback it.
        $itemService = $this->getServiceLocator()->get(taoItems_models_classes_ItemsService::class);

        foreach ($report as $r) {
            $data = $r->getData();

            // -- Rollback all items.
            // 1. Simply delete items that were not involved in overwriting.
            foreach ($data->newItems as $item) {
                if (
                    !$item instanceof MetadataGuardianResource
                    && !array_key_exists($item->getUri(), $data->overwrittenItems)
                ) {
                    common_Logger::d("Rollbacking new item '" . $item->getUri() . "'...");
                    @$itemService->deleteResource($item);
                }
            }

            // 2. Restore overwritten item contents.
            foreach ($data->overwrittenItems as $overwrittenItemId => $backupName) {
                common_Logger::d("Restoring content for item '{$overwrittenItemId}'...");
                @Service::singleton()->restoreContentByRdfItem(
                    new core_kernel_classes_Resource($overwrittenItemId),
                    $backupName
                );
            }

            // Delete all created classes (by registered class lookups).
            foreach ($data->createdClasses as $createdClass) {
                @$createdClass->delete();
            }

            // Delete the target Item RDFS class.
            common_Logger::t("Rollbacking Items target RDFS class '" . $data->itemClass->getLabel() . "'...");
            @$data->itemClass->delete();

            // Delete test definition.
            common_Logger::t("Rollbacking test '" . $data->rdfsResource->getLabel() . "...");
            @$this->deleteTest($data->rdfsResource);

            if (count($data->newItems) > 0) {
                // phpcs:disable Generic.Files.LineLength
                $msg = __("The resources related to the IMS QTI Test referenced as \"%s\" in the IMS Manifest file were rolled back.", $data->manifestResource->getIdentifier());
                // phpcs:enable Generic.Files.LineLength
                $report->add(new common_report_Report(common_report_Report::TYPE_WARNING, $msg));
            }
        }
    }

    /**
     * Import a QTI Test and its dependent Items into the TAO Platform.
     *
     * @param core_kernel_classes_Class $testClass The RDFS Class where Ontology resources must be created.
     * @param oat\taoQtiItem\model\qti\Resource $qtiTestResource The QTI Test Resource representing the IMS QTI Test to
     *                                                           be imported.
     * @param taoQtiTest_models_classes_ManifestParser $manifestParser The parser used to retrieve the IMS Manifest.
     * @param string $folder The absolute path to the folder where the IMS archive containing the test content
     * @param oat\taoQtiItem\model\qti\Resource[] $ignoreQtiResources An array of QTI Manifest Resources to be ignored
     *                                                                at import time.
     * @return common_report_Report A report about how the importation behaved.
     */
    protected function importTest(
        core_kernel_classes_Class $testClass,
        Resource $qtiTestResource,
        taoQtiTest_models_classes_ManifestParser $manifestParser,
        $folder,
        array $ignoreQtiResources = [],
        bool $overwriteTest = false,
        ?string $itemClassUri = null,
        bool $importMetadata = false,
        ?string $overwriteTestUri = null,
        ?string $packageLabel = null
    ) {
        /** @var ImportService $itemImportService */
        $itemImportService = $this->getServiceLocator()->get(ImportService::SERVICE_ID);
        $qtiTestResourceIdentifier = $qtiTestResource->getIdentifier();

        // The class where the items that belong to the test will be imported.
        $itemParentClass = $this->getClass($itemClassUri ?: TaoOntology::CLASS_URI_ITEM);

        // Create an RDFS resource in the knowledge base that will hold
        // the information about the imported QTI Test.

        $testResource = $this->createInstance($testClass, self::IN_PROGRESS_LABEL);
        $qtiTestModelResource = $this->getResource(self::INSTANCE_TEST_MODEL_QTI);
        $modelProperty = $this->getProperty(TestService::PROPERTY_TEST_TESTMODEL);
        $testResource->editPropertyValues($modelProperty, $qtiTestModelResource);

        // Setting qtiIdentifier property
        $qtiIdentifierProperty = $this->getProperty(self::PROPERTY_QTI_TEST_IDENTIFIER);
        $testResource->editPropertyValues($qtiIdentifierProperty, $qtiTestResourceIdentifier);

        // Create the report that will hold information about the import
        // of $qtiTestResource in TAO.
        $report = new Report(Report::TYPE_INFO);

        // Load and validate the manifest
        $qtiManifestParser = new taoQtiTest_models_classes_ManifestParser($folder . 'imsmanifest.xml');
        $this->propagate($qtiManifestParser);
        $qtiManifestParser->validate();

        $domManifest = new DOMDocument('1.0', 'UTF-8');
        $domManifest->load($folder . 'imsmanifest.xml');

        $metadataValues = $this->getMetadataImporter()->extract($domManifest);

        // Note: without this fix, metadata guardians do not work.
        $this->getMetadataImporter()->setMetadataValues($metadataValues);

        // Set up $report with useful information for client code (especially for rollback).
        $reportCtx = new stdClass();
        $reportCtx->manifestResource = $qtiTestResource;
        $reportCtx->rdfsResource = $testResource;
        $reportCtx->items = [];
        $reportCtx->newItems = [];
        $reportCtx->overwrittenItems = [];
        $reportCtx->itemQtiResources = [];
        $reportCtx->testMetadata = $metadataValues[$qtiTestResourceIdentifier] ?? [];
        $reportCtx->createdClasses = [];

        // 'uriResource' key is needed by javascript in tao/views/templates/form/import.tpl
        $reportCtx->uriResource = $testResource->getUri();

        // Expected test.xml file location.
        $expectedTestFile = $folder . str_replace('/', DIRECTORY_SEPARATOR, $qtiTestResource->getFile());

        // Already imported test items (qti xml file paths).
        $alreadyImportedTestItemFiles = [];

        // -- Check if the file referenced by the test QTI resource exists.
        if (is_readable($expectedTestFile) === false) {
            $report->add(
                Report::createError(
                    __('No file found at location "%s".', $qtiTestResource->getFile())
                )
            );
        } else {
            //Convert to QTI 2.2
            if ($this->getPsrContainer()->has(TestConverter::class)) {
                $this->getTestConverter()->convertToQti2($expectedTestFile);
            }
            // -- Load the test in a QTISM flavour.
            $testDefinition = new XmlDocument();

            try {
                $testDefinition->load($expectedTestFile, true);
                $this->convertAssessmentSectionRefs(
                    $testDefinition->getDocumentComponent()
                        ->getComponentsByClassName('assessmentSectionRef'),
                    $folder
                );
                // If any, assessmentSectionRefs will be resolved and included as part of the main test definition.
                $testDefinition->includeAssessmentSectionRefs(true);
                $testLabel = $packageLabel ?? $this->getTestLabel($reportCtx->testMetadata, $testDefinition);

                if ($overwriteTestUri || $overwriteTest) {
                    $itemsClassLabel = $testLabel;

                    /** @var oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue $singleMetadata */
                    foreach ($reportCtx->testMetadata as $singleMetadata) {
                        if (($singleMetadata->getPath()[1] ?? '') === RDFS_LABEL) {
                            $testLabel = $singleMetadata->getValue();
                        }
                    }

                    $this->deleteItemSubclassesByLabel($itemParentClass, $itemsClassLabel);
                    $overwriteTestUri
                        ? $this->getTestService()->deleteTest(new core_kernel_classes_Resource($overwriteTestUri))
                        : $this->deleteTestsFromClassByLabel($testLabel, $testClass);
                }

                $targetItemClass = $itemParentClass->createSubClass(self::IN_PROGRESS_LABEL);

                // add real label without saving (to not pass it separately to item importer)
                $targetItemClass->label = $testLabel;

                $reportCtx->itemClass = $targetItemClass;

                $mappedProperties = $this->getMappedProperties(
                    $importMetadata,
                    $domManifest,
                    $reportCtx,
                    $testClass,
                    $targetItemClass
                );

                // -- Load all items related to test.
                $itemError = false;

                // discover test's base path.
                $dependencies = taoQtiTest_helpers_Utils::buildAssessmentItemRefsTestMap(
                    $testDefinition,
                    $manifestParser,
                    $folder
                );

                // Build a DOM version of the fully resolved AssessmentTest for later usage.
                $transitionalDoc = new DOMDocument('1.0', 'UTF-8');
                $transitionalDoc->loadXML($testDefinition->saveToString());

                /** @var CatService $service */
                $service = $this->getServiceLocator()->get(CatService::SERVICE_ID);
                $service->importCatSectionIdsToRdfTest(
                    $testResource,
                    $testDefinition->getDocumentComponent(),
                    $expectedTestFile
                );

                if (count($dependencies['items']) > 0) {
                    // Stores shared files across multiple items to avoid duplicates.
                    $sharedFiles = [];

                    foreach ($dependencies['items'] as $assessmentItemRefId => $qtiDependency) {
                        if ($qtiDependency !== false) {
                            if (Resource::isAssessmentItem($qtiDependency->getType())) {
                                $resourceIdentifier = $qtiDependency->getIdentifier();

                                if (!array_key_exists($resourceIdentifier, $ignoreQtiResources)) {
                                    $qtiFile = $folder
                                        . str_replace('/', DIRECTORY_SEPARATOR, $qtiDependency->getFile());

                                    // If metadata should be aware of the test context...
                                    foreach ($this->getMetadataImporter()->getExtractors() as $extractor) {
                                        if ($extractor instanceof MetadataTestContextAware) {
                                            $metadataValues = array_merge(
                                                $metadataValues,
                                                $extractor->contextualizeWithTest(
                                                    $qtiTestResource->getIdentifier(),
                                                    $transitionalDoc,
                                                    $resourceIdentifier,
                                                    $metadataValues
                                                )
                                            );
                                        }
                                    }
                                    // Skip if $qtiFile already imported (multiple assessmentItemRef "hrefing" the same
                                    // file).
                                    if (array_key_exists($qtiFile, $alreadyImportedTestItemFiles) === false) {
                                        $createdClasses = [];

                                        $itemReport = $itemImportService->importQtiItem(
                                            $folder,
                                            $qtiDependency,
                                            $targetItemClass,
                                            $sharedFiles,
                                            $dependencies['dependencies'],
                                            $metadataValues,
                                            $createdClasses,
                                            $this->useMetadataGuardians,
                                            $this->useMetadataValidators,
                                            $this->itemMustExist,
                                            $this->itemMustBeOverwritten,
                                            $reportCtx->overwrittenItems,
                                            $mappedProperties['itemProperties'] ?? [],
                                            $importMetadata
                                        );

                                        $reportCtx->createdClasses = array_merge(
                                            $reportCtx->createdClasses,
                                            $createdClasses
                                        );

                                        $rdfItem = $itemReport->getData();

                                        if ($rdfItem) {
                                            $reportCtx->items[$assessmentItemRefId] = $rdfItem;
                                            $reportCtx->newItems[$assessmentItemRefId] = $rdfItem;
                                            $reportCtx->itemQtiResources[$resourceIdentifier] = $rdfItem;
                                            $alreadyImportedTestItemFiles[$qtiFile] = $rdfItem;
                                        } else {
                                            if (!$itemReport->getMessage()) {
                                                $itemReport->setMessage(
                                                    // phpcs:disable Generic.Files.LineLength
                                                    __('IMS QTI Item referenced as "%s" in the IMS Manifest file could not be imported.', $resourceIdentifier)
                                                    // phpcs:enable Generic.Files.LineLength
                                                );
                                            }

                                            $itemReport->setType(common_report_Report::TYPE_ERROR);
                                            $itemError = ($itemError === false) ? true : $itemError;
                                        }

                                        $report->add($itemReport);
                                    } else {
                                        // phpcs:disable Generic.Files.LineLength
                                        $reportCtx->items[$assessmentItemRefId] = $alreadyImportedTestItemFiles[$qtiFile];
                                        // phpcs:enable Generic.Files.LineLength
                                    }
                                } else {
                                    // Ignored (possibily because imported in another test of the same package).
                                    $reportCtx->items[$assessmentItemRefId] = $ignoreQtiResources[$resourceIdentifier];
                                    $report->add(
                                        new common_report_Report(
                                            common_report_Report::TYPE_SUCCESS,
                                            // phpcs:disable Generic.Files.LineLength
                                            __('IMS QTI Item referenced as "%s" in the IMS Manifest file successfully imported.', $resourceIdentifier)
                                            // phpcs:enable Generic.Files.LineLength
                                        )
                                    );
                                }
                            }
                        } else {
                            // phpcs:disable Generic.Files.LineLength
                            $msg = __('The dependency to the IMS QTI AssessmentItemRef "%s" in the IMS Manifest file could not be resolved.', $assessmentItemRefId);
                            // phpcs:enable Generic.Files.LineLength
                            $report->add(common_report_Report::createFailure($msg));
                            $itemError = ($itemError === false) ? true : $itemError;
                        }
                    }

                    // If items did not produce errors, we import the test definition.
                    if ($itemError === false) {
                        common_Logger::i("Importing test with manifest identifier '{$qtiTestResourceIdentifier}'...");

                        // Second step is to take care of the test definition and the related media (auxiliary files).

                        // 1. Import test definition (i.e. the QTI-XML Test file).
                        $testContent = $this->importTestDefinition(
                            $testResource,
                            $testDefinition,
                            $qtiTestResource,
                            $reportCtx->items,
                            $folder,
                            $report
                        );

                        if ($testContent !== false) {
                            // 2. Import test auxilliary files (e.g. stylesheets, images, ...).
                            $this->importTestAuxiliaryFiles($testContent, $qtiTestResource, $folder, $report);

                            // 3. Give meaningful names to resources.
                            $testResource->setLabel($packageLabel ?? $testLabel);
                            $targetItemClass->setLabel($packageLabel ?? $testLabel);

                            // 4. Import metadata for the resource (use same mechanics as item resources).
                            // Metadata will be set as property values.
                            //todo: fix taoSetup to be aware of containers. This is only workaround.
                            if (
                                $this->getServiceManager()->getContainer()->has(MappedMetadataInjector::class)
                                && $importMetadata
                            ) {
                                $this->getServiceManager()->getContainer()->get(MappedMetadataInjector::class)->inject(
                                    $mappedProperties['testProperties'] ?? [],
                                    $metadataValues[$qtiTestResourceIdentifier] ?? [],
                                    $testResource
                                );
                            }


                            // 5. if $targetClass does not contain any instances
                            // (because everything resolved by class lookups),
                            // Just delete it.
                            if ($targetItemClass->countInstances() == 0) {
                                $targetItemClass->delete();
                            }
                        }
                    } else {
                        $msg = __("One or more dependent IMS QTI Items could not be imported.");
                        $report->add(common_report_Report::createFailure($msg));
                    }
                } else {
                    // No depencies found (i.e. no item resources bound to the test).
                    $msg = __("No reference to any IMS QTI Item found.");
                    $report->add(common_report_Report::createFailure($msg));
                }
            } catch (StorageException $e) {
                // Source of the exception = $testDefinition->load()
                // What is the reason ?
                $eStrs = [];

                if (($libXmlErrors = $e->getErrors()) !== null) {
                    foreach ($libXmlErrors as $libXmlError) {
                        // phpcs:disable Generic.Files.LineLength
                        $eStrs[] = __('XML error at line %1$d column %2$d "%3$s".', $libXmlError->line, $libXmlError->column, trim($libXmlError->message));
                        // phpcs:enable Generic.Files.LineLength
                    }
                }

                $finalErrorString = implode("\n", $eStrs);
                if (empty($finalErrorString) === true) {
                    common_Logger::e($e->getMessage());
                    // Not XML malformation related. No info from LibXmlErrors extracted.
                    if (($previous = $e->getPrevious()) != null) {
                        // Useful information could be found here.
                        $finalErrorString = $previous->getMessage();

                        if ($previous instanceof UnmarshallingException) {
                            $domElement = $previous->getDOMElement();
                            // phpcs:disable Generic.Files.LineLength
                            $finalErrorString = __('Inconsistency at line %1d:', $domElement->getLineNo()) . ' ' . $previous->getMessage();
                            // phpcs:enable Generic.Files.LineLength
                        }
                    } elseif ($e->getMessage() !== '') {
                        $finalErrorString = $e->getMessage();
                    } else {
                        $finalErrorString = __("Unknown error.");
                    }
                }

                $msg = __("Error found in the IMS QTI Test:\n%s", $finalErrorString);
                $report->add(common_report_Report::createFailure($msg));
            } catch (PropertyDoesNotExistException $e) {
                $reportCtx->itemClass = $targetItemClass;
                $report->add(Report::createError($e->getMessage()));
            } catch (CatEngineNotFoundException $e) {
                $report->add(
                    new common_report_Report(
                        common_report_Report::TYPE_ERROR,
                        __('No CAT Engine configured for CAT Endpoint "%s".', $e->getRequestedEndpoint())
                    )
                );
            } catch (AdaptiveSectionInjectionException $e) {
                $report->add(
                    new common_report_Report(
                        common_report_Report::TYPE_ERROR,
                        // phpcs:disable Generic.Files.LineLength
                        __("Items with assessmentItemRef identifiers \"%s\" are not registered in the related CAT endpoint.", implode(', ', $e->getInvalidItemIdentifiers()))
                        // phpcs:enable Generic.Files.LineLength
                    )
                );
            }
        }

        $report->setData($reportCtx);

        if ($report->containsError() === false) {
            $report->setType(common_report_Report::TYPE_SUCCESS);
            // phpcs:disable Generic.Files.LineLength
            $msg = __("IMS QTI Test referenced as \"%s\" in the IMS Manifest file successfully imported.", $qtiTestResource->getIdentifier());
            // phpcs:enable Generic.Files.LineLength
            $report->setMessage($msg);
            $eventManager = $this->getEventManager();

            $eventManager->trigger(new ResourceCreated($testResource));
            $eventManager->trigger(new TestImportedEvent($testResource->getUri()));
        } else {
            $report->setType(common_report_Report::TYPE_ERROR);
            // phpcs:disable Generic.Files.LineLength
            $msg = __("The IMS QTI Test referenced as \"%s\" in the IMS Manifest file could not be imported.", $qtiTestResource->getIdentifier());
            // phpcs:enable Generic.Files.LineLength
            $report->setMessage($msg);
        }

        return $report;
    }

    /**
     * @throws common_Exception
     */
    private function deleteTestsFromClassByLabel(string $testLabel, core_kernel_classes_Resource $testClass): void
    {
        $testService = $this->getTestService();

        foreach ($testClass->getInstances() as $testInstance) {
            if ($testInstance->getLabel() === $testLabel) {
                $testService->deleteTest($testInstance);
            }
        }
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
     * @param Resource $qtiResource The manifest resource describing the test to be imported.
     * @param array $itemMapping An associative array that represents the mapping between assessmentItemRef elements
     *                           and the imported items.
     * @param string $extractionFolder The absolute path to the temporary folder containing the content of the imported
     *                                 IMS QTI Package Archive.
     * @param common_report_Report $report A Report object to be filled during the import.
     * @return Directory The newly created test content.
     * @throws taoQtiTest_models_classes_QtiTestServiceException If an unexpected runtime error occurs.
     */
    protected function importTestDefinition(
        core_kernel_classes_Resource $testResource,
        XmlDocument $testDefinition,
        Resource $qtiResource,
        array $itemMapping,
        $extractionFolder,
        common_report_Report $report
    ) {

        foreach ($itemMapping as $itemRefId => $itemResource) {
            $itemRef = $testDefinition->getDocumentComponent()->getComponentByIdentifier($itemRefId);
            $itemRef->setHref($itemResource->getUri());
        }

        $oldFile = $this->getQtiTestFile($testResource);
        $oldFile->delete();

        $ds = DIRECTORY_SEPARATOR;
        $path = dirname($qtiResource->getFile()) . $ds . self::TAOQTITEST_FILENAME;
        $dir = $this->getQtiTestDir($testResource);
        $newFile = $dir->getFile($path);
        $newFile->write($testDefinition->saveToString());
        $this->setQtiIndexFile($dir, $path);
        return $this->getQtiTestDir($testResource);
    }

    /**
     *
     * @param Directory $dir
     * @param $path
     * @return bool
     */
    protected function setQtiIndexFile(Directory $dir, $path)
    {
        $newFile = $dir->getFile(self::QTI_TEST_DEFINITION_INDEX);
        return $newFile->put($path);
    }

    /**
     * @param Directory $dir
     * @return false|string
     */
    protected function getQtiDefinitionPath(Directory $dir)
    {
        $index = $dir->getFile(self::QTI_TEST_DEFINITION_INDEX);
        if ($index->exists()) {
            return $index->read();
        }
        return false;
    }

    /**
     * Imports the auxiliary files (file elements contained in the resource test element to be imported) into
     * the TAO Test Content directory.
     *
     * If some file cannot be copied, warnings will be committed.
     *
     * @param Directory $testContent The pointer to the TAO Test Content directory where auxilliary files will be
     *                               stored.
     * @param Resource $qtiResource The manifest resource describing the test to be imported.
     * @param string $extractionFolder The absolute path to the temporary folder containing the content of the imported
     *                                 IMS QTI Package Archive.
     * @param common_report_Report A report about how the importation behaved.
     */
    protected function importTestAuxiliaryFiles(
        Directory $testContent,
        Resource $qtiResource,
        $extractionFolder,
        common_report_Report $report
    ) {

        foreach ($qtiResource->getAuxiliaryFiles() as $aux) {
            try {
                taoQtiTest_helpers_Utils::storeQtiResource($testContent, $aux, $extractionFolder);
            } catch (common_Exception $e) {
                $report->add(
                    new common_report_Report(
                        common_report_Report::TYPE_WARNING,
                        __('Auxiliary file not found at location "%s".', $aux)
                    )
                );
            }
        }
    }

    /**
     * Get the File object corresponding to the location
     * of the test content (a directory!) on the file system.
     *
     * @param core_kernel_classes_Resource $test
     * @return null|File
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getTestFile(core_kernel_classes_Resource $test)
    {
        $testModel = $test->getOnePropertyValue($this->getProperty(TestService::PROPERTY_TEST_TESTMODEL));
        if (is_null($testModel) || $testModel->getUri() != self::INSTANCE_TEST_MODEL_QTI) {
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                'The selected test is not a QTI test',
                taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
            );
        }
        $file = $test->getOnePropertyValue($this->getProperty(TestService::PROPERTY_TEST_CONTENT));

        if (!is_null($file)) {
            return $this->getFileReferenceSerializer()->unserializeFile($file->getUri());
        }

        return null;
    }

    /**
     * Get the QTI reprensentation of a test content.
     *
     * @param core_kernel_classes_Resource $test the test to get the content from
     * @return XmlDocument the QTI representation from the test content
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function getDoc(core_kernel_classes_Resource $test)
    {
        $doc = new XmlDocument('2.1');
        $doc->loadFromString($this->getQtiTestFile($test)->read());
        return $doc;
    }

    /**
     * Get the path of the QTI XML test definition of a given $test resource.
     *
     * @param core_kernel_classes_Resource $test
     * @throws Exception If no QTI-XML or multiple QTI-XML test definition were found.
     * @return string The absolute path to the QTI XML Test definition related to $test.
     */
    public function getDocPath(core_kernel_classes_Resource $test)
    {
        $file = $this->getQtiTestFile($test);
        return $file->getBasename();
    }

    /**
     * Get the items from a QTI test document.
     *
     * @param \qtism\data\storage\xml\XmlDocument $doc The QTI XML document to be inspected to retrieve the items.
     * @return core_kernel_classes_Resource[] An array of core_kernel_classes_Resource object indexed by
     *                                        assessmentItemRef->identifier (string).
     */
    private function getDocItems(XmlDocument $doc)
    {
        $itemArray = [];
        foreach ($doc->getDocumentComponent()->getComponentsByClassName('assessmentItemRef') as $itemRef) {
            $itemArray[$itemRef->getIdentifier()] = $this->getResource($itemRef->getHref());
        }
        return $itemArray;
    }

    /**
     * Assign items to a QTI test.
     * @param XmlDocument $doc
     * @param array $items
     * @return int
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    private function setItemsToDoc(XmlDocument $doc, array $items, $sectionIndex = 0)
    {

        $sections = $doc->getDocumentComponent()->getComponentsByClassName('assessmentSection');
        if (!isset($sections[$sectionIndex])) {
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                'No section found in test at index : ' . $sectionIndex,
                taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
            );
        }
        $section = $sections[$sectionIndex];

        $itemRefs = new SectionPartCollection();
        $itemRefIdentifiers = [];
        foreach ($items as $itemResource) {
            $itemDoc = new XmlDocument();

            try {
                $itemDoc->loadFromString(Service::singleton()->getXmlByRdfItem($itemResource));
            } catch (StorageException $e) {
                // We consider the item not compliant with QTI, let's try the next one.
                continue;
            }

            $itemRefIdentifier = $itemDoc->getDocumentComponent()->getIdentifier();

            //enable more than one reference
            if (array_key_exists($itemRefIdentifier, $itemRefIdentifiers)) {
                $itemRefIdentifiers[$itemRefIdentifier] += 1;
                $itemRefIdentifier .= '-' . $itemRefIdentifiers[$itemRefIdentifier];
            } else {
                $itemRefIdentifiers[$itemRefIdentifier] = 0;
            }
            $itemRefs[] = new AssessmentItemRef($itemRefIdentifier, $itemResource->getUri());
        }
        $section->setSectionParts($itemRefs);

        return count($itemRefs);
    }

    /**
     * Get root qti test directory or crate if not exists
     *
     * @param core_kernel_classes_Resource $test
     * @param boolean $createTestFile Whether or not create an empty QTI XML test file. Default is
     *                                                     (boolean) true.
     *
     * @return Directory
     *
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     * @throws common_exception_InconsistentData
     * @throws core_kernel_persistence_Exception
     */
    public function getQtiTestDir(core_kernel_classes_Resource $test, $createTestFile = true)
    {
        $testModel = $this->getServiceLocator()->get(TestService::class)->getTestModel($test);

        if ($testModel->getUri() !== self::INSTANCE_TEST_MODEL_QTI) {
            throw new taoQtiTest_models_classes_QtiTestServiceException(
                'The selected test is not a QTI test',
                taoQtiTest_models_classes_QtiTestServiceException::TEST_READ_ERROR
            );
        }

        $dir = $test->getOnePropertyValue($this->getProperty(TestService::PROPERTY_TEST_CONTENT));

        if (null !== $dir) {
            /** @noinspection PhpIncompatibleReturnTypeInspection */
            return $this->getFileReferenceSerializer()->unserialize($dir);
        }

        return $this->createContent($test, $createTestFile);
    }

    protected function searchInTestDirectory(Directory $dir)
    {
        $iterator = $dir->getFlyIterator(Directory::ITERATOR_RECURSIVE | Directory::ITERATOR_FILE);
        $files = [];

        /**
         * @var File $file
         */
        foreach ($iterator as $file) {
            if ($file->getBasename() === self::TAOQTITEST_FILENAME) {
                $files[] = $file;
                break;
            }
        }

        if (empty($files)) {
            throw new Exception('No QTI-XML test file found.');
        }

        $file = current($files);
        $fileName = str_replace($dir->getPrefix() . '/', '', $file->getPrefix());
        $this->setQtiIndexFile($dir, $fileName);

        return $file;
    }

    /**
     * Return the File containing the test definition
     * If it doesn't exist, it will be created
     *
     * @param core_kernel_classes_Resource $test
     * @throws \Exception If file is not found.
     * @return File
     */
    public function getQtiTestFile(core_kernel_classes_Resource $test)
    {

        $dir = $this->getQtiTestDir($test);

        $file = $this->getQtiDefinitionPath($dir);

        if (!empty($file)) {
            return $dir->getFile($file);
        }
        return $this->searchInTestDirectory($dir);
    }

    /**
     *
     * @param core_kernel_classes_Resource $test
     * @throws Exception
     * @return string
     */
    public function getRelTestPath(core_kernel_classes_Resource $test)
    {
        $testRootDir = $this->getQtiTestDir($test);
        return $testRootDir->getRelPath($this->getQtiTestFile($test));
    }

    /**
     * Save the content of test from a QTI Document
     * @param core_kernel_classes_Resource $test
     * @param qtism\data\storage\xml\XmlDocument $doc
     * @return boolean true if saved
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    private function saveDoc(core_kernel_classes_Resource $test, XmlDocument $doc)
    {
        $file = $this->getQtiTestFile($test);
        return $file->update($doc->saveToString());
    }

    /**
     * Create the default content directory of a QTI test.
     *
     * @param core_kernel_classes_Resource $test
     * @param boolean $createTestFile Whether or not create an empty QTI XML test file. Default is (boolean) true.
     * @param boolean $preventOverride Prevent data to be overriden Default is (boolean) true.
     *
     * @return Directory the content directory
     * @throws XmlStorageException
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData In case of trying to override existing data.
     * @throws common_ext_ExtensionException
     * @throws taoQtiTest_models_classes_QtiTestServiceException If a runtime error occurs while creating the
     *                                                           test content.
     */
    public function createContent(core_kernel_classes_Resource $test, $createTestFile = true, $preventOverride = true)
    {
        $dir = $this->getDefaultDir()->getDirectory(md5($test->getUri()));
        if ($dir->exists() && $preventOverride === true) {
            throw new common_exception_InconsistentData(
                'Data directory for test ' . $test->getUri() . ' already exists.'
            );
        }

        $file = $dir->getFile(self::TAOQTITEST_FILENAME);

        if ($createTestFile === true) {
            /** @var AssessmentTestXmlFactory $xmlBuilder */
            $xmlBuilder = $this->getServiceLocator()->get(AssessmentTestXmlFactory::class);

            $testLabel = $test->getLabel();
            $identifier = $this->createTestIdentifier($test);
            $xml = $xmlBuilder->create($identifier, $testLabel);

            if (!$file->write($xml)) {
                throw new taoQtiTest_models_classes_QtiTestServiceException(
                    'Unable to write raw QTI Test template.',
                    taoQtiTest_models_classes_QtiTestServiceException::TEST_WRITE_ERROR
                );
            }

            common_Logger::t("Created QTI Test content for test '" . $test->getUri() . "'.");
        } elseif ($file->exists()) {
            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->loadXML($file->read());

            // Label update only.
            $doc->documentElement->setAttribute('title', $test->getLabel());

            if (!$file->update($doc->saveXML())) {
                $msg = 'Unable to update QTI Test file.';
                throw new taoQtiTest_models_classes_QtiTestServiceException(
                    $msg,
                    taoQtiTest_models_classes_QtiTestServiceException::TEST_WRITE_ERROR
                );
            }
        }

        $directory = $this->getFileReferenceSerializer()->serialize($dir);
        $test->editPropertyValues($this->getProperty(TestService::PROPERTY_TEST_CONTENT), $directory);

        return $dir;
    }

    /**
     * Delete the content of a QTI test
     * @param core_kernel_classes_Resource $test
     * @throws common_exception_Error
     */
    public function deleteContent(core_kernel_classes_Resource $test)
    {
        $content = $test->getOnePropertyValue($this->getProperty(TestService::PROPERTY_TEST_CONTENT));

        if (!is_null($content)) {
            $dir = $this->getFileReferenceSerializer()->unserialize($content);
            $dir->deleteSelf();
            $this->getFileReferenceSerializer()->cleanUp($content);
            $test->removePropertyValue($this->getProperty(TestService::PROPERTY_TEST_CONTENT), $content);
        }
    }

    /**
     * Set the directory where the tests' contents are stored.
     * @param string $fsId
     */
    public function setQtiTestFileSystem($fsId)
    {
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $ext->setConfig(self::CONFIG_QTITEST_FILESYSTEM, $fsId);
    }

    /**
     * Get the default directory where the tests' contents are stored.
     * replaces getQtiTestFileSystem
     *
     * @return Directory
     */
    public function getDefaultDir()
    {
        $ext = $this
            ->getServiceLocator()
            ->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoQtiTest');
        $fsId = $ext->getConfig(self::CONFIG_QTITEST_FILESYSTEM);
        return $this->getServiceLocator()->get(FileSystemService::SERVICE_ID)->getDirectory($fsId);
    }

    /**
     * Set the acceptable latency time (applied on qti:timeLimits->minTime, qti:timeLimits:maxTime).
     *
     * @param string $duration An ISO 8601 Duration.
     * @see http://www.php.net/manual/en/dateinterval.construct.php PHP's interval_spec format (based on ISO 8601).
     */
    public function setQtiTestAcceptableLatency($duration)
    {
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $ext->setConfig(self::CONFIG_QTITEST_ACCEPTABLE_LATENCY, $duration);
    }

    /**
     * Get the acceptable latency time (applied on qti:timeLimits->minTime, qti:timeLimits->maxTime).
     *
     * @throws common_Exception If no value can be found as the acceptable latency in the extension's configuration
     *                          file.
     * @return string An ISO 8601 Duration.
     * @see http://www.php.net/manual/en/dateinterval.construct.php PHP's interval_spec format (based on ISO 8601).
     */
    public function getQtiTestAcceptableLatency()
    {
        $ext = $this->getServiceLocator()->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoQtiTest');
        $latency = $ext->getConfig(self::CONFIG_QTITEST_ACCEPTABLE_LATENCY);
        if (empty($latency)) {
            // Default duration for legacy code or missing config.
            return 'PT5S';
        }
        return $latency;
    }

    /**
     *
     * @deprecated
     *
     * Get the content of the QTI Test template file as an XML string.
     *
     * @return string|boolean The QTI Test template file content or false if it could not be read.
     */
    public function getQtiTestTemplateFileAsString()
    {
        $ext = $this
            ->getServiceLocator()
            ->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoQtiTest');
        return file_get_contents(
            $ext->getDir() . 'models' . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'qtiTest.xml'
        );
    }

    /**
     * Get the lom metadata importer
     *
     * @return MetadataImporter
     */
    protected function getMetadataImporter()
    {
        if (!$this->metadataImporter) {
            $this->metadataImporter = $this->getServiceLocator()->get(MetadataService::SERVICE_ID)->getImporter();
        }
        return $this->metadataImporter;
    }

    private function getMetaMetadataExtractor(): MetaMetadataExtractor
    {
        return $this->getPsrContainer()->get(MetaMetadataExtractor::class);
    }

    private function getSecureResourceService(): SecureResourceServiceInterface
    {
        return $this->getServiceLocator()->get(SecureResourceServiceInterface::SERVICE_ID);
    }

    /**
     * @param core_kernel_classes_Resource $oldTest
     * @param string $json
     *
     * @throws ResourceAccessDeniedException
     */
    private function verifyItemPermissions(core_kernel_classes_Resource $oldTest, string $json): void
    {
        $array = json_decode($json, true);

        $ids = [];

        $oldItemIds = [];
        foreach ($this->getTestItems($oldTest) as $item) {
            $oldItemIds[] = $item->getUri();
        }

        foreach ($array['testParts'] ?? [] as $testPart) {
            foreach ($testPart['assessmentSections'] ?? [] as $assessmentSection) {
                foreach ($assessmentSection['sectionParts'] ?? [] as $item) {
                    if (
                        isset($item['href'])
                        && !in_array($item['href'], $oldItemIds)
                        && $item['qti-type'] ?? '' === self::XML_ASSESSMENT_ITEM_REF
                    ) {
                        $ids[] = $item['href'];
                    }
                }
            }
        }

        $this->getSecureResourceService()->validatePermissions($ids, ['READ']);
    }

    private function deleteItemSubclassesByLabel(core_kernel_classes_Class $root, string $label): void
    {
        $itemTreeService = $this->getItemTreeService();

        foreach ($root->getSubClasses() as $subClass) {
            if ($subClass->getLabel() !== $label) {
                continue;
            }

            foreach ($subClass->getInstances(true) as $instance) {
                $itemTreeService->delete(new DeleteItemCommand($instance, true));
            }

            $itemTreeService->deleteClass($subClass);
        }
    }

    private function getQtiPackageImportPreprocessing(): QtiPackageImportPreprocessing
    {
        return $this->getPsrContainer()->get(QtiPackageImportPreprocessing::SERVICE_ID);
    }

    private function getItemTreeService(): taoItems_models_classes_ItemsService
    {
        return $this->getPsrContainer()->get(taoItems_models_classes_ItemsService::class);
    }

    private function getTestService(): taoTests_models_classes_TestsService
    {
        return $this->getPsrContainer()->get(taoTests_models_classes_TestsService::class);
    }

    private function getPsrContainer(): ContainerInterface
    {
        return $this->getServiceLocator()->getContainer();
    }

    private function getMetaMetadataImporter(): MetaMetadataImportMapper
    {
        return $this->getServiceManager()->getContainer()->get(MetaMetadataImportMapper::class);
    }

    /**
     * @throws PropertyDoesNotExistException
     * @throws \oat\tao\model\metadata\exception\MetadataImportException
     */
    private function getMappedProperties(
        bool $importMetadata,
        DOMDocument $domManifest,
        stdClass $reportCtx,
        core_kernel_classes_Class $testClass,
        core_kernel_classes_Class $targetItemClass
    ): array {
        if ($importMetadata === true) {
            $metaMetadataValues = $this->getMetaMetadataExtractor()->extract($domManifest);
            $reportCtx->metaMetadata = $metaMetadataValues;

            $mappedMetadataValues = $this->getMetaMetadataImporter()
                ->mapMetaMetadataToProperties($metaMetadataValues, $targetItemClass, $testClass);

            $metadataValues = $this->getMetadataImporter()->extract($domManifest);
            $notMatchingProperties = $this->checkMissingClassProperties($metadataValues, $mappedMetadataValues);
            if (!empty($notMatchingProperties)) {
                $message['checksum_result'] = false;
                $message['label'] = implode(', ', $notMatchingProperties);
                throw new PropertyDoesNotExistException($message);
            }
            if (empty($mappedMetadataValues)) {
                $mappedMetadataValues = $this->getMetaMetadataImporter()->mapMetadataToProperties(
                    $metadataValues,
                    $targetItemClass,
                    $testClass
                );
            }
            return $mappedMetadataValues;
        }

        return [];
    }

    private function getIdentifierGenerator(): ?IdentifierGeneratorInterface
    {
        try {
            return $this->getPsrContainer()->get(IdentifierGeneratorProxy::class);
        } catch (Throwable $exception) {
            return null;
        }
    }

    private function createTestIdentifier(core_kernel_classes_Resource $test): string
    {
        $generator = $this->getIdentifierGenerator();
        $testLabel = $test->getLabel();

        if ($generator) {
            return $generator->generate([IdentifierGeneratorInterface::OPTION_RESOURCE => $test]);
        }

        $identifier = null;

        if (preg_match('/^\d/', $testLabel)) {
            $identifier = 't_' . $testLabel;
        }

        return str_replace('_', '-', Format::sanitizeIdentifier($identifier));
    }

    private function getTestLabel(array $testMetadata, XmlDocument $testDefinition): string
    {
        $labelMetadata = array_filter($testMetadata, function ($metadata) {
            return in_array(RDFS_LABEL, $metadata->getPath());
        });

        if (empty($labelMetadata)) {
            if ($testDefinition->getDocumentComponent() === null) {
                throw new Exception('No metadata label found for test and no title in the test definition.');
            }

            common_Logger::w('No metadata label found for test. Using the title from the test definition.');
            return $testDefinition->getDocumentComponent()->getTitle();
        }

        if (count($labelMetadata) > 1) {
            common_Logger::w('Multiple labels found for test. Using the first one.');
        }

        return reset($labelMetadata)->getValue();
    }

    private function getManifestConverter(): ManifestConverter
    {
        return $this->getPsrContainer()->get(ManifestConverter::class);
    }

    private function getTestConverter(): TestConverter
    {
        return $this->getPsrContainer()->get(TestConverter::class);
    }

    private function getSectionConverter(): AssessmentSectionConverter
    {
        return $this->getPsrContainer()->get(AssessmentSectionConverter::class);
    }

    /**
     * @param AssessmentSectionRef[] $testDefinition
     */
    private function convertAssessmentSectionRefs(QtiComponentCollection $assessmentSectionRefs, string $folder): void
    {
        if (!$this->getPsrContainer()->has(AssessmentSectionConverter::class)) {
            return;
        }

        foreach ($assessmentSectionRefs as $assessmentSectionRef) {
            $file = $folder . $assessmentSectionRef->getHref();
            $this->getSectionConverter()->convertToQti2($file);
        }
    }

    private function getFeatureFlagChecker(): FeatureFlagCheckerInterface
    {
        return $this->getPsrContainer()->get(FeatureFlagChecker::class);
    }
}

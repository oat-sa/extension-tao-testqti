<?php

namespace oat\taoQtiTest\models\cat;

use qtism\data\AssessmentTest;
use qtism\data\AssessmentSection;
use DOMDocument;
use DOMXPath;

/**
 * Computerized Assessment Test Utilities.
 *
 * This class provide utility methods for CAT support in TAO.
 */
class CatUtils
{
    /**
     * Extract CAT Information from Test Definition.
     *
     * This method extracts CAT Information from a given $test defintion. Please find below an example
     * of return value with an adaptive section with QTI Assessment Section Identifier 'S01'.
     *
     * [
     *      'S01' =>
     *      [
     *          'adaptiveEngineRef' => 'http://somewhere.com/api',
     *          'adaptiveSettingsRef' => 'file.xml'
     *      ]
     * ]
     *
     * @param \qtism\data\AssessmentTest $test
     * @param string $namespace (optional) The namespace where to search the "adaptivity" information in the $test definition. If not given, a default namespace will be traversed.
     * @return array
     */
    public static function getCatInfo(AssessmentTest $test, string $namespace = '')
    {
        $info = [];

        /** @var AssessmentSection $assessmentSection */
        foreach ($test->getComponentsByClassName('assessmentSection') as $assessmentSection) {
            $xpath = self::createDomXPath($assessmentSection, $namespace);
            if (null === $xpath) {
                continue;
            }

            // Reference QTI assessmentSection identifier.
            $sectionIdentifier = $assessmentSection->getIdentifier();
            $sectionInfo = [];

            // Get the adaptiveEngineRef.
            foreach (
                $xpath->query(
                    './/ais:adaptiveItemSelection/ais:adaptiveEngineRef',
                    $xpath->document
                ) as $adaptiveEngineRef
            ) {
                $sectionInfo['adaptiveEngineRef'] = $adaptiveEngineRef->getAttribute('href');
            }

            // Get the adaptiveSettingsRef.
            foreach (
                $xpath->query(
                    './/ais:adaptiveItemSelection/ais:adaptiveSettingsRef',
                    $xpath->document
                ) as $adaptiveSettingsRef
            ) {
                $sectionInfo['adaptiveSettingsRef'] = $adaptiveSettingsRef->getAttribute('href');
            }

            // Get the qtiUsagedataRef.
            foreach (
                $xpath->query(
                    './/ais:adaptiveItemSelection/ais:qtiUsagedataRef',
                    $xpath->document
                ) as $qtiUsagedataRef
            ) {
                $sectionInfo['qtiUsagedataRef'] = $qtiUsagedataRef->getAttribute('href');
            }

            // Get the qtiUsagedataRef.
            foreach (
                $xpath->query(
                    './/ais:adaptiveItemSelection/ais:qtiMetadataRef',
                    $xpath->document
                ) as $qtiMetadataRef
            ) {
                $sectionInfo['qtiMetadataRef'] = $qtiMetadataRef->getAttribute('href');
            }

            if (!empty($sectionInfo)) {
                $info[$sectionIdentifier] = $sectionInfo;
            }
        }

        return $info;
    }

    /**
     * Is a Given Section Adaptive
     *
     * This method checks whether a given AssessmentSection object $section is adaptive.
     *
     * @param \qtism\data\AssessmentSection $section
     * @param string $namespace (optional) The namespace where to search the "adaptivity" information in the $test definition. If not given, a default namespace will be traversed.
     *
     * @return boolean
     */
    public static function isAssessmentSectionAdaptive(AssessmentSection $section, string $namespace = '')
    {
        $xpath = self::createDomXPath($section, $namespace);
        if (null === $xpath) {
            return false;
        }

        return $xpath->query('.//ais:adaptiveItemSelection', $xpath->document)->length > 0;
    }

    private static function createDomXPath(AssessmentSection $section, string $namespace = ''): ?DOMXPath
    {
        if ($namespace === '') {
            $namespace = CatService::QTI_2X_ADAPTIVE_XML_NAMESPACE;
        }

        $selection = $section->getSelection();
        if (null === $selection) {
            return null;
        }

        $selectionXml = (string)$selection->getXml();
        if (empty($selectionXml)) {
            return null;
        }

        $xmlExtension = new DOMDocument();
        if (!$xmlExtension->loadXML($selectionXml)) {
            return null;
        }

        $xpath = new DOMXPath($xmlExtension);
        $xpath->registerNamespace('ais', $namespace);

        return $xpath;
    }
}

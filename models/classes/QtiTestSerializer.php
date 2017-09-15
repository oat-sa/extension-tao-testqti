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
 * Copyright (c) 2013-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

namespace oat\taoQtiTest\models;

use qtism\data\AssessmentTest;
use qtism\data\ExtendedAssessmentSection;
use qtism\data\ExtendedAssessmentItemRef;
use oat\taoQtiTest\models\cat\CatService;
use common_Logger;

/**
 * A Test Compiler implementation that compiles a QTI Test and related QTI Items.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 
 */
class QtiTestSerializer extends \taoQtiTest_models_classes_QtiTestCompiler
{

    /**
     * Compile the given $test into PHP source code for maximum performance. The file will be stored
     * into PRIVATE_DIRECTORY/compact-test.php.
     * 
     * @param AssessmentTest $test
     */
    protected function compileTest(AssessmentTest $test)
    {
        common_Logger::t("Compiling QTI test definition...");
        $data = serialize($test);
        $this->getPrivateDirectory()->getFile(TAOQTITEST_COMPILED_FILENAME)->write($data);
        common_Logger::d("QTI-PHP Test Compilation file saved to stream.");
    }
    
    /**
     * Compile Adaptive Test Information.
     * 
     * This method compiles all information required at runtime in terms of Adaptive Testing.
     * 
     * @param \qtism\data\AssessmentTest $test
     */
    protected function compileAdaptive(AssessmentTest $test)
    {
        $catService = $this->getServiceLocator()->get(CatService::SERVICE_ID);
        $catSectionMap = [];

        $trail = [];
        foreach ($test->getTestParts() as $testPart) {
            foreach ($testPart->getAssessmentSections() as $assessmentSection) {
                array_push($trail, $assessmentSection);
            }
        }

        $traversed = [];

        while (count($trail) > 0) {
            $current = array_pop($trail);
            
            if (in_array($current, $traversed, true) === false) {
                // 1st pass.
                array_push($trail, $current);
                
                foreach ($current->getSectionParts() as $sectionPart) {
                    if ($sectionPart instanceof ExtendedAssessmentSection) {
                        array_push($trail, $sectionPart);
                    }
                }
                
                array_push($traversed, $current);
            } else {
                // 2nd pass.
                $sectionParts = $current->getSectionParts();
                $sectionIdentifier = $current->getIdentifier();
                
                $catInfo = $catService->getAdaptiveAssessmentSectionInfo(
                    $test,
                    $this->getPrivateDirectory(),
                    $this->getExtraPath(),
                    $sectionIdentifier
                );
                
                if ($catInfo !== false) {
                    
                    // QTI Adaptive Section detected.
                    \common_Logger::d("QTI Adaptive Section with identifier '" . $current->getIdentifier() . "' found.");
                    
                    // Deal with AssessmentSection Compiling.
                    $this->getPrivateDirectory()
                        ->getFile("adaptive-assessment-section-${sectionIdentifier}")
                        ->write(serialize($current));

                    foreach ($sectionParts->getKeys() as $sectionPartIdentifier) {
                        $sectionPart =  $sectionParts[$sectionPartIdentifier];
                        
                        if ($sectionPart instanceof ExtendedAssessmentItemRef) {
                            $sectionPartHref = $sectionPart->getHref();
                            
                            // Deal with AssessmentItemRef Compiling.
                            $this->getPrivateDirectory()
                                ->getFile("adaptive-assessment-item-ref-${sectionPartIdentifier}")
                                ->write(serialize($sectionPart));

                            unset($sectionParts[$sectionPartIdentifier]);
                        }
                    }
                    
                    if (count($sectionParts) === 0) {
                        $placeholderIdentifier = "adaptive-placeholder-${sectionIdentifier}";
                        // Make the placeholder's href something predictable for later use...
                        $placeholderHref = "x-tao-qti-adaptive://section/${sectionIdentifier}";
                        
                        $placeholder = new ExtendedAssessmentItemRef($placeholderIdentifier, $placeholderHref);
                        
                        // Tag the item ref in order to make it recognizable as an adaptive placeholder.
                        $placeholder->getCategories()[] = self::ADAPTIVE_PLACEHOLDER_CATEGORY;
                        $sectionParts[] = $placeholder;
                        
                        \common_Logger::d("Adaptive AssessmentItemRef Placeholder '${placeholderIdentifier}' injected in AssessmentSection '${sectionIdentifier}'.");
                        
                        // Ask for section setup to the CAT Engine.
                        $section = $catService->getEngine($catInfo['adaptiveEngineRef'])->setupSection($catInfo['adaptiveSectionIdentifier']);
                        $catSectionMap[$catInfo['qtiSectionIdentifier']] = ['section' => $section, 'endpoint' => $catInfo['adaptiveEngineRef']];
                    }
                }
            }
        }
        
        // Write Adaptive Section Map for runtime usage.
        $this->getPrivateDirectory()
            ->getFile(self::ADAPTIVE_SECTION_MAP_FILENAME)
            ->write(json_encode($catSectionMap));
    }
}

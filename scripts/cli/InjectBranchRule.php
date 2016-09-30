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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\cli;

use oat\oatbox\action\Action;
use qtism\data\storage\xml\marshalling\MarshallerFactory;
use qtism\data\rules\BranchRule;
use qtism\data\rules\BranchRuleCollection;

/**
 * An BranchRule injection script.
 * 
 * This script aims at providing the mechanics to inject dynamically some QTI-XML representing a QTI branchRule
 * into a QTI-XML test definition.
 * 
 * Parameter 1 is the URI of the test you want to inject the branchRule.
 * Parameter 2 is the QTI identifier of the assessmentItemRef you want the branchRule to be appended to.
 * stdin must contain the QTI-XML representing the branchRule to inject.
 * 
 * Example usage:
 * sudo -u www-data php index.php "oat\taoQtiTest\scripts\cli\InjectBranchRule" "http://taoplatform300/300.rdf#i1475242228154935" "item-1" < /home/jerome/Documents/input.txt
 */
class InjectBranchRule implements Action
{
    public function __invoke($params)
    {
        // load constants...
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->load();
        
        if (empty($params[0]) === true) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR, 
                'Test URI not provided as parameter 1.'
            );
        }
        
        if (empty($params[1]) === true) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR, 
                'AssessmentItemRefIdentifier not provided as parameter 2.'
            );
        }
        
        $testResource = new \core_kernel_classes_Resource($params[0]);
        if ($testResource->exists() === false) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR, 
                'No RDFS Resource found for URI ' . $params[0] . '.'
            );
        }
        
        $qtiService = \taoQtiTest_models_classes_QtiTestService::singleton();
        $testDoc = $qtiService->getDoc($testResource);
        $test = $testDoc->getDocumentComponent();
        
        $assessmentItemRef = $test->getComponentByIdentifier($params[1]);
        if (!$assessmentItemRef) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR, 
                'No QTI assessmentItemRef with identifier ' . $params[1] . ' found in the QTI Test definition.'
            );
        }
        
        $input = file_get_contents('php://stdin');
        if (empty($input) === true) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR, 
                'No QTI-XML input provided in stdin.'
            );
        } else {
            $dom = new \DOMDocument('1.0', 'UTF-8');
            if (@$dom->loadXML($input)) {
                $element = $dom->documentElement;
            
                $marshallerFactory = new MarshallerFactory();
                $marshaller = $marshallerFactory->createMarshaller($element);
                $component = $marshaller->unmarshall($element);
                
                if (!$component instanceof BranchRule) {
                    return new \common_report_Report(
                        \common_report_Report::TYPE_ERROR, 
                        'No QTI branchRule component found in stdin.'
                    );
                }
                
                $assessmentItemRef->setBranchRules(new BranchRuleCollection(array($component)));
                $qtiService->getQtiTestFile($testResource)->update($testDoc->saveToString());
                
            } else {
                return new \common_report_Report(
                    \common_report_Report::TYPE_ERROR, 
                    'Invalid QTI-XML input provided in stdin.'
                );
            }
        }
        
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, "BranchRule found in stdin successfully appended to assessmentItemRef '" . $params[1] . "' part of QTI Test with URI '" . $params[0] . "'.");
    }
}

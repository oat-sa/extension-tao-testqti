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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 *
 * @author Joel Bout <joel@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\cli;

use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\oatbox\extension\AbstractAction;
use oat\generis\model\OntologyAwareTrait;

class ImportTests extends AbstractAction
{
    use OntologyAwareTrait;

    /**
     * @param array $params
     * @return \common_report_Report
     */
    public function __invoke($params = [])
    {
        try {
            $tests = 0;
            foreach ($params as $file) {
                try {
                    $this->importTest($file);
                    echo $file . ' imported.' . PHP_EOL;
                    $tests++;
                } catch (\Exception $e) {
                    echo 'Error on package ' . $file . ': ' . $e->getMessage();
                }
            }
            return $this->returnSuccess($tests);
        } catch (ExtractException $e) {
            return $this->returnFailure('The ZIP archive containing the IMS QTI Item cannot be extracted.');
        } catch (ParsingException $e) {
            return $this->returnFailure('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.');
        } catch (\Exception $e) {
            return $this->returnFailure($e->getMessage());
        }
    }

    /**
     * Call service to import package
     *
     * @param $package
     * @return bool
     * @throws \Exception
     */
    protected function importTest($package)
    {
        // Call service to import package
        \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($this->getDestinationClass(), $package);

        if ($report->getType() !== \common_report_Report::TYPE_SUCCESS) {
            throw new \Exception("ERROR: " . $report->getMessage());
        }
        return true;
    }

    /**
     * Return error \common_report_Report
     *
     * @param $msg
     * @return \common_report_Report
     */
    protected function returnFailure($msg)
    {
        return new \common_report_Report(\common_report_Report::TYPE_ERROR, $msg);
    }

    /**
     * Return success \common_report_Report
     *
     * @param $testsCount
     * @return \common_report_Report
     */
    protected function returnSuccess($testsCount)
    {
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, $testsCount . ' test packages imported');
    }

    /**
     * Return the test class to import
     *
     * @return \core_kernel_classes_Class
     */
    protected function getDestinationClass()
    {
        return $this->getClass(TaoOntology::TEST_CLASS_URI);
    }
}
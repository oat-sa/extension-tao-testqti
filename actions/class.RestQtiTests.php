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
 */

/**
 *
 * @author Absar Gilani & Rashid - PCG Team - {absar.gilani6@gmail.com}
 */
class taoQtiTest_actions_RestQtiTests extends tao_actions_CommonRestModule
{
    private static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

    public function __construct()
    {
        parent::__construct();
        // The service that implements or inherits get/getAll/getRootClass ... for that particular type of resources
        $this->service = taoQtiTest_models_classes_CrudQtiTestsService::singleton();
    }

    /**
     *
     * Uploads and Import a QTI Test Package containing one or more QTI Test definitions.
     *
     * @param array file description
     * @return common_report_Report An import report.
     * @throws common_exception_InvalidArgumentType
     */
    protected function importQtiPackage($file)
    {
        $mimeType = tao_helpers_File::getMimeType($file['tmp_name']);
        if (!in_array($mimeType, self::$accepted_types)) {
            return new common_report_Report(common_report_Report::TYPE_ERROR, __("Incorrect File Type"));
        }
        return $this->service->importQtiTest($file['tmp_name']);
    }

    /**
     * Requires qtiPackage as a parameter
     */
    protected function getParametersRequirements()
    {
        return array(
            "post" => array(
                "qtiPackage"
            )
        );
    }

    /**
     * This code snippet import QTI Package
     *
     * @author Rashid Mumtaz & Absar - PCG Team - {absar.gilani6@gmail.com & rashid.mumtaz372@gmail.com}
     * @return returnSuccess and returnFailure
     */
    protected function post()
    {
        $data = $this->importQtiPackage(tao_helpers_Http::getUploadedFile("qtiPackage"));
        if ($data->getType() === common_report_Report::TYPE_ERROR) {
            $e = new common_exception_Error($data->getMessage());
            return $this->returnFailure($e);
        } else {
            foreach ($data as $r) {
                $values = $r->getData();
                $testid = $values->rdfsResource->getUri();
                foreach ($values->items as $item) {
                    $itemsid[] = $item->getUri();
                }
                $data = array(
                    'testId' => $testid,
                    'testItems' => $itemsid);
                return $this->returnSuccess($data);
            }
        }
    }
}

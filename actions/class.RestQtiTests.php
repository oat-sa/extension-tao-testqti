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
class taoQtiTest_actions_RestQtiTests extends tao_actions_RestController
{
    private static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

    public function index()
    {
        $this->returnFailure(new \common_exception_NotImplemented('This API does not support this call.'));
    }
    
    public function __construct()
    {
        parent::__construct();
        // The service that implements or inherits get/getAll/getRootClass ... for that particular type of resources
        $this->service = taoQtiTest_models_classes_CrudQtiTestsService::singleton();
    }

    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import()
    {
        $fileUploadName = "qtiPackage";
        if ($this->getRequestMethod() != Request::HTTP_POST) {
            throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
        }
        if(tao_helpers_Http::hasUploadedFile($fileUploadName)) {
            $file = tao_helpers_Http::getUploadedFile($fileUploadName);
            $mimeType = tao_helpers_File::getMimeType($file['tmp_name']);
            if (!in_array($mimeType, self::$accepted_types)) {
                $this->returnFailure(new common_exception_BadRequest());
            } else {
                $report = $this->service->importQtiTest($file['tmp_name']);
                if ($report->getType() === common_report_Report::TYPE_SUCCESS) {
                    $data = array();
                    foreach ($report as $r) {
                        $values = $r->getData();
                        $testid = $values->rdfsResource->getUri();
                        foreach ($values->items as $item) {
                            $itemsid[] = $item->getUri();
                        }
                        $data[] = array(
                            'testId' => $testid,
                            'testItems' => $itemsid);
                    }
                    return $this->returnSuccess($data);
                } else {
                    return $this->returnFailure(new common_exception_InvalidArgumentType($report->getMessage()));
                }
            }
        } else {
            return $this->returnFailure(new common_exception_BadRequest());
        }
    }
}

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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

/**
 * Class taoQtiTest_actions_Runner
 *
 * Serves QTI implementation of the test runner
 */
class taoQtiTest_actions_Previewer extends tao_actions_ServiceModule
{
    /**
     * taoQtiTest_actions_Runner constructor.
     */
    public function __construct()
    {
        // Prevent anything to be cached by the client.
        TestRunnerUtils::noHttpClientCache();
    }

    /**
     * Gets an error response object
     * @param Exception [$e] Optional exception from which extract the error context
     * @param array $prevResponse Response before catch
     * @return array
     */
    protected function getErrorResponse($e = null)
    {
        $response = [
            'success' => false,
            'type' => 'error',
        ];

        if ($e) {
            if ($e instanceof \Exception) {
                $response['type'] = 'exception';
                $response['code'] = $e->getCode();
            }

            if ($e instanceof \common_exception_UserReadableException) {
                $response['message'] = $e->getUserMessage();
            } else {
                $response['message'] = __('An error occurred!');
            }

            switch (true) {
                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $response['type'] = 'FileNotFound';
                    $response['message'] = __('File not found');
                    break;

                case $e instanceof \common_exception_Unauthorized:
                    $response['code'] = 403;
                    break;
            }
        }

        return $response;
    }

    /**
     * Gets an HTTP response code
     * @param Exception [$e] Optional exception from which extract the error context
     * @return int
     */
    protected function getErrorCode($e = null)
    {
        $code = 200;
        if ($e) {
            $code = 500;

            switch (true) {
                case $e instanceof \common_exception_NotImplemented:
                case $e instanceof \common_exception_NoImplementation:
                case $e instanceof \common_exception_Unauthorized:
                    $code = 403;
                    break;

                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $code = 404;
                    break;
            }
        }
        return $code;
    }

    /**
     * Initializes the delivery session
     */
    public function init()
    {
        $code = 200;

        try {

            $testDefinition = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');
            $testExecution = $this->getRequestParameter('serviceCallId');

            $response = [
                'success' => true,
                'testData' => [],
                'testContext' => [],
                'testMap' => [],
            ];

        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the definition data and the state for a particular item
     */
    public function getItem()
    {
        $code = 200;

        try {
            $itemUri = $this->getRequestParameter('itemUri');
            $resultId = $this->getRequestParameter('resultId');

            // previewing a result
            if ($resultId) {
                if (!$this->hasRequestParameter('itemDefinition')) {
                    throw new \common_exception_MissingParameter('itemDefinition', $this->getRequestURI());
                }

                $itemDefinition = $this->getRequestParameter('itemDefinition');

                if (!$this->hasRequestParameter('deliveryUri')) {
                    throw new \common_exception_MissingParameter('deliveryUri', $this->getRequestURI());
                }

                $deliveryUri = $this->getRequestParameter('deliveryUri');

                $delivery = new \core_kernel_classes_Resource($deliveryUri);

                if (!$delivery->exists()) {
                    throw new \common_exception_NotFound('Delivery "'. $deliveryUri .'" not found');
                }

                /** @var \oat\taoResultServer\models\classes\ResultServerService $resultServerService */
                $resultServerService = $this->getServiceLocator()->get(\oat\taoResultServer\models\classes\ResultServerService::SERVICE_ID);
                /** @var \taoResultServer_models_classes_ReadableResultStorage $implementation */
                $implementation = $resultServerService->getResultStorage($deliveryUri);

                $testTaker = new \core_kernel_users_GenerisUser(new \core_kernel_classes_Resource($implementation->getTestTaker($resultId)));
                $lang = $testTaker->getPropertyValues(\oat\generis\model\GenerisRdf::PROPERTY_USER_DEFLG);
                $userDataLang = empty($lang) ? DEFAULT_LANG : (string) current($lang);

                // Load COMPILED item data

                $runtimeService = $this->getServiceLocator()->get(\oat\taoDelivery\model\RuntimeService::SERVICE_ID);
                /** @var \oat\taoDelivery\model\container\delivery\AbstractContainer $deliveryContainer */
                $deliveryContainer = $runtimeService->getDeliveryContainer($deliveryUri);

                $deliveryPrivateDir = null;
                if ($deliveryContainer instanceof \oat\taoQtiTest\models\container\QtiTestDeliveryContainer) {
                    // in case of new test runner
                    $deliveryPrivateDir = $deliveryContainer->getRuntimeParams()['private'];
                } else {
                    // in case of old test runner
                    $inParams = $deliveryContainer->getRuntimeParams()['in'];

                    foreach ($inParams as $param) {
                        if ($param['def'] == \taoQtiTest_models_classes_QtiTestService::INSTANCE_FORMAL_PARAM_TEST_COMPILATION) {
                            $deliveryPrivateDir = explode('|', $param['const'])[0];
                            break;
                        }
                    }
                }

                if (!$deliveryPrivateDir){
                    throw new \common_exception_InconsistentData('Could not determine private dir of delivery');
                }

                $fileStorage = \tao_models_classes_service_FileStorage::singleton();
                $deliveryPrivateStorageDir = $fileStorage->getDirectoryById($deliveryPrivateDir);

                $itemHrefIndexPath = \taoQtiTest_models_classes_QtiTestCompiler::buildHrefIndexPath($itemDefinition);

                $itemHrefs = explode('|', $deliveryPrivateStorageDir->getFile($itemHrefIndexPath)->read());
                if (count($itemHrefs) < 3) {
                    throw new \common_exception_InconsistentData('The itemRef is not formatted correctly');
                }

                $itemUri = $itemHrefs[0];
                $itemPublicDir = $fileStorage->getDirectoryById($itemHrefs[1]);
                $itemPrivateDir = $fileStorage->getDirectoryById($itemHrefs[2]);

                $jsonFile = $itemPrivateDir->getFile($userDataLang . DIRECTORY_SEPARATOR . \oat\taoQtiItem\model\QtiJsonItemCompiler::ITEM_FILE_NAME);
                $xmlFile = $itemPrivateDir->getFile($userDataLang . DIRECTORY_SEPARATOR . \oat\taoQtiItem\model\qti\Service::QTI_ITEM_FILE);
                if ($jsonFile->exists()) {
                    // new test runner is used
                    $itemData = json_decode($jsonFile->read(), true);
                } elseif ($xmlFile->exists()) {
                    // old test runner is used
                    /** @var \oat\taoItems\model\pack\Packer $packer */
                    $packer = (new \oat\taoItems\model\pack\Packer(new \core_kernel_classes_Resource($itemUri), $userDataLang))
                        ->setServiceLocator($this->getServiceLocator());

                    /** @var \oat\taoItems\model\pack\ItemPack $itemPack */
                    $itemPack = $packer->pack();

                    $itemData = $itemPack->JsonSerialize();
                } else {
                    throw new \common_exception_NotFound('Either item.json or qti.xml not found');
                }
            } else if ($itemUri) {
                // Load RESOURCE item data
                // TODO
            } else {
                throw new \common_exception_BadRequest('Either itemUri or resultId needs to be provided.');
            }

            $response = [
                'success' => true,
                'baseUrl' => $itemPublicDir->getPublicAccessUrl(). $userDataLang . '/',
                'itemData' => $itemData,
            ];

        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Stores the state object and the response set of a particular item
     */
    public function submitItem()
    {
        $code = 200;

        try {

            $displayFeedback = false;

            $response = [
                'success' => true,
                'displayFeedbacks' => $displayFeedback
            ];

            if ($displayFeedback == true) {
                $response['feedbacks'] = [];
                $response['itemSession'] = [];
            }


        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }
}

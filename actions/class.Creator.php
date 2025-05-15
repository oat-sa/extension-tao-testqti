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
 * Copyright (c) 2013-2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

use oat\generis\model\OntologyAwareTrait;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\QtiCreator\Scales\RemoteScaleListService;
use oat\taoQtiTest\models\TestCategoryPresetProvider;
use oat\taoQtiTest\models\TestModelService;
use oat\generis\model\data\event\ResourceUpdated;
use oat\oatbox\event\EventManager;

use function GuzzleHttp\Psr7\stream_for;

/**
 *  QTI test Creator Controller.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @package taoQtiTest
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class taoQtiTest_actions_Creator extends tao_actions_CommonModule
{
    use OntologyAwareTrait;

    /**
     * Render the creator base view
     */
    public function index()
    {
        $labels = [];
        $testUri = $this->getRequestParameter('uri');
        $testModel = $this->getServiceManager()->get(TestModelService::SERVICE_ID);

        // Add support for translation and side-by-side view
        $originResourceUri = $this->getRequestParameter('originResourceUri');
        $this->setData('translation', $this->getRequestParameter('translation') ?? "false");
        $this->setData('originResourceUri', json_encode($originResourceUri));

        $items = $testModel->getItems(new core_kernel_classes_Resource(tao_helpers_Uri::decode($testUri)));
        foreach ($items as $item) {
            $labels[$item->getUri()] = $item->getLabel();
        }
        $this->setData(
            'labels',
            json_encode(tao_helpers_Uri::encodeArray($labels, tao_helpers_Uri::ENCODE_ARRAY_KEYS))
        );

        $runtimeConfig = $this->getRuntimeConfig();
        $categoriesPresetService = $this->getServiceManager()->get(TestCategoryPresetProvider::SERVICE_ID);
        $this->setData('categoriesPresets', json_encode($categoriesPresetService->getAvailablePresets($runtimeConfig)));

        $this->setData('loadUrl', _url('getTest', null, null, ['uri' => $testUri]));
        $this->setData('loadOriginUrl', _url('getTest', null, null, ['uri' => $originResourceUri]));
        $this->setData('saveUrl', _url('saveTest', null, null, ['uri' => $testUri]));

        if (common_ext_ExtensionsManager::singleton()->isInstalled('taoBlueprints')) {
            $this->setData(
                'blueprintsByIdUrl',
                _url(
                    'getBlueprintsByIdentifier',
                    'Blueprints',
                    'taoBlueprints'
                )
            );
            $this->setData(
                'blueprintsByTestSectionUrl',
                _url(
                    'getBlueprintsByTestSection',
                    'Blueprints',
                    'taoBlueprints',
                    ['test' => $testUri]
                )
            );
        }

        $this->setData('identifierUrl', _url('getIdentifier', null, null, ['uri' => $testUri]));

        if ($this->getClass(RemoteScaleListService::SCALES_URI)->exists()) {
            $this->setData(
                'scalesPresets',
                json_encode(
                    iterator_to_array(
                        $this->getRemoteListService()->getListElements(
                            $this->getClass(RemoteScaleListService::SCALES_URI)
                        )
                    )
                )
            );
        } else {
            $this->setData('scalesPresets', json_encode([]));
        }

        $guidedNavigation = false;
        if (is_array($runtimeConfig) && isset($runtimeConfig['guidedNavigation'])) {
            $guidedNavigation = $runtimeConfig['guidedNavigation'];
        }
        $this->setData('guidedNavigation', json_encode($guidedNavigation == true));

        $this->setView('creator.tpl');
    }

    /**
     * Get json's test content, the uri of the test must be provided in parameter
     */
    public function getTest()
    {
        $test = $this->getCurrentTest();
        $qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();

        $this->setContentHeader('application/json', 'UTF-8');

        $this->response = $this->getPsrResponse()->withBody(stream_for($qtiTestService->getJsonTest($test)));
    }

    /**
     * Save a test, test uri and
     * The request must use the POST method and contains
     * the test uri and a json string that represents the QTI Test in the model parameter.
     */
    public function saveTest()
    {
        $saved = false;
        if ($this->isRequestPost() && $this->getRequest()->accept('application/json')) {
            if ($this->hasRequestParameter('model')) {
                $parameters = $this->getRequest()->getRawParameters();

                $test = $this->getCurrentTest();
                $qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();

                $saved = $qtiTestService->saveJsonTest($test, $parameters['model']);

                $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
                $eventManager->trigger(new ResourceUpdated($test));

                //save the blueprint if the extension is installed
                if (common_ext_ExtensionsManager::singleton()->isInstalled('taoBlueprints')) {
                    $testSectionLinkService = $this->getServiceManager()->get(
                        \oat\taoBlueprints\model\TestSectionLinkService::SERVICE_ID
                    );
                    $model = json_decode($parameters['model'], true);
                    if (isset($model['testParts'])) {
                        foreach ($model['testParts'] as $testPart) {
                            if (isset($testPart['assessmentSections'])) {
                                foreach ($testPart['assessmentSections'] as $section) {
                                    if (isset($section['blueprint'])) {
                                        if (!empty($section['blueprint'])) {
                                            $testSectionLinkService->setBlueprintForTestSection(
                                                $test,
                                                $section['identifier'],
                                                $section['blueprint']
                                            );
                                        } else {
                                            $testSectionLinkService->removeBlueprintForTestSection(
                                                $test,
                                                $section['identifier']
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $this->setContentHeader('application/json', 'UTF-8');

        $this->response = $this->getPsrResponse()->withBody(stream_for(json_encode(['saved' => $saved])));
    }


    public function getIdentifier()
    {
        $response = [];
        if ($this->getRequest()->accept('application/json')) {
            //we need the model as well to keep consistency with the client
            if ($this->hasRequestParameter('model') && $this->hasRequestParameter('qti-type')) {
                $parameters = $this->getRequest()->getRawParameters();

                $qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();
                $doc = $qtiTestService->fromJson($parameters['model']);

                $identifier = $qtiTestService->getIdentifierFor($doc, $this->getRequestParameter('qti-type'));

                $response = ['identifier' => $identifier];
            }
        }
        $this->setContentHeader('application/json', 'UTF-8');

        $this->response = $this->getPsrResponse()->withBody(stream_for(json_encode($response)));
    }


    /**
     * Returns the test that is being authored
     *
     * @return core_kernel_classes_Resource
     * @throws tao_models_classes_MissingRequestParameterException
     */
    protected function getCurrentTest()
    {
        if (!$this->hasRequestParameter('uri')) {
            throw new tao_models_classes_MissingRequestParameterException('uri');
        }
        return new core_kernel_classes_Resource(tao_helpers_Uri::decode($this->getRequestParameter('uri')));
    }

    /**
     * Get the runtime config
     * @return array the configuration
     */
    protected function getRuntimeConfig()
    {
        $extension = $this
            ->getServiceLocator()
            ->get(\common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoQtiTest');
        return $extension->getConfig('testRunner');
    }

    private function getRemoteListService(): ListService
    {
        return $this->getServiceManager()->getContainer()->get(ListService::class);
    }
}

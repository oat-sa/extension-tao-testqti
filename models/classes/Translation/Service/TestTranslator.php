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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\Translation\Service;

use core_kernel_classes_Resource;
use core_kernel_persistence_Exception;
use oat\generis\model\data\Ontology;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Entity\ResourceTranslation;
use oat\tao\model\Translation\Exception\ResourceTranslationException;
use oat\tao\model\Translation\Query\ResourceTranslationQuery;
use oat\tao\model\Translation\Repository\ResourceTranslationRepository;
use oat\taoTests\models\TaoTestOntology;
use taoQtiTest_models_classes_QtiTestConverterException;
use taoQtiTest_models_classes_QtiTestService;
use taoQtiTest_models_classes_QtiTestServiceException;

class TestTranslator
{
    private taoQtiTest_models_classes_QtiTestService $testQtiService;
    private Ontology $ontology;
    private ResourceTranslationRepository $resourceTranslationRepository;

    public function __construct(
        taoQtiTest_models_classes_QtiTestService $testQtiService,
        Ontology $ontology,
        ResourceTranslationRepository $resourceTranslationRepository
    ) {
        $this->testQtiService = $testQtiService;
        $this->ontology = $ontology;
        $this->resourceTranslationRepository = $resourceTranslationRepository;
    }

    /**
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     * @throws core_kernel_persistence_Exception
     * @throws ResourceTranslationException
     */
    public function translate(core_kernel_classes_Resource $translationTest): core_kernel_classes_Resource
    {
        $this->assertIsTest($translationTest);

        $originalTestUri = $translationTest->getOnePropertyValue(
            $this->ontology->getProperty(TaoOntology::PROPERTY_TRANSLATION_ORIGINAL_RESOURCE_URI)
        );
        $originalTest = $this->ontology->getResource($originalTestUri->getUri());

        $jsonTest = $this->testQtiService->getJsonTest($originalTest);
        $originalTestData = json_decode($jsonTest, true, 512, JSON_THROW_ON_ERROR);

        $originalItemUris = $this->collectItemUris($originalTestData);
        $translationUris = $this->getItemTranslationUris($translationTest, $originalItemUris);

        $translatedTestData = $this->doTranslation($originalTestData, $translationUris);

        $this->testQtiService->saveJsonTest($translationTest, json_encode($translatedTestData));
        $this->updateTranslationCompletionStatus($translationTest, $originalItemUris, $translationUris);

        return $translationTest;
    }

    private function assertIsTest(core_kernel_classes_Resource $resource): void
    {
        if (!$resource->isInstanceOf($this->ontology->getClass(TaoOntology::CLASS_URI_TEST))) {
            throw new ResourceTranslationException('Provided resources is not a Test');
        }
    }

    private function doTranslation(array $testData, array $translationUris): array
    {
        foreach ($testData['testParts'] as &$testPart) {
            foreach ($testPart['assessmentSections'] as &$assessmentSection) {
                $this->recursiveSectionParts(
                    $assessmentSection['sectionParts'],
                    function (&$sectionPart) use ($translationUris) {
                        $sectionPart['href'] = $translationUris[$sectionPart['href']] ?? $sectionPart['href'];
                    }
                );
            }
        }

        return $testData;
    }

    private function collectItemUris(array $testData): array
    {
        $uris = [];

        foreach ($testData['testParts'] as $testPart) {
            foreach ($testPart['assessmentSections'] as $assessmentSection) {
                $this->recursiveSectionParts(
                    $assessmentSection['sectionParts'],
                    function ($sectionPart) use (&$uris) {
                        $uris[$sectionPart['href']] = $sectionPart['href'];
                    }
                );
            }
        }

        return array_values($uris);
    }

    private function recursiveSectionParts(&$sectionParts, callable $itemAction): void
    {
        foreach ($sectionParts as &$sectionPart) {
            if ($sectionPart['qti-type'] === 'assessmentSection') {
                $this->recursiveSectionParts($sectionPart['sectionParts'], $itemAction);

                continue;
            }

            if ($sectionPart['qti-type'] === 'assessmentItemRef') {
                $itemAction($sectionPart);
            }
        }
    }

    /**
     * @param string[] $originalItemUris
     * @return array<string, string>
     */
    private function getItemTranslationUris(core_kernel_classes_Resource $test, array $originalItemUris): array
    {
        $language = $test->getOnePropertyValue($this->ontology->getProperty(TaoOntology::PROPERTY_LANGUAGE));
        $translations = $this->resourceTranslationRepository->find(
            new ResourceTranslationQuery(
                $originalItemUris,
                $language->getUri()
            )
        );

        $translationUris = [];

        /** @var ResourceTranslation $translation */
        foreach ($translations->jsonSerialize()['resources'] as $translation) {
            $translationUris[$translation->getOriginResourceUri()] = $translation->getResourceUri();
        }

        return $translationUris;
    }

    private function updateTranslationCompletionStatus(
        core_kernel_classes_Resource $test,
        array $uniqueIds,
        array $translationUris
    ): void {
        $status = count($uniqueIds) > count($translationUris)
            ? TaoTestOntology::PROPERTY_VALUE_TRANSLATION_COMPLETION_MISSING_TRANSLATIONS
            : TaoTestOntology::PROPERTY_VALUE_TRANSLATION_COMPLETION_TRANSLATED;

        $test->editPropertyValues(
            $this->ontology->getProperty(TaoTestOntology::PROPERTY_TRANSLATION_COMPLETION),
            $status
        );
    }
}

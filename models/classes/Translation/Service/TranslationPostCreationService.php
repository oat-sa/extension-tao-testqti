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
use Psr\Log\LoggerInterface;
use taoQtiTest_models_classes_QtiTestService;
use Throwable;

class TranslationPostCreationService
{
    private taoQtiTest_models_classes_QtiTestService $testQtiService;
    private Ontology $ontology;
    private ResourceTranslationRepository $resourceTranslationRepository;
    private LoggerInterface $logger;

    public function __construct(
        taoQtiTest_models_classes_QtiTestService $testQtiService,
        Ontology $ontology,
        ResourceTranslationRepository $resourceTranslationRepository,
        LoggerInterface $logger
    ) {
        $this->testQtiService = $testQtiService;
        $this->ontology = $ontology;
        $this->resourceTranslationRepository = $resourceTranslationRepository;
        $this->logger = $logger;
    }

    public function __invoke(core_kernel_classes_Resource $test): core_kernel_classes_Resource
    {
        try {
            $jsonTest = $this->testQtiService->getJsonTest($test);
            $testData = json_decode($jsonTest, true, 512, JSON_THROW_ON_ERROR);

            $uniqueIds = $this->collectItemUniqueIds($testData);
            $translationUris = $this->getItemTranslationUris($test, $uniqueIds);

            $this->replaceOriginalItemsWithTranslations($testData, $translationUris);

            $this->testQtiService->saveJsonTest($test, json_encode($testData));
            $this->updateTranslationCompletionStatus($test, $uniqueIds, $translationUris);

            return $test;
        } catch (Throwable $exception) {
            $this->logger->error('An error occurred during test translation: ' . $exception->getMessage());

            throw new ResourceTranslationException('An error occurred during test translation.');
        }
    }

    private function replaceOriginalItemsWithTranslations(array &$testData, array $translationUris): void
    {
        foreach ($testData['testParts'] as &$testPart) {
            foreach ($testPart['assessmentSections'] as &$assessmentSection) {
                foreach ($assessmentSection['sectionParts'] as &$sectionPart) {
                    $translationUri = $translationUris[$sectionPart['href']] ?? null;

                    if ($translationUri !== null) {
                        $sectionPart['href'] = $translationUri;
                    }
                }
            }
        }
    }

    private function collectItemUniqueIds(array $testData): array
    {
        $uniqueIdProperty = $this->ontology->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER);
        $uniqueIds = [];

        foreach ($testData['testParts'] as $testPart) {
            foreach ($testPart['assessmentSections'] as $assessmentSection) {
                foreach ($assessmentSection['sectionParts'] as $sectionPart) {
                    $item = $this->ontology->getResource($sectionPart['href']);
                    $uniqueId = (string) $item->getUniquePropertyValue($uniqueIdProperty);

                    if (empty($uniqueId)) {
                        throw new ResourceTranslationException(
                            sprintf(
                                'Item %s must have a unique identifier',
                                $sectionPart['href']
                            )
                        );
                    }

                    $uniqueIds[] = $uniqueId;
                }
            }
        }

        return $uniqueIds;
    }

    /**
     * @param string[] $uniqueIds
     * @return array<string, string>
     * @throws core_kernel_persistence_Exception
     */
    private function getItemTranslationUris(core_kernel_classes_Resource $test, array $uniqueIds): array
    {
        $language = $test->getOnePropertyValue($this->ontology->getProperty(TaoOntology::PROPERTY_LANGUAGE));
        $translations = $this->resourceTranslationRepository->find(
            new ResourceTranslationQuery(
                TaoOntology::CLASS_URI_ITEM,
                $uniqueIds,
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

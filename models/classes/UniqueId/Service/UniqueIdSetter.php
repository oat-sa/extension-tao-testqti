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

namespace oat\taoQtiTest\models\UniqueId\Service;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Service\ResourceMetadataRetriever;
use oat\tao\model\UniqueId\Service\ResourceUniqueIdRetriever;
use Psr\Log\LoggerInterface;
use taoQtiTest_models_classes_QtiTestService;
use Throwable;

class UniqueIdSetter
{
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private ResourceMetadataRetriever $resourceMetadataRetriever;
    private ResourceUniqueIdRetriever $resourceUniqueIdRetriever;
    private QtiIdentifierSetter $qtiIdentifierSetter;
    private LoggerInterface $logger;

    public function __construct(
        FeatureFlagCheckerInterface $featureFlagChecker,
        ResourceMetadataRetriever $resourceMetadataRetriever,
        ResourceUniqueIdRetriever $resourceUniqueIdRetriever,
        QtiIdentifierSetter $qtiIdentifierSetter,
        LoggerInterface $logger
    ) {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->resourceMetadataRetriever = $resourceMetadataRetriever;
        $this->resourceUniqueIdRetriever = $resourceUniqueIdRetriever;
        $this->qtiIdentifierSetter = $qtiIdentifierSetter;
        $this->logger = $logger;
    }

    public function __invoke(core_kernel_classes_Resource $test): core_kernel_classes_Resource
    {
        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            $this->logger->info('Unique identifier feature not enabled.');

            return $test;
        }

        $originalResourceUri = $this->resourceMetadataRetriever->getOriginalResourceUri($test);

        if ($originalResourceUri === null) {
            $this->logger->info(sprintf('Cannot retrieve original resource URI for test %s', $test->getUri()));

            return $test;
        }

        $originalResource = $test->getResource($originalResourceUri);
        $uniqueIdentifier = $this->resourceUniqueIdRetriever->retrieve($originalResource);

        if (empty($uniqueIdentifier)) {
            $this->logger->info(sprintf('Cannot retrieve unique identifier for test %s', $originalResource->getUri()));

            return $test;
        }


        $test->editPropertyValues($test->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER), $uniqueIdentifier);
        $this->qtiIdentifierSetter->set($test, $uniqueIdentifier);

        return $test;
    }
}

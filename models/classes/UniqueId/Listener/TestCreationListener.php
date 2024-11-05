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

namespace oat\taoQtiTest\models\UniqueId\Listener;

use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\generis\model\data\Ontology;
use oat\oatbox\event\Event;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\resources\Event\InstanceCopiedEvent;
use oat\tao\model\TaoOntology;
use oat\taoQtiTest\models\classes\event\TestImportedEvent;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierSetter;
use oat\taoTests\models\event\TestCreatedEvent;
use oat\taoTests\models\event\TestDuplicatedEvent;

class TestCreationListener
{
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private Ontology $ontology;
    private IdentifierGeneratorInterface $identifierGenerator;
    private QtiIdentifierSetter $qtiIdentifierSetter;

    public function __construct(
        FeatureFlagCheckerInterface $featureFlagChecker,
        Ontology $ontology,
        IdentifierGeneratorInterface $identifierGenerator,
        QtiIdentifierSetter $qtiIdentifierSetter
    ) {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->ontology = $ontology;
        $this->identifierGenerator = $identifierGenerator;
        $this->qtiIdentifierSetter = $qtiIdentifierSetter;
    }

    public function populateUniqueId(Event $event): void
    {
        if (
            !$event instanceof TestCreatedEvent
            && !$event instanceof TestDuplicatedEvent
            && !$event instanceof TestImportedEvent
            && !$event instanceof InstanceCopiedEvent
        ) {
            return;
        }

        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            return;
        }

        $test = $this->getEventTest($event);

        if ($test->getRootId() !== TaoOntology::CLASS_URI_TEST) {
            return;
        }

        $originalResourceUriProperty = $this->ontology->getProperty(
            TaoOntology::PROPERTY_TRANSLATION_ORIGINAL_RESOURCE_URI
        );

        if (!empty($test->getOnePropertyValue($originalResourceUriProperty))) {
            return;
        }

        $identifier = $this->identifierGenerator->generate([IdentifierGeneratorInterface::OPTION_RESOURCE => $test]);

        $test->editPropertyValues(
            $this->ontology->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER),
            $identifier
        );
        $this->qtiIdentifierSetter->set($test, $identifier);
    }

    private function getEventTest(Event $event): core_kernel_classes_Resource
    {
        if ($event instanceof TestCreatedEvent || $event instanceof TestImportedEvent) {
            return $this->ontology->getResource($event->getTestUri());
        }

        if ($event instanceof TestDuplicatedEvent) {
            return $this->ontology->getResource($event->getCloneUri());
        }

        if ($event instanceof InstanceCopiedEvent) {
            return $this->ontology->getResource($event->getInstanceUri());
        }

        throw new InvalidArgumentException('Cannot retrieve event test: event %s is not supported', get_class($event));
    }
}

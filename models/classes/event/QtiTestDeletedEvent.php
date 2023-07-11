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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiTest\models\event;

use oat\oatbox\event\Event;

class QtiTestDeletedEvent implements Event
{
    /** @var string[] */
    private array $testUris;

    /** @var string[] */
    private array $itemClassesUri;

    /** @var string[] */
    private array $referencedResources;

    public function __construct(
        array $testUris,
        array $itemClassesUri,
        array $referencedResources
    ) {
        $this->testUris = array_values(array_unique($testUris));
        $this->itemClassesUri = array_values(array_unique($itemClassesUri));
        $this->referencedResources = array_values(array_unique($referencedResources));
    }

    /**
     * (non-PHPdoc)
     * @see Event::getName
     */
    public function getName()
    {
        return self::class;
    }

    public function getTestUris(): array
    {
        return $this->testUris;
    }

    public function getItemClassesUri(): array
    {
        return $this->itemClassesUri;
    }

    /**
     * @return string[]
     */
    public function getReferencedResources(): array
    {
        return $this->referencedResources;
    }
}

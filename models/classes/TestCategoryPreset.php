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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models;

use JsonSerializable;
use common_exception_InconsistentData;

/**
 * A POPO that represents a test category preset
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
class TestCategoryPreset implements JsonSerializable
{
    private string $id;

    /**
     * Short preset name
     */
    private string $label;

    /**
     * The actual qti category that will end up in the QTI markup
     */
    private string $qtiCategory;

    /**
     * The other possible qti categories that would activate the preset
     */
    private array $altCategories = [];

    /**
     * What is the category purpose
     */
    private string $description = '';

    /**
     * To sort the categories
     */
    private int $order = 0;

    /**
     * Related plugin that the preset depends on
     */
    private string $pluginId = '';

    /**
     * The name of a config flag, the preset will be deactivated based on this optional value.
     */
    private string $featureFlag = '';


    public function __construct(string $id, string $label, string $qtiCategory, array $data = [])
    {
        if (! is_string($id) || empty($id)) {
            throw new common_exception_InconsistentData('The category preset needs an id');
        }
        if (! is_string($label) || empty($label)) {
            throw new common_exception_InconsistentData('The category preset needs a label');
        }
        if (! is_string($qtiCategory) || empty($qtiCategory)) {
            throw new common_exception_InconsistentData('The category preset needs a qti category');
        }

        $this->id           = (string) $id;
        $this->label        = (string) $label;
        $this->qtiCategory  = (string) $qtiCategory;

        if (isset($data['description'])) {
            $this->description = (string) $data['description'];
        }
        if (isset($data['order'])) {
            $this->order = (int) $data['order'];
        }
        if (isset($data['pluginId'])) {
            $this->pluginId = (string) $data['pluginId'];
        }
        if (isset($data['featureFlag'])) {
            $this->featureFlag = (string) $data['featureFlag'];
        }
        if (isset($data['altCategories'])) {
            $this->altCategories = array_map('strval', $data['altCategories']);
        }
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getQtiCategory(): string
    {
        return $this->qtiCategory;
    }

    public function getAltCategory(): array
    {
        return $this->altCategories;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getOrder(): int
    {
        return $this->order;
    }

    public function getPluginId(): string
    {
        return $this->pluginId;
    }

    public function getFeatureFlag(): string
    {
        return $this->featureFlag;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function toArray(): array
    {
        return [
            'id'            => $this->id,
            'label'         => $this->label,
            'qtiCategory'   => $this->qtiCategory,
            'altCategories' => $this->altCategories,
            'description'   => $this->description,
            'order'         => $this->order,
            'pluginId'      => $this->pluginId,
            'featureFlag'   => $this->featureFlag
        ];
    }

    public static function fromArray(array $data): TestCategoryPreset
    {
        if (!isset($data['id']) || !isset($data['label']) || !isset($data['qtiCategory'])) {
            throw new common_exception_InconsistentData(
                'The test category preset requires an id, a label and a qtiCategory'
            );
        }

        return new self(
            $data['id'],
            $data['label'],
            $data['qtiCategory'],
            $data
        );
    }
}

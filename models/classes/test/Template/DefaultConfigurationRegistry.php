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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\test\Template;

use InvalidArgumentException;
use oat\tao\model\ClientLibConfigRegistry;
use qtism\data\NavigationMode;
use qtism\data\SubmissionMode;

class DefaultConfigurationRegistry extends ClientLibConfigRegistry
{
    public const ID = 'taoQtiTest/controller/creator/config/defaults';

    public function setPartIdPrefix(string $partIdPrefix): self
    {
        $this->register(self::ID, compact('partIdPrefix'));

        return $this;
    }

    public function setSectionIdPrefix(string $sectionIdPrefix): self
    {
        $this->register(self::ID, compact('sectionIdPrefix'));

        return $this;
    }

    public function setSectionTitlePrefix(string $sectionTitlePrefix): self
    {
        $this->register(self::ID, compact('sectionTitlePrefix'));

        return $this;
    }

    public function setCategories(array $categories): self
    {
        $configuration = $this->get(self::ID);
        $configuration['categories'] = $categories;

        $this->set(self::ID, $configuration);

        return $this;
    }

    public function setNavigationMode(int $navigationMode): self
    {
        if (!in_array($navigationMode, NavigationMode::asArray(), true)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Expected one of the following values %s, %d given.',
                    implode(', ', NavigationMode::asArray()),
                    $navigationMode
                )
            );
        }

        $this->register(self::ID, compact('navigationMode'));

        return $this;
    }

    public function setSubmissionMode(int $submissionMode): self
    {
        if (!in_array($submissionMode, SubmissionMode::asArray(), true)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Expected one of the following values %s, %d given.',
                    implode(', ', SubmissionMode::asArray()),
                    $submissionMode
                )
            );
        }

        $this->register(self::ID, compact('submissionMode'));

        return $this;
    }

    public function setMaxAttempts(int $maxAttempts): self
    {
        $this->register(self::ID, compact('maxAttempts'));

        return $this;
    }
}

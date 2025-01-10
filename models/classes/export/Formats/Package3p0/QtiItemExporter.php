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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export\Formats\Package3p0;

use oat\taoQtiItem\model\Export\Qti3Package\Exporter;
use oat\taoQtiTest\models\export\QtiItemExporterTrait;
use oat\taoQtiTest\models\export\QtiItemExporterInterface;


class QtiItemExporter implements QtiItemExporterInterface
{
    use QtiItemExporterTrait;

    private Exporter $exporter;

    public function __construct(Exporter $exporter)
    {
        $this->exporter = $exporter;
    }

    public function __call(string $name, array $arguments)
    {
        return $this->exporter->$name(...$arguments);
    }
}

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
 */
declare(strict_types=1);

namespace oat\taoQtiTest\models\xmlEditor;

use core_kernel_classes_Resource;

interface XmlEditorInterface
{
    public const SERVICE_ID = 'taoQtiTest/XmlEditor';
    public const XML_EDITOR_ROLE = 'http://www.tao.lu/Ontologies/generis.rdf#TestXMLEditor';
    public const OPTION_XML_EDITOR_LOCK = 'is_locked';

    /**
     * @param core_kernel_classes_Resource $test
     * @return string
     */
    public function getTestXml(core_kernel_classes_Resource $test) : string;

    /**
     * @return bool
     */
    public function isLocked() : bool;
}

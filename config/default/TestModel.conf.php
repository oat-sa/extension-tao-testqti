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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
 */
use oat\taoQtiTest\models\compilation\CompilationService;

return new \oat\taoQtiTest\models\TestModelService([
    'exportHandlers' => [
        new \oat\taoQtiTest\models\export\metadata\TestMetadataByClassExportHandler(),
        new taoQtiTest_models_classes_export_TestExport(),
        new taoQtiTest_models_classes_export_TestExport22()
    ],
    'importHandlers' => [
        new taoQtiTest_models_classes_import_TestImport()
    ],
    'CompilationService' => new CompilationService([
        // Whether nor not scoping rubricBlock stylesheet rules with IDs.
        CompilationService::OPTION_RUBRIC_BLOCK_CSS_SCOPE => true,
        // Whether nor not to use the client container for the testrunner
        CompilationService::OPTION_CLIENT_TESTRUNNER => true
    ])
]);

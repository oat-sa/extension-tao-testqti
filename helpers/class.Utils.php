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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use qtism\data\storage\xml\XmlDocument;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\QtiTestUtils;

/**
 * Miscellaneous utility methods for the QtiTest extension.
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class taoQtiTest_helpers_Utils extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/taoQtiTestHelpersUtils';

    /**
     * @deprecated use QtiTestUtils::storeQtiResource
     */
    public static function storeQtiResource(Directory $testContent, $qtiResource, $origin, $copy = true, $rename = '')
    {
        return static::getService()->storeQtiResource($testContent, $qtiResource, $origin, $copy, $rename);
    }

    /**
     * @deprecated use QtiTestUtils::emptyImsManifest
     */
    public static function emptyImsManifest($version = '2.1')
    {
        return static::getService()->emptyImsManifest($version);
    }
    
    /**
     * @deprecated use QtiTestUtils::buildAssessmentItemRefsTestMap
     */
    public static function buildAssessmentItemRefsTestMap(XmlDocument $test, taoQtiTest_models_classes_ManifestParser $manifestParser, $basePath)
    {
        return static::getService()->buildAssessmentItemRefsTestMap($test, $manifestParser, $basePath);
    }

    /**
     * @deprecated use QtiTestUtils::getTestDefinition
     */
    public static function getTestDefinition($qtiTestCompilation)
    {
        return static::getService()->getTestDefinition($qtiTestCompilation);
    }

    /**
     * @return QtiTestUtils
     */
    private static function  getService()
    {
        return ServiceManager::getServiceManager()->get(QtiTestUtils::SERVICE_ID);
    }
}

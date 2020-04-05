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
 * @author Julien Sébire, <julien@taotesting.com>
 */

class taoQtiTest_models_classes_export_QtiTestExporter30 extends taoQtiTest_models_classes_export_QtiTestExporter
{
    protected function createItemExporter(core_kernel_classes_Resource $item)
    {
        return new taoQtiTest_models_classes_export_QtiItemExporter30($item, $this->getZip(), $this->getManifest());
    }

    protected function getTestResourceType()
    {
        return 'imsqti_test_xmlv3p0';
    }

    protected function postProcessing($testXmlDocument)
    {
        $testXmlDocument = str_replace(
            'http://www.imsglobal.org/xsd/imsqti_v2p1',
            'http://www.imsglobal.org/xsd/imsqti_v3p0',
            $testXmlDocument
        );

        $testXmlDocument = str_replace(
            'http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd',
            'http://www.imsglobal.org/xsd/qti/qtiv3p0/imsqti_v3p0.xsd',
            $testXmlDocument
        );

        return $testXmlDocument;
    }
}

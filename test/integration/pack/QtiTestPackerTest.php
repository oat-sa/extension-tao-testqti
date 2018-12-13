<?php
/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\test\integration\pack;

use \core_kernel_classes_Resource;
use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\taoQtiTest\models\pack\QtiTestPacker;


/**
 * Test the class {@link TestPack}
 *
 * @author Bertrand Chevrier, <taosupport@tudor.lu>
 * @package taoTests
 */
class QtiTestPackerTest extends GenerisPhpUnitTestRunner
{

    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Test creating a QtiTestPacker
     */
    public function testConstructor(){
        $testPacker = new QtiTestPacker();
        $this->assertInstanceOf('oat\taoTests\models\pack\Packable', $testPacker);
    }


    /**
     * Test the exception when a wrong content is given to the parser
     */
    public function testWrongContentToPack(){
        $this->expectException(\common_Exception::class);

        $testPacker = new QtiTestPacker();
        $directory = $this->createMock(\tao_models_classes_service_StorageDirectory::class);

        $testPacker->packTest(new core_kernel_classes_Resource('foo'), $directory);
    }
}

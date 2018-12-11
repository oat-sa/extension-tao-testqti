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

namespace oat\taoQtiTest\models\pack;

use oat\oatbox\service\ServiceManager;
use oat\taoItems\model\pack\Packer;
use oat\taoTests\models\pack\Packable;
use oat\taoTests\models\pack\TestPack;
use \taoQtiTest_models_classes_QtiTestService;
use \core_kernel_classes_Resource;
use \InvalidArgumentException;
use \common_Exception;
use Exception;

/**
 * This class pack a QTI Test. Packing instead of compiling, aims
 * to extract the only data of an test. Those data are used by the
 * test runner to render the test.
 *
 * @package taoQtiTest
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class QtiTestPacker implements Packable
{

    /**
     * The test type identifier
     * @var string
     */
    private static $testType = 'qti';

    /**
     * packTest implementation for QTI
     * @see {@link Packable}
     * @throws InvalidArgumentException
     * @throws common_Exception
     */
    public function packTest(core_kernel_classes_Resource $test)
    {
        $testPack = null;

        try {

            $qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();

            $doc            = $qtiTestService->getDoc($test);
            $converter      = new \taoQtiTest_models_classes_QtiTestConverter($doc);
            $items          = array();
            foreach($qtiTestService->getItems($test) as $item){
                $items[$item->getUri()] = (new Packer($item, ''))
                    ->setServiceLocator(ServiceManager::getServiceManager())
                    ->pack();
            }
            $testPack       = new TestPack(self::$testType, $converter->toArray(), $items);
        } catch(Exception $e){
            throw new common_Exception('Unable to pack test '. $test->getUri() . ' : ' . $e->getMessage());
        }

        return $testPack;
    }
}

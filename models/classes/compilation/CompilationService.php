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
 * Copyright (c) 2013-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */
namespace oat\taoQtiTest\models\compilation;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
/**
 * TestCompiler factory
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQtiTest
 */
class CompilationService extends ConfigurableService
{
    /**
     * Boolean option to enable/disable css scoping (enabled by default)
     * @var string
     */
    const OPTION_RUBRIC_BLOCK_CSS_SCOPE = 'rubric-block-stylesheet-scoping';

    /**
     * Boolean option to enable/disable client container for testrunner (enabled by default)
     * @var string
     */
    const OPTION_CLIENT_TESTRUNNER = 'client-testrunner';

    /**
     * Whenever or not style sheets in rubric blocks should be scoped
     * @param boolean $boolean
     */
    public function setRubricBlockStyleSheetScoping($boolean)
    {
        $this->setOption(self::OPTION_RUBRIC_BLOCK_CSS_SCOPE, (boolean)$boolean);
    }

    /**
     * @return \taoQtiTest_models_classes_QtiTestCompiler
     */
    public function getCompiler($resource, $storage)
    {
        $compilerClass = $this->getCompilerClass();
        $compiler = new $compilerClass($resource, $storage);
        $this->propagate($compiler);
        $compiler->setCssScoping($this->getOption(self::OPTION_RUBRIC_BLOCK_CSS_SCOPE));
        $compiler->setClientContainer($this->useClientContainer());
        return $compiler;
    }

    /**
     * Whenever or not to use client container for test runner
     * Fallback determined by qtiItem model extension
     * @return boolean
     */
    public function useClientContainer()
    {
        if ($this->hasOption(self::OPTION_CLIENT_TESTRUNNER)) {
            return $this->getOption(self::OPTION_CLIENT_TESTRUNNER);
        } else {
            // fallback to taoQtiItem config
            $itemModel = $this->getServiceLocator()->get(ItemModel::SERVICE_ID);
            return $itemModel->getCompilerClass() == QtiJsonItemCompiler::class;
        }
    }

    /**
     * Class to use for the compiler object, should not need to be exposed anymore
     * @deprecated
     * @return string
     */
    public function getCompilerClass()
    {
        return \taoQtiTest_models_classes_QtiTestCompiler::class;
    }
}

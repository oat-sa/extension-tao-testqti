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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\map;

use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\RunnerServiceContext;

/**
 * Interface RunnerMap
 * @package oat\taoQtiTest\models\runner\map
 */
interface RunnerMap
{
    //available scopes
    const SCOPE_TEST    = 'test';
    const SCOPE_PART    = 'part';
    const SCOPE_SECTION = 'section';

    /**
     * Builds the map of an assessment test
     * @param RunnerServiceContext $context The test context
     * @param RunnerConfig $config The runner config
     * @return mixed
     */
    public function getMap(RunnerServiceContext $context, RunnerConfig $config);

    /**
     * Get the testMap for the current context but limited to the given scope
     * @param RunnerServiceContext $context The test context
     * @param RunnerConfig $config The runner config
     * @param string $scope the target scope, section by default
     * @return mixed
     */
    public function getScopedMap(RunnerServiceContext $context, RunnerConfig $config, $scope = self::SCOPE_SECTION);

}

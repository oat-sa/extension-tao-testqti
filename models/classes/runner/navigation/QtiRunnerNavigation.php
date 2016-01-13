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

namespace oat\taoQtiTest\models\runner\navigation;

/**
 * Class QtiRunnerNavigation
 * @package oat\taoQtiTest\models\runner\navigation
 */
class QtiRunnerNavigation
{
    /**
     * Gets a QTI runner navigator
     * @param string $direction
     * @param string $scope
     * @return RunnerNavigation
     * @throws \common_exception_InvalidArgumentType
     * @throws \common_exception_NotImplemented
     */
    public static function getNavigator($direction, $scope)
    {
        $className = __NAMESPACE__ . '\QtiRunnerNavigation' . ucfirst($direction) . ucfirst($scope);
        if (class_exists($className)) {
            $navigator = new $className();
            if ($navigator instanceof RunnerNavigation) {
                return $navigator;
            } else {
                throw new \common_exception_InvalidArgumentType('Navigator must be an instance of RunnerNavigation');
            }
        } else {
            throw new \common_exception_NotImplemented('The action is invalid!');
        }
    }
}

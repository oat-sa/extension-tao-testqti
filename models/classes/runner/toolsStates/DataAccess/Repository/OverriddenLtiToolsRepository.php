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

namespace oat\taoQtiTest\models\runner\toolsStates\DataAccess\Repository;

use oat\oatbox\session\SessionService;
use oat\taoLti\models\classes\TaoLtiSession;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;
use oat\taoQtiTest\models\runner\toolsStates\DataAccess\Mapper\OptionCollectionMapper;
use oat\taoQtiTest\models\TestCategoryPresetProvider;

class OverriddenLtiToolsRepository extends OverriddenToolsRepositoryAbstract
{
    private const CUSTOM_LTI_TAO_TOOLS = 'custom_x_tao_tools';

    /** @var SessionService */
    private $sessionService;
    /** @var OptionCollectionMapper */
    private $mapper;

    public function __construct(
        TestCategoryPresetProvider $presetRepository,
        SessionService $sessionService,
        OptionCollectionMapper $mapper
    ) {
        parent::__construct($presetRepository);

        $this->sessionService = $sessionService;
        $this->mapper         = $mapper;
    }

    protected function findAllUnfiltered(): OptionCollection
    {
        $session = $this->sessionService->getCurrentSession();

        if (!$session instanceof TaoLtiSession) {
            return new OptionCollection();
        }

        $launchData = $session->getLaunchData();

        if (!$launchData->hasVariable(self::CUSTOM_LTI_TAO_TOOLS)) {
            return new OptionCollection();
        }

        /** @noinspection PhpUnhandledExceptionInspection */
        $toolSettings = (array)json_decode($launchData->getVariable(self::CUSTOM_LTI_TAO_TOOLS), true);

        return $this->mapper->toDomain($toolSettings);
    }
}

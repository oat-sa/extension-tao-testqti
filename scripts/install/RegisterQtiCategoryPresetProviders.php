<?php
/**
 * Copyright (c) 2016 Open Assessment Technologies, S.A.
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiTest\models\TestCategoryPresetRegistry;

class RegisterQtiCategoryPresetProviders extends InstallAction
{
    public function __invoke($params)
    {
        $registry = TestCategoryPresetRegistry::getRegistry();
        $registry->set('taoQtiTest', '\oat\taoQtiTest\models\QtiCategoryPresetProvider');

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Qti category preset provider has been successfully registered');
    }
}

<?php
/**
 * Copyright (c) 2016 Open Assessment Technologies, S.A.
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiTest\models\TestCategoryPresetProvider;

class RegisterTestCategoryPresetProviderService extends InstallAction
{
    public function __invoke($params)
    {
        $this->getServiceManager()->register(TestCategoryPresetProvider::SERVICE_ID, new TestCategoryPresetProvider());

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Test category preset provider successfully registered');
    }
}

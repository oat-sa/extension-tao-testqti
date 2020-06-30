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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\preview;

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\data\AssessmentTest;

class TestPreviewContext extends QtiRunnerServiceContext
{
    /** @var AssessmentTest */
    private $assessmentTest;

    public function __construct(AssessmentTest $assessmentTest)
    {
        $this->assessmentTest = $assessmentTest;
    }

    /**
     * @return TestPreviewSessionStorage
     */
    public function getStorage()
    {
        return new TestPreviewSessionStorage();
    }

    /**
     * @param string $id
     * @return null
     */
    public function getItemIndex($id)
    {
        return null;
    }

    /**
     * @param string $id
     * @param string $name
     * @return mixed
     */
    public function getItemIndexValue($id, $name)
    {
        return null;
    }

    public function canMoveBackward()
    {
        return true;
    }

    public function getTestMeta()
    {
        return [];
    }

    public function getTestSession()
    {
        if (!$this->testSession) {
            $manager = new TestPreviewSessionManager();

            $this->testSession = new TestPreviewSession($manager, $this->assessmentTest);
        }

        return $this->testSession;
    }

    /**
     * @return AssessmentTest
     */
    public function getTestDefinition()
    {
        return $this->assessmentTest;
    }

    protected function retrieveItemIndex()
    {
    }
}

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

namespace oat\taoQtiTest\models\runner\context;

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use qtism\common\storage\IStream;
use qtism\common\storage\MemoryStream;
use qtism\data\AssessmentTest;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\AbstractSessionManager;
use qtism\runtime\tests\AssessmentTestSession;

class TestPreviewContext extends QtiRunnerServiceContext
{
    /**
     * Gets the session storage
     * @return AbstractQtiBinaryStorage
     * @throws \common_exception_Error
     * @throws \common_ext_ExtensionException
     */
    public function getStorage()
    {
        return new class() extends AbstractQtiBinaryStorage {
            public function __construct()
            {
            }

            public function retrieve(AssessmentTest $test, $sessionId)
            {
                return new class() extends AssessmentTestSession {
                    public function __construct()
                    {
                    }
                };
            }

            public function exists($id)
            {
                return true;
            }

            protected function getRetrievalStream($sessionId)
            {
            }

            protected function persistStream(AssessmentTestSession $assessmentTestSession, MemoryStream $stream)
            {
            }

            protected function createBinaryStreamAccess(IStream $stream)
            {
            }
        };
    }

    /**
     * Gets the assessment test definition
     * @return TestSession
     */
    public function getTestDefinition()
    {
        return new class() extends TestSession {
            public function __construct()
            {
            }
        };
    }
}

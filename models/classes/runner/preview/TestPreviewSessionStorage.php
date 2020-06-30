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

use qtism\common\storage\IStream;
use qtism\common\storage\MemoryStream;
use qtism\runtime\tests\AssessmentTestSession;
use taoQtiTest_helpers_TestSessionStorage;

class TestPreviewSessionStorage extends taoQtiTest_helpers_TestSessionStorage
{
    public function __construct()
    {
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
}

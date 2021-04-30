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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */


namespace oat\taoQtiTest\models;

use qtism\common\Resolver;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\data\ExtendedAssessmentSection;
use qtism\data\QtiDocument;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;
use qtism\data\TestPart;

/**
 * Cleaner service for cleanup the leftovers.
 */
class QtiTestFileCleaner extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/QtiTestCleaner';

    public function cleanAfterCompilation(QtiDocument $document, Resolver $itemResolver): void
    {
        $fss = $this->getFileSystem();

        $filePaths = $this->getDocumentItemsFilePaths($document, $itemResolver);

        foreach ($filePaths as $filePath) {
            $fss->getDirectory('/tmp')->getFile($filePath)->delete();
        }
    }

    /**
     * @return string[] paths of leftover xml files (e,g. '/tmp.3937826056e0543c6233a83d9964a59d.xml')
     */
    private function getDocumentItemsFilePaths(QtiDocument $document, Resolver $itemResolver): array
    {
        $filePaths = [];
        foreach ($document->getDocumentComponent()->getComponents() as $childComponentLvl1) {
            if($childComponentLvl1 instanceof TestPart) {
                foreach ($childComponentLvl1->getComponents() as $childComponentLvl2) {
                    if($childComponentLvl2 instanceof ExtendedAssessmentSection) {
                        foreach ($childComponentLvl2->getComponents() as $childComponentLvl3) {
                            if($childComponentLvl3 instanceof ExtendedAssessmentItemRef) {
                                $filePaths[] = $itemResolver->resolve($childComponentLvl3->getHref());
                            }
                        }
                    }
                }
            }
        }

        return $filePaths;
    }

    private function getFileSystem(): FileSystemService
    {
        return $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
    }
}

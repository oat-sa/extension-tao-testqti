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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

use qtism\common\ResolutionException;
use qtism\common\Resolver;
use oat\taoQtiItem\model\qti\Service;
use oat\generis\model\OntologyAwareTrait;

/**
 * The ItemResolver class implements the logic to resolve TAO Item URIs to
 * paths to the related QTI-XML files.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class taoQtiTest_helpers_ItemResolver implements Resolver
{
    use OntologyAwareTrait;

    /**
     * @var Service
     */
    private $service;

    /** @var string[] */
    private $tmpFiles = [];

    public function __construct(Service $itemService)
    {
        $this->service = $itemService;
    }

    /**
     * Resolve the given TAO Item URI in the path to
     * the related QTI-XML file.
     *
     * @param string $url The URI of the TAO Item to resolve.
     * @return string The path to the related QTI-XML file.
     * @throws ResolutionException If an error occurs during the resolution of $url.
     */
    public function resolve($url)
    {
        $taoItem = new core_kernel_classes_Resource($url);
        if ($taoItem->exists() === false) {
            $msg = __("The QTI Item with URI '%s' cannot be found.", $url);
            throw new ResolutionException($msg);
        }

        // The item is retrieved from the database.
        // We can try to reach the QTI-XML file by detecting
        // where it is supposed to be located.

        // strip xinclude, we don't need that at the moment.
        $raw = $this->service->getXmlByRdfItem($this->getResource($url));
        $dom = new DOMDocument();
        $dom->loadXML($raw);
        foreach ($dom->getElementsByTagNameNS('http://www.w3.org/2001/XInclude', 'include') as $element) {
                $element->parentNode->removeChild($element);
        }

        $tmpfile = sys_get_temp_dir() . '/' . md5($url) . '.xml';
        file_put_contents($tmpfile, $dom->saveXML());

        $this->tmpFiles[] = $tmpfile;

        return $tmpfile;
    }

    public function __destruct()
    {
        foreach ($this->tmpFiles as $tmpFile) {
            if (is_writable($tmpFile)) {
                unlink($tmpFile);
            }
        }
    }
}

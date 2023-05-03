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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\creator;

use common_exception_Error;
use common_session_AnonymousSession;
use common_session_Session;
use oat\oatbox\session\SessionService;
use oat\tao\model\resources\ResourceService;

trait PermissionLookupTrait
{
    /**
     * @var array
     */
    private $permissions;

    /**
     * @param array $nodes
     * @return array
     * @throws common_exception_Error
     */
    protected function fillPermissions(array $nodes): array
    {
        $permissions = $this->getPermissions($nodes);
        if (is_array($permissions) && array_key_exists('data', $permissions) && is_array($permissions['data'])) {
            $rules = $permissions['data'];
            $rights = isset($permissions['supportedRights']) && count($permissions['supportedRights']) ? $permissions['supportedRights'] : false;
            if ($rights) {
                $self = $this;
                $nodes = array_map(static function ($node) use ($rules, $self, $rights) {
                    if (is_array($node)) {
                        if (array_key_exists('children', $node)) {
                            $node['children'] = $self->fillPermissions($node['children']);
                        }
                        if (array_key_exists('uri', $node)) {
                            $node['accessMode'] = $self->getAccessMode($rules, $rights, $node['uri']);
                        }
                    }

                    return $node;
                }, $nodes);
            }
        }
        return $nodes;
    }

    /**
     * partial|denied|allowed
     * @param array $rules
     * @param array $supportedRights
     * @param string $uri
     * @return string
     */
    private function getAccessMode(array $rules, array $supportedRights, string $uri): string
    {
        $itemRules = array_key_exists($uri, $rules) ? $rules[$uri] : [];
        if (
            count($supportedRights) === 0
            || $itemRules == $supportedRights
            || (in_array('GRANT', $itemRules, true))
        ) {
            return 'allowed';
        }

        if (!count($itemRules)) {
            return 'denied';
        }

        return 'partial';
    }

    /**
     * @param array $resources
     * @return array
     */
    private function getPermissions(array $resources): array
    {
        if (!$this->permissions) {
            //retrieve resources permissions
            $user = $this->getSession() ? $this->getSession()->getUser() : null;

            $this->permissions = $user ? $this->getResourceService()->getResourcesPermissions($user, $resources) : [];
        }

        return $this->permissions;
    }

    /**
     * @return common_session_AnonymousSession|common_session_Session|null
     */
    private function getSession(): common_session_Session
    {
        return $this->getServiceLocator()->get(SessionService::SERVICE_ID)->getCurrentSession();
    }

    /**
     * @return ResourceService|object
     */
    protected function getResourceService(): ResourceService
    {
        return $this->getServiceLocator()->get(ResourceService::SERVICE_ID);
    }
}

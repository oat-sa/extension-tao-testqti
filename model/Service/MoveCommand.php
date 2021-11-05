<?php

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

final class MoveCommand
{
    use ItemContextAwareTrait;
    use NavigationContextAwareTrait;

    /** @var QtiRunnerServiceContext */
    private $serviceContext;

    /** @var array|null */
    private $toolStates;

    /** @var bool */
    private $hasStartTimer;

    public function __construct(
        QtiRunnerServiceContext $serviceContext,
        ?array $toolStates,
        bool $hasStartTimer
    ) {
        $this->serviceContext = $serviceContext;
        $this->toolStates = $toolStates;
        $this->hasStartTimer = $hasStartTimer;
    }

    public function getServiceContext(): QtiRunnerServiceContext
    {
        return $this->serviceContext;
    }

    public function getToolStates(): ?array
    {
        return $this->toolStates;
    }

    public function hasStartTimer(): bool
    {
        return $this->hasStartTimer;
    }
}

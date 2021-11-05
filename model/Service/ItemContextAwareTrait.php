<?php

namespace oat\taoQtiTest\model\Service;

trait ItemContextAwareTrait
{
    /** @var string */
    private $itemDefinition = '';

    /** @var array|null */
    private $itemState = null;

    /** @var float|null */
    private $itemDuration = null;

    /** @var array|null */
    private $itemResponse = null;

    public function setItemContext(
        string $itemDefinition,
        ?array $itemState,
        ?float $itemDuration,
        ?array $itemResponse
    ): void {
        $this->itemDefinition = $itemDefinition;
        $this->itemState = $itemState;
        $this->itemDuration = $itemDuration;
        $this->itemResponse = $itemResponse;
    }

    public function getItemDefinition(): string
    {
        return $this->itemDefinition;
    }

    public function getItemDuration(): ?float
    {
        return $this->itemDuration;
    }

    public function getItemState(): ?array
    {
        return $this->itemState;
    }

    public function getItemResponse(): ?array
    {
        return $this->itemResponse;
    }
}

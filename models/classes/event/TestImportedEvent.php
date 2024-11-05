<?php

namespace oat\taoQtiTest\models\classes\event;

use oat\oatbox\event\Event;

class TestImportedEvent implements Event
{
    private string $testUri;

    public function __construct(string $testUri)
    {
        $this->testUri = $testUri;
    }

    public function getName(): string
    {
        return __CLASS__;
    }

    public function getTestUri(): string
    {
        return $this->testUri;
    }
}
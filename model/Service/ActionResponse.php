<?php

namespace oat\taoQtiTest\model\Service;

final class ActionResponse
{
    /** @var bool */
    private $isSuccess = false;

    /** @var array */
    private $testContext;

    /** @var ?array */
    private $testMap;

    /** @var ?array */
    private $error;

    private function __construct()
    {
    }

    public static function empty(): self
    {
        return new self();
    }

    public static function success(array $testContext, ?array $testMap = null): self
    {
        $response = new self();

        $response->isSuccess = true;
        $response->testContext = $testContext;
        $response->testMap = $testMap;

        return $response;
    }

    public static function error(string $type, string $message, string $code): self
    {
        $response = new self();

        $response->isSuccess = false;
        $response->error = [
            'type' => $type,
            'message' => $message,
            'code' => $code
        ];

        return $response;
    }

    public function toArray(): array
    {
        if ($this->isSuccess) {
            return array_filter(
                [
                    'success' => $this->isSuccess,
                    'testContext' => $this->testContext,
                    'testMap' => $this->testMap
                ]
            );
        }

        if ($this->error === null) {
            return ['success' => $this->isSuccess];
        }

        return array_merge(
            ['success' => $this->isSuccess],
            $this->error
        );
    }
}

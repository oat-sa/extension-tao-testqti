<?php
use oat\taoQtiTest\models\cat\CatService;
use oat\libCat\custom\EchoAdaptEngine;

return new CatService([
    CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
    CatService::OPTION_ENGINE_ARGS => ['http://URL_SERVER/cat/api/'],
]);

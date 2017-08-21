<?php
use oat\taoQtiTest\models\cat\CatService;
use oat\libCat\custom\EchoAdaptEngine;
use oat\tao\model\api\ApiClientConnector;

return new CatService([
    CatService::OPTION_ENGINE_ENDPOINTS => [

        'http://YOUR_URL_OAUTH/cat/api/' => [
            CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
            CatService::OPTION_ENGINE_ARGS => [
                CatService::OPTION_ENGINE_VERSION => 'v1.1',
                CatService::OPTION_ENGINE_CLIENT => [
                    'class' => 'oat\taoOauth\model\OAuthClient',
                    'options' => [
                        'client_id' => '',
                        'client_secret' => '',
                        'resource_owner_details_url' => false,
                        'authorize_url' => false,
                        'http_client_options' => array(),
                        'token_url' => array(),
                        'token_key' => '',
                        'tokenParameters' => array(
                            'audience' => ''
                        ),
                        'token_storage' => 'cache'
                    ]
                ],
            ]
        ],

        'http://YOUR_URL/cat/api/' => [
            CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
            CatService::OPTION_ENGINE_ARGS => [
                CatService::OPTION_ENGINE_VERSION => 'v1',
                CatService::OPTION_ENGINE_CLIENT => [
                    'class' => ApiClientConnector::class,
                    'options' => [
                        ApiClientConnector::OPTION_BASE_URI => 'YOUR_BASE_URI'
                    ]
                ],
            ]
        ]
    ]
]);

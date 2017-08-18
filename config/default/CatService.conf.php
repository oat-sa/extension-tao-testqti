<?php
use oat\taoQtiTest\models\cat\CatService;
use oat\libCat\custom\EchoAdaptEngine;
use \oat\taoOauth\model\provider\ProviderFactory;
use oat\taoOauth\model\OAuthClient;
use oat\tao\model\api\ApiClientConnector;

return new CatService([
    CatService::OPTION_ENGINE_ENDPOINTS => [

        'http://YOUR_URL_OAUTH/cat/api/' => [
            CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
            CatService::OPTION_ENGINE_ARGS => [
                EchoAdaptEngine::OPTION_VERSION => 'v1.1',
                EchoAdaptEngine::OPTION_CLIENT => [
                    'class' => OAuthClient::class,
                    'options' => [
                        ProviderFactory::OPTION_CLIENT_ID => 'dHRXBlUkyYHkIZgFyfjBSo7v6wXKC3yZ',
                        ProviderFactory::OPTION_CLIENT_SECRET => 'LSBpu3ACAYfpjFR7cLjkN2rE4GCMISFsrhJ73caPCpbzJM3N99bhx_DLKIaI1eVH',
                        ProviderFactory::OPTION_RESOURCE_OWNER_DETAILS_URL => false,
                        ProviderFactory::OPTION_AUTHORIZE_URL => false,
                        ProviderFactory::OPTION_HTTP_CLIENT_OPTIONS => array(),
                        ProviderFactory::OPTION_TOKEN_URL => 'https://pacmet.auth0.com/oauth/token',
                        OAuthClient::OPTION_TOKEN_KEY => '',
                        OAuthClient::OPTION_TOKEN_REQUEST_PARAMS => array(
                            'audience' => 'echo-actuat-api'
                        ),
                        OAuthClient::OPTION_TOKEN_STORAGE => 'cache',
                    ]
                ],
            ]
        ],

        'http://YOUR_URL/cat/api/' => [
            CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
            CatService::OPTION_ENGINE_ARGS => [
                EchoAdaptEngine::OPTION_VERSION => 'v1',
                EchoAdaptEngine::OPTION_CLIENT => [
                    'class' => ApiClientConnector::class,
                    'options' => [
                        ApiClientConnector::OPTION_BASE_URI => 'YOUR_BASE_URI'
                    ]
                ],
            ]
        ]
    ]
]);

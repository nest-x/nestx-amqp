## [2.0.5](https://github.com/nest-x/nestx-amqp/compare/v2.0.4...v2.0.5) (2022-05-10)


### Bug Fixes

* **deps:** update dependency amqplib to ^0.9.0 ([9f6a7a9](https://github.com/nest-x/nestx-amqp/commit/9f6a7a9bd2f18ba883d21b5c5630996b2cc1b1df))

## [2.0.4](https://github.com/nest-x/nestx-amqp/compare/v2.0.3...v2.0.4) (2022-03-09)


### Bug Fixes

* **deps:** update dependency amqp-connection-manager to v4 ([#651](https://github.com/nest-x/nestx-amqp/issues/651)) ([fbfed4a](https://github.com/nest-x/nestx-amqp/commit/fbfed4a948bb9d97f8f2c458f58dfe31580191a7))
* **deps:** update dependency rxjs to v7 ([#456](https://github.com/nest-x/nestx-amqp/issues/456)) ([f5444e0](https://github.com/nest-x/nestx-amqp/commit/f5444e079c6b70f64306ddcd4fe292972d5ecc91))

## [2.0.3](https://github.com/nest-x/nestx-amqp/compare/v2.0.2...v2.0.3) (2021-05-19)


### Bug Fixes

* **deps:** update dependency amqplib to ^0.8.0 ([485a57e](https://github.com/nest-x/nestx-amqp/commit/485a57e6bc411f4d2b55952a039ce79ede1f6e9c))

## [2.0.2](https://github.com/nest-x/nestx-amqp/compare/v2.0.1...v2.0.2) (2021-04-19)


### Bug Fixes

* **deps:** update dependency @golevelup/nestjs-discovery to ^2.3.1 ([c94294d](https://github.com/nest-x/nestx-amqp/commit/c94294d304f75fc8fddad0f73954341c0a93ea61))

## [2.0.1](https://github.com/nest-x/nestx-amqp/compare/v2.0.0...v2.0.1) (2021-02-22)


### Bug Fixes

* **deps:** update dependency amqplib to ^0.7.0 ([a84e255](https://github.com/nest-x/nestx-amqp/commit/a84e255f24c08af1bb15bad34f4196603a8d8240))

# [2.0.0](https://github.com/nest-x/nestx-amqp/compare/v1.3.2...v2.0.0) (2020-10-03)


### Code Refactoring

* abbreviations ([#244](https://github.com/nest-x/nestx-amqp/issues/244)) ([a49dad9](https://github.com/nest-x/nestx-amqp/commit/a49dad9f63f44b842138567599ce08f3fc837cb8))


### BREAKING CHANGES

* rename all `AMQP` prefix to `Amqp`.

- add docker-compose.yml for local dev
- update rabbitmq local dev url (update user/pass to default value resepect official image)
- update example in README.md

## [1.3.2](https://github.com/nest-x/nestx-amqp/compare/v1.3.1...v1.3.2) (2020-07-15)


### Bug Fixes

* **deps:** update dependency amqplib to ^0.6.0 ([5958b7a](https://github.com/nest-x/nestx-amqp/commit/5958b7a842751983039811a7416726d7eadf2a94))

## [1.3.1](https://github.com/nest-x/nestx-amqp/compare/v1.3.0...v1.3.1) (2020-03-30)


### Bug Fixes

* PublishQueue don't return a value ([36fcf1c](https://github.com/nest-x/nestx-amqp/commit/36fcf1cde9af8482e3ab388c51c13c211fd92608))

# [1.3.0](https://github.com/nest-x/nestx-amqp/compare/v1.2.0...v1.3.0) (2020-03-28)


### Features

* **exchange:** add decorator `@PublishExchange` ([#53](https://github.com/nest-x/nestx-amqp/issues/53)) ([02f6f91](https://github.com/nest-x/nestx-amqp/commit/02f6f9116d1483d95c0e8804d7470f1d4365bdb1)), closes [#52](https://github.com/nest-x/nestx-amqp/issues/52)

# [1.2.0](https://github.com/nest-x/nestx-amqp/compare/v1.1.0...v1.2.0) (2020-03-27)


### Features

* **multi-providers:** add multi-providers support ([#48](https://github.com/nest-x/nestx-amqp/issues/48)) ([58a2885](https://github.com/nest-x/nestx-amqp/commit/58a2885b31cdac67fe719de8132fad5c4e58f61a))

# [1.1.0](https://github.com/nest-x/nestx-amqp/compare/v1.0.6...v1.1.0) (2020-03-22)


### Bug Fixes

* resolve typo ([3b4a695](https://github.com/nest-x/nestx-amqp/commit/3b4a695379e56e00d065055a3bd542a8b20b75b5))


### Features

* **decorators:** add decorators support ([1e58742](https://github.com/nest-x/nestx-amqp/commit/1e5874279b4dbd8179aa5ffc2284b16c9ebc198f))

## [1.0.6](https://github.com/nest-x/nestx-amqp/compare/v1.0.5...v1.0.6) (2020-02-24)


### Bug Fixes

* remove patches for `@types/amqp-connection-manager` ([99063d2](https://github.com/nest-x/nestx-amqp/commit/99063d28dde74ec218e9806f8fdaba1c1943ffbc))

## [1.0.5](https://github.com/nest-x/nestx-amqp/compare/v1.0.4...v1.0.5) (2020-02-23)


### Bug Fixes

* resolve `amqplib/properties` import issue ([bfc44c4](https://github.com/nest-x/nestx-amqp/commit/bfc44c444e155d8b13a5184e82de619fa6602de4))

## [1.0.4](https://github.com/nest-x/nestx-amqp/compare/v1.0.3...v1.0.4) (2020-02-23)


### Bug Fixes

* resolve `amqplib/properties` import issue ([c102110](https://github.com/nest-x/nestx-amqp/commit/c102110a574289ea2c67e57e7eb465482113a898))

## [1.0.3](https://github.com/nest-x/nestx-amqp/compare/v1.0.2...v1.0.3) (2020-02-23)


### Bug Fixes

* **deps:** add `@types/amqplib` at devDependencies ([ec78fe2](https://github.com/nest-x/nestx-amqp/commit/ec78fe2a739eb76ea9c1840755f34647b2d054cf))

## [1.0.2](https://github.com/nest-x/nestx-amqp/compare/v1.0.1...v1.0.2) (2020-02-21)


### Bug Fixes

* rename package to `nestx-amqp` ([6ca541f](https://github.com/nest-x/nestx-amqp/commit/6ca541f8a1a1228b39332f000e68f953857f0738))

## [1.0.1](https://github.com/nest-x/nestx-amqp/compare/v1.0.0...v1.0.1) (2020-02-21)


### Bug Fixes

* release issue & rename npm package ([60012bf](https://github.com/nest-x/nestx-amqp/commit/60012bf2455336df117e2a13c8dda79ae4926e62))

# 1.0.0 (2020-02-21)


### Features

* initial independent module ([21e206c](https://github.com/nest-x/nestx-amqp/commit/21e206cdf4e27b6d4ed89ff1fcea8999e411c0d0))
* **amqp:** add amqp definitions ([cb427e9](https://github.com/nest-x/nestx-amqp/commit/cb427e94aebeda795b7ac18420696212dd8f515d))

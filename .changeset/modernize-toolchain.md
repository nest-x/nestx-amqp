---
"nestx-amqp": major
---

Modernize toolchain and update NestJS support.

- **BREAKING**: Drop support for NestJS 7/8/9/10. Minimum version is now NestJS 11.0.0.
- Move `@nestjs/*` from dependencies to peerDependencies.
- Remove `patch-package`, `rimraf`, `postinstall-postinstall` from dependencies.
- Upgrade `@golevelup/nestjs-discovery` to v6.
- Migrate from Yarn + semantic-release to pnpm + changesets.
- Upgrade Jest to v29, ESLint to v9 (flat config), typescript-eslint to v8.
- CI: Node 22, actions v4, npm OIDC trusted publishing.

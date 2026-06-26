# CI Publishing

Use Registry access tokens to run validation and publishing from CI without a browser session.

## Create A Token

Create a long-lived write token for CI from a browser-authenticated CLI session:

```bash
registry token create --title "CI" --write
```

Token secrets are shown once. Store the printed value in CI as `REGISTRY_ACCESS_TOKEN`.

Preset shortcuts:

- `--write`: publish automation; includes staging channel writes.
- `--reviewer`: publish plus review/prod channel operations.
- `--admin`: broad operator token; not superuser.
- `--testing`: Registry end-to-end automation.

Use `-p, --permission <permission>` for extra explicit grants. Omit presets and permissions to create a no-permission token.

## Publish From CI

Use the token in publish jobs:

```bash
cd /path/to/app/source/
REGISTRY_ACCESS_TOKEN="$REGISTRY_ACCESS_TOKEN" registry check --require-dist
REGISTRY_ACCESS_TOKEN="$REGISTRY_ACCESS_TOKEN" registry publish
```

Grant only the permissions the CI job needs. Prefer write tokens for publish automation and keep review/channel mutation permissions separate when possible.

## Manage Tokens

Most token lifecycle commands require a browser-authenticated CLI session:

```bash
registry token list
registry token status <token-id>
registry token update <token-id>
registry token delete <token-id>
```

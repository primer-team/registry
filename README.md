# Primer Registry CLI

`@primer/registry` provides the Primer Registry CLI for publishing Primer apps and operating Registry distribution state.

## Install

```bash
npm install -g github:primer-team/registry
registry login
registry whoami
```

The CLI is available as both `registry` and `primer-registry`.

Check the installed version with:

```bash
registry --version
```

Update by rerunning the GitHub install command:

```bash
npm install -g github:primer-team/registry
```

After release tags exist, install a pinned version with:

```bash
npm install -g github:primer-team/registry#v0.2.0
```

## Publish An App

```bash
cd /path/to/app/source/
registry init
registry check
registry claim
registry assets sync
registry publish
registry status
```

When no root path is passed, Registry commands default to the current working directory. The examples above assume you are running commands from the app source root:

```
my-app/                        # project root; override with [root]
├── dist/                      # build artifacts uploaded as the version; override with --dist
├── src/
│   ├── registry-assets.gen.ts # optional typed asset helper (registry assets sync -g)
│   └── …                      # app source files, etc.
├── manifest.json              # app identity + registryAssets + thumbnailAssetId
└── …                          # assets, config, etc.
```

The source manifest defaults to `<root>/manifest.json` and the built artifact directory to `<root>/dist`; override with `--manifest <path>` / `--dist <path>`.

`registry init` prepares local manifest metadata. `registry check` validates local readiness. `registry claim` creates or confirms the app identity. `registry publish` submits a version and connects it to `staging`. `registry status` summarizes claim, version, and channel state.

Use global `--json` before any command to request one machine-readable JSON object, for example `registry --json status --app-id my-app`. Leaf command flags such as `registry status --json` remain supported. `--json` is non-interactive but not implicit approval; confirmation-gated mutations such as claiming an app in automation require `--yes --json`.

## Reusable Assets

```bash
registry assets sync
registry assets sync --check
registry assets sync --generate-typescript
registry assets sync --check --generate-typescript
```

Reusable assets are authored through `registryAssets` in the source manifest. `registry assets sync` uploads or materializes declared local/HTTPS sources, then writes canonical `registryUrl` values back into the same inline or file-backed declarations. `registry assets sync --check` verifies the manifest is already synced without uploading or writing. Add `--generate-typescript` or `-g` to write the optional TypeScript helper from synced `registryUrl` values, defaulting to `src/registry-assets.gen.ts` unless `registryAssetsModule` or `--out` is set.

## CI Tokens

Create a long-lived token for CI or agent publishing:

```bash
registry token create --title "CI" --write
```

Use the printed secret with `REGISTRY_ACCESS_TOKEN` or `--token <access-token>`. Token secrets are shown once.

## Review And Channels

Review and channel commands are available for authorized operators:

```bash
registry versions list --app-id <app-id>
registry versions approve <app-version-id>
registry channels current --app-id <app-id>
registry channels connect prod --version-id <app-version-id>
```

Approving a version connects it to `prod` automatically. `registry channels connect prod` is for moving a different approved version onto `prod` afterward; it requires an approved version and review/channel permissions. Production rollback additionally requires a `--reason`.

## Skills

See `skills/registry-app-publishing` for app publishing workflows.

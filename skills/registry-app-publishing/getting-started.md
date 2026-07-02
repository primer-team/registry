# Getting Started

Use this guide for the first local publish of a Primer app with the public Registry CLI.

The examples assume you are in the app source root (see `SKILL.md` App Layout):

```bash
cd /path/to/app/source/
```

## Install And Authenticate

Install the public Registry CLI and authenticate with a browser session:

```bash
npm install -g github:primer-team/registry
registry login
registry whoami
```

## Initialize The Manifest

Initialize a Primer app project from its source root:

```bash
registry init
```

Use `--manifest <path>` / `--dist <path>` to override the default paths (see `SKILL.md` App Layout).

## Check The Project

Check the project before claiming or publishing:

```bash
registry check
```

Publishing assumes the app manifest, built files, assets, and thumbnails satisfy the constraints in `references/app-constraints.md`, so read it before publishing.

## Claim The App ID

Claim an app identity before the first publish:

```bash
registry claim
```

`registry claim` reads the project root and source manifest, validates the app ID, and records ownership in Registry. The app ID becomes the stable identity used by future versions, channel assignments, member operations, and reusable assets.

For non-interactive automation, use `registry claim --yes --json`. `--json` never answers confirmation prompts by itself.

Use an explicit manifest path when needed:

```bash
registry claim --manifest path/to/manifest.json
```

Inspect the claimed app:

```bash
registry apps show <app-id>
registry status
```

## Publish A Version

Publishing creates an immutable app version from the current manifest and built artifact directory:

```bash
registry assets sync       # materialize declared reusable assets and write registryUrl values
registry assets sync --check
registry assets sync -g    # optional: write src/registry-assets.gen.ts from synced registryUrl values
registry publish --dry-run  # preview the upload plan without creating a version
registry publish            # an immutable version
```

A successful publish submits the version and connects it to the `staging` channel, if you have the permission.

Use an explicit root, manifest path, or build output when needed:

```bash
registry publish <root> --manifest <path> --dist <path>
```

Inspect the result:

```bash
registry versions list --app-id <app-id>
registry versions show <app-version-uuid>
registry channels current --app-id <app-id>
```

Production channel changes can require review or operator permissions; see `references/release-operations.md`.

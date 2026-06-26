---
name: registry-app-publishing
description: Claim, validate, publish, review, and operate Primer app versions with the public Registry CLI. Use when working with Registry app manifests, app IDs, version publishing, Registry assets, thumbnails, CI tokens, review, or channel assignment.
---

# Registry App Publishing

Use this skill when operating with the Primer Registry CLI.

## App Layout

A publishable app is a directory the CLI reads from. Commands default to the current working directory; pass `[root]` to point elsewhere.

```
my-app/                      # project root; override with [root]
├─ manifest.json             # app identity and asset references
├─ dist/                     # build artifacts uploaded as the version; override with --dist
├─ src/
│  ├─ registry-assets.gen.ts # optional typed asset helper; use `registry assets generate`
│  └─ …                      # app source files, etc.
└─ …                         # assets, config, etc.
```

The source manifest defaults to `<root>/manifest.json` and the built artifact directory to `<root>/dist`; override with `--manifest <path>` / `--dist <path>`.

## Routes

- `getting-started.md`: first-time app publishing flow: install, authenticate, initialize, validate, claim an app ID, publish, and inspect Registry state.
- `references/app-constraints.md`: manifest, artifact, asset, thumbnail, and runtime host-bridge requirements for publishable apps.
- `references/registry-assets.md`: reusable Registry assets, HTTPS/local asset sources, asset recovery, and thumbnail declarations.
- `references/ci-publishing.md`: create Registry access tokens and run check/publish safely from CI.
- `references/release-operations.md`: approve/reject versions and move staging/prod channel assignments.
- `references/troubleshooting.md`: diagnose common CLI, auth, validation, publish, and channel issues.

## Scope

This CLI owns the publishing surface: claiming app identity, validating a local app, publishing immutable versions, declaring reusable assets and thumbnails, reviewing versions, and moving channel assignments.

It does not author app content (use your app's own toolchain to produce `dist/`) and it is not a runtime listing API for launch surfaces. All operations go through the documented `registry` commands; there is no app-local admin path.

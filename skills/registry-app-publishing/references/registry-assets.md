# Registry Assets And Thumbnails

Reusable Registry assets are declared in the source manifest and associated with an app ID.

Use this guide when a publishable app needs reusable local or HTTPS assets, when a built bundle should reference Registry-hosted media, or when an app version needs a thumbnail.

## Reusable Assets

Declare local or HTTPS assets in `<root>/manifest.json` before publishing:

```json
{
  "appId": "my-primer-app",
  "registryAssets": [
    { "id": "thumbnail", "source": "assets/thumbnail.png" },
    { "id": "theme-audio", "source": "https://example.com/audio/theme.mp3" }
  ]
}
```

Then sync the declarations:

```bash
registry assets sync
registry assets sync --check
registry assets sync --generate-typescript
registry assets sync --check --generate-typescript
```

Local asset paths are package-root-relative. HTTPS sources must be valid Registry asset sources. Sync materializes declared assets without creating an app version and writes canonical `registryUrl` values back into the same inline or file-backed declarations.

Add `--generate-typescript` or `-g` when the app needs a typed helper module. The helper is generated from synced `registryUrl` values only, defaults to `src/registry-assets.gen.ts`, and can be redirected with `registryAssetsModule` in the manifest or `--out <path>` on the command line.

During `registry publish`, Registry-backed URLs are validated. Published version artifacts can then refer to stable Registry asset declarations.

## Thumbnails

An app version thumbnail is a reference to one uploaded Registry asset.

Declare the thumbnail as a normal reusable asset in `registryAssets`, then set `thumbnailAssetId` to that asset declaration `id`:

```json
{
  "title": "My Primer App",
  "appId": "my-primer-app",
  "thumbnailAssetId": "thumbnail",
  "registryAssets": [
    {
      "id": "thumbnail",
      "source": "assets/thumbnail.webp"
    }
  ]
}
```

Guidance:

- Prefer `16:9` artwork.
- Use `webp`, `png`, `jpg`, or `jpeg`.
- Use package-local or HTTPS asset sources through normal `registryAssets`.
- Do not use `thumbnailSource` in Registry manifests.
- Do not use `thumbnailAssetKey` in Registry manifests; that field belongs to Editor/Game Package authoring metadata.
- Run `registry assets sync` before publishing so `thumbnailAssetId` points at a materialized Registry asset.
- Run `registry check --require-dist` from the app source root before publishing.

## Recover Assets

Recover known Registry asset URLs into a manifest when needed, usually only when repairing a local manifest from remote state:

```bash
registry assets recover --app-id <app-id>
```

Use `--manifest <path>` when the source manifest is not `<root>/manifest.json`.

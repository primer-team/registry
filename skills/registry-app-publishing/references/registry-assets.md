# Registry Assets And Thumbnails

Reusable Registry assets are declared in the source manifest and associated with an app ID.

Use this guide when a publishable app needs reusable local or HTTPS assets, when a built bundle should reference Registry-hosted media, or when an app version needs a thumbnail.

## Reusable Assets

Add local or HTTPS assets before publishing:

```bash
registry assets add assets/thumbnail.png --id thumbnail
registry assets add https://example.com/audio/theme.mp3 --id theme-audio
```

Local asset paths are package-root-relative. HTTPS sources must be valid Registry asset sources.

During `registry publish`, local reusable assets are materialized and Registry-backed URLs are validated. Published version artifacts can then refer to stable Registry asset declarations.

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
- Run `registry check --require-dist` from the app source root before publishing.

## Recover Assets

Recover known Registry asset URLs into a manifest when needed:

```bash
registry assets recover --app-id <app-id>
```

Use `--manifest <path>` when the source manifest is not `<root>/manifest.json`.

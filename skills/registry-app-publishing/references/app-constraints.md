# App Constraints

A publishable Primer app has a source manifest and a built artifact directory. See `SKILL.md` App Layout for the expected directory shape and the `--manifest` / `--dist` path overrides.

## Manifest And Dist

Only the source manifest at the project root is required to identify the app. From the app source root, use `registry init` to create or normalize it before editing by hand; `appId`, `title`, and metadata all live here.

The built artifact directory only needs the app itself — an `index.html` entrypoint plus its assets. It does not need to contain a `manifest.json`: the CLI reads the source manifest and includes it in the uploaded version. From the app source root, use `registry check --require-dist` to fail locally when build output is missing before publishing.

## Artifact URLs

Files within your built artifact must reference each other by relative path, so they resolve under the version's Registry-served location — each version is served from its own path prefix the app cannot know at build time. Root-absolute paths like `/assets/app.js` resolve against the server root, not the version prefix, and will 404.

This is independent of reusable Registry assets: anything declared in `registryAssets` is materialized to an absolute Registry URL and referenced as-is — those are expected to be absolute.

This is a requirement on your build output, not any particular bundler. (A Vite build satisfies it with `base: './'`; other toolchains have their own equivalent.)

## Reusable Assets

Declare reusable app assets in `registryAssets`, then run `registry assets sync` before publishing. Local and HTTPS asset sources are materialized by sync, and publish validates the resulting Registry-backed URLs. If runtime code needs a typed asset helper, run `registry assets sync -g` after assets are synced.

See `registry-assets.md` for the asset flow and app version thumbnail guidance.

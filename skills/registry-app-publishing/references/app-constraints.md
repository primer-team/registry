# App Constraints

A publishable Primer app has a source manifest, a built artifact directory, and a runtime that can be hosted by Registry launch surfaces. See `SKILL.md` App Layout for the expected directory shape and the `--manifest` / `--dist` path overrides.

## Manifest And Dist

The source manifest must identify the app and describe the publishable package. From the app source root, use `registry init` to create or normalize the manifest before editing it by hand.

The built artifact directory must contain the files Registry should upload for the app version. From the app source root, use `registry check --require-dist` when you want missing build output to fail locally before publishing.

## Reusable Assets

Declare reusable app assets in the manifest with `registry assets add`. Local assets are materialized during publish; HTTPS assets are validated as Registry sources.

See `registry-assets.md` for the asset flow and app version thumbnail guidance.

## Runtime Host Bridge

Hosted Primer apps must speak the host bridge protocol. Use this framework-free helper as the recommended app-side starting point: it announces `game:ready`, accepts `host:init`, validates the host-provided `primerPublishableKey`, and exposes lifecycle reporters for `game:started`, `game:complete`, and `game:error`.

In local Vite dev mode, the host origin is usually `http://localhost:5173`. The embedded app's own Vite dev server may run on a different port. Change `VITE_DEV_HOST_ORIGIN` if your launch surface runs elsewhere.

```ts
const HOST_BRIDGE_VERSION = 1
const VITE_DEV_HOST_ORIGIN = 'http://localhost:5173'

type HostInitMessage = {
  bridgeVersion: typeof HOST_BRIDGE_VERSION
  primerPublishableKey: string
  type: 'host:init'
}

type GameBridgeMessage =
  | { bridgeVersion: typeof HOST_BRIDGE_VERSION; type: 'game:ready' }
  | { bridgeVersion: typeof HOST_BRIDGE_VERSION; type: 'game:started' }
  | { bridgeVersion: typeof HOST_BRIDGE_VERSION; type: 'game:complete' }
  | { bridgeVersion: typeof HOST_BRIDGE_VERSION; error: string; type: 'game:error' }

export function connectHostBridge(options: {
  hostOrigin?: string
  onInit: (primerPublishableKey: string) => void
}) {
  const hostOrigin = options.hostOrigin ?? getDefaultHostOrigin()

  function post(message: GameBridgeMessage) {
    window.parent.postMessage(message, hostOrigin)
  }

  function onMessage(event: MessageEvent<unknown>) {
    if (event.source !== window.parent) return
    if (event.origin !== hostOrigin) return
    if (!isHostInitMessage(event.data)) return

    options.onInit(event.data.primerPublishableKey)
  }

  window.addEventListener('message', onMessage)
  post({ bridgeVersion: HOST_BRIDGE_VERSION, type: 'game:ready' })

  return {
    disconnect: () => window.removeEventListener('message', onMessage),
    reportComplete: () => post({ bridgeVersion: HOST_BRIDGE_VERSION, type: 'game:complete' }),
    reportError: (error: unknown) =>
      post({ bridgeVersion: HOST_BRIDGE_VERSION, error: getErrorMessage(error), type: 'game:error' }),
    reportStarted: () => post({ bridgeVersion: HOST_BRIDGE_VERSION, type: 'game:started' }),
  }
}

function getDefaultHostOrigin() {
  return import.meta.env.DEV ? VITE_DEV_HOST_ORIGIN : window.location.origin
}

function isHostInitMessage(value: unknown): value is HostInitMessage {
  if (!isObject(value)) return false
  return (
    value.bridgeVersion === HOST_BRIDGE_VERSION &&
    value.type === 'host:init' &&
    typeof value.primerPublishableKey === 'string' &&
    value.primerPublishableKey.startsWith('pk_')
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}
```

Apps that use Primer content should wait for `host:init` before starting their Primer session, then pass the received `primerPublishableKey` to the Primer SDK or renderer. Until then, render a lightweight loading state such as `Waiting for host config`.

Apps that do not use Primer content should still speak the bridge and may ignore the publishable key after validating `host:init`.

Standalone local development may use an environment variable or local config fallback for the publishable key. Hosted/published Registry apps should rely on the host-provided `host:init` message instead of baking a key into the artifact.

Use an exact `hostOrigin` for `postMessage`; do not use `'*'` for bridge messages.

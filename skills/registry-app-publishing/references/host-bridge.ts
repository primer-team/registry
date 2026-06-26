export const HOST_BRIDGE_VERSION = 1

type BaseMessage = {
  bridgeVersion: typeof HOST_BRIDGE_VERSION
}

export type GameReadyMessage = BaseMessage & {
  type: 'game:ready'
}

export type GameErrorMessage = BaseMessage & {
  type: 'game:error'
  error: string
}

export type GameStartedMessage = BaseMessage & {
  type: 'game:started'
}

export type GameCompleteMessage = BaseMessage & {
  type: 'game:complete'
}

export type HostInitMessage = BaseMessage & {
  type: 'host:init'
  primerPublishableKey: string
}

export type GameBridgeMessage = GameReadyMessage | GameErrorMessage | GameStartedMessage | GameCompleteMessage

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isBridgeVersion = (value: unknown): value is typeof HOST_BRIDGE_VERSION => value === HOST_BRIDGE_VERSION

export function isGameBridgeMessage(value: unknown): value is GameBridgeMessage {
  if (!isObject(value)) return false
  if (!isBridgeVersion(value.bridgeVersion)) return false

  if (value.type === 'game:ready') return true
  if (value.type === 'game:started') return true
  if (value.type === 'game:complete') return true
  if (value.type === 'game:error') return typeof value.error === 'string'

  return false
}

export function isHostInitMessage(value: unknown): value is HostInitMessage {
  if (!isObject(value)) return false
  return (
    value.type === 'host:init' &&
    isBridgeVersion(value.bridgeVersion) &&
    typeof value.primerPublishableKey === 'string' &&
    value.primerPublishableKey.startsWith('pk_')
  )
}

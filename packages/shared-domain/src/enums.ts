import type { Values } from '@game/shared-utils';

export const PlayerAction = {
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  FIRE_PROJECTILE: 'FIRE_PROJECTILE'
} as const;
export type PlayerAction = Values<typeof PlayerAction>;

export const OngoingAction = {
  MOVE_UP: PlayerAction.MOVE_UP,
  MOVE_DOWN: PlayerAction.MOVE_DOWN,
  MOVE_LEFT: PlayerAction.MOVE_LEFT,
  MOVE_RIGHT: PlayerAction.MOVE_RIGHT
};
export type OngoingAction = Values<typeof OngoingAction>;

export const EntityType = {
  PLAYER: 'PLAYER',
  PROJECTILE: 'PROJECTILE'
} as const;
export type EntityType = Values<typeof EntityType>;

export const EntityOrientation = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};
export type EntityOrientation = Values<typeof EntityOrientation>;

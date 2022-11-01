export const PlayerAction = {
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  FIRE_PROJECTILE: 'FIRE_PROJECTILE'
} as const;
export type PlayerAction = keyof typeof PlayerAction;

export const OngoingAction = {
  MOVE_UP: PlayerAction.MOVE_UP,
  MOVE_DOWN: PlayerAction.MOVE_DOWN,
  MOVE_LEFT: PlayerAction.MOVE_LEFT,
  MOVE_RIGHT: PlayerAction.MOVE_RIGHT
};
export type OngoingAction = keyof typeof OngoingAction;

export const EntityType = {
  PLAYER: 'PLAYER',
  PROJECTILE: 'PLAYER'
} as const;
export type EntityType = keyof typeof EntityType;

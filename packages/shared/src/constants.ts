import { PlayerAction } from './enums';

export const TICK_RATE = 20;
export const PING_INTERVAL = 1000;

export const GRID_SIZE = 150;
export const CELL_SIZE = 20;
export const MAP_SIZE = GRID_SIZE * CELL_SIZE;

export const PLAYER_SIZE = 20;
export const PLAYER_SPEED_PER_SECOND = CELL_SIZE * 20;
export const PLAYER_SPEED = PLAYER_SPEED_PER_SECOND / TICK_RATE;
export const PLAYER_FIELD_OF_VIEW = CELL_SIZE * 8;

export const PROJECTILE_LIFESPAN = 15;
export const PROJECTILE_SIZE = 8;
export const PROJECTILE_SPEED_PER_SECOND = CELL_SIZE * 40;
export const PROJECTILE_SPEED = PROJECTILE_SPEED_PER_SECOND / TICK_RATE;
export const PROJECTILE_FIELD_OF_VIEW = CELL_SIZE * 4;

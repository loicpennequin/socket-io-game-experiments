import { Constructor, isDefined, uniqBy } from '@game/shared-utils';
import { Entity } from '../models/Entity';
import { GameMapCellDto } from '@game/shared-domain';
import { GameMapCell } from '../models/GameMap';

export const withMapAwareness = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class MapAware extends Base {
    get visibleEntities(): Entity[] {
      const entities = [this, ...this.children]
        .map(entity =>
          this.world.map.grid
            .findNearbyRadius(entity.position, entity.fieldOfView.hard)
            .map(gridItem => this.world.getEntity(gridItem.meta.id))
        )
        .flat()
        .filter(isDefined);

      return uniqBy(entities, entity => entity.id);
    }

    get visibleCells(): GameMapCell[] {
      return [this, ...this.children]
        .map(entity =>
          this.world.map.getVisibleCells(entity, entity.fieldOfView.hard)
        )
        .flat();
    }

    getCellKey(cell: GameMapCellDto) {
      return `${cell.x}.${cell.y}`;
    }
  };
};

export type MapAware = ReturnType<typeof withMapAwareness>;

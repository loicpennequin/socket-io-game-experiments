import { Constructor, isDefined, uniqBy } from '@game/shared-utils';
import { GameMapGridItem } from '../models/GameMap';
import { Entity } from '../models/Entity';
import { GameMapCell } from '@game/shared-domain';

export type GameMapGridClient = Constructor<{ gridItem: GameMapGridItem }>;

export const withMapAwareness = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class MapAwareEntity extends Base {
    protected newDiscoveredCells: Map<string, GameMapCell>;

    protected allDiscoveredCells: Map<string, GameMapCell>;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      this.allDiscoveredCells = this.world.map.getVisibleCells(
        this.position,
        this.fieldOfView.hard
      );

      this.newDiscoveredCells = this.world.map.getVisibleCells(
        this.position,
        this.fieldOfView.hard
      );
    }

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

    get discoveredCells() {
      const cells = Array.from(this.newDiscoveredCells.values());
      this.newDiscoveredCells.clear();

      return uniqBy(cells, cell => this.getCellKey(cell));
    }

    getCellKey(cell: GameMapCell) {
      return `${cell.x}.${cell.y}`;
    }

    updateVisibleCells() {
      const visibleCells = this.world.map.getVisibleCells(
        this.position,
        this.fieldOfView.soft
      );

      for (const [key, cell] of visibleCells) {
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }
    }
  };
};

export type MapAwareEntity = ReturnType<typeof withMapAwareness>;

import { TriggeredBehaviors } from '@game/shared-domain';
import { AnyConstructor } from '@game/shared-utils';
import { EventMap } from 'typed-emitter';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
export interface BehaviorKey<T extends EventMap = Record<string, () => void>>
  extends Symbol {}

export const withBehaviors = <TBase extends AnyConstructor>(Base: TBase) => {
  return class Behaviorable extends Base {
    private behaviors = new Map<BehaviorKey, EventMap>();
    triggeredBehaviors: TriggeredBehaviors = [];

    clearTrggeredBehaviors() {
      this.triggeredBehaviors = [];
    }

    hasBehavior(key: BehaviorKey) {
      return this.behaviors.has(key);
    }

    addBehavior<T extends EventMap>(key: BehaviorKey<T>, events: T) {
      return this.behaviors.set(key, events);
    }

    removeBehavior(key: BehaviorKey) {
      return this.behaviors.delete(key);
    }

    triggerBehavior<T extends EventMap, E extends keyof T>(
      key: BehaviorKey<T>,
      event: E,
      ...payload: Parameters<T[E]>
    ) {
      if (!this.hasBehavior(key)) return;

      const result = this.behaviors.get(key)?.[event as string](...payload);
      this.triggeredBehaviors.push({
        key: (event as string).toUpperCase(),
        meta: { ...(result || {}) }
      });
    }
  };
};

export type Behaviorable = ReturnType<typeof withBehaviors>;

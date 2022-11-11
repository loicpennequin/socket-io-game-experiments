import { Emittable } from './withEmitter';

export const withBehaviors = <TBase extends Emittable>(Base: TBase) => {
  return class Behaviorable extends Base {
    private behaviors = new Map<string, string[]>();

    hasBehavior(name: string) {
      return this.behaviors.has(name);
    }

    addBehavior(name: string, events: string[]) {
      return this.behaviors.set(name, events);
    }

    removeBehavior(name: string) {
      return this.behaviors.delete(name);
    }

    triggerBehavior(name: string, event: string, payload: any) {
      if (!this.hasBehavior(name)) return;
      this.emitter.emit(event, payload);
    }
  };
};

export type Behaviorable = ReturnType<typeof withBehaviors>;

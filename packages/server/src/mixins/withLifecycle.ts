import { Emittable } from './withEmitter';

export type LifecycleEvents = {
  created: (payload: any) => void;
  update: (payload: any) => void;
  destroy: (payload: any) => void;
};

export const withLifeCycle = <TBase extends Emittable>(Base: TBase) => {
  return class WithLifecycle extends Base {
    update() {
      this.emitter.emit('update', this);
    }

    destroy() {
      this.emitter.emit('destroy', this);
    }
  };
};

export type LifeCyclable = ReturnType<typeof withLifeCycle>;

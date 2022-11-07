import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { AnyConstructor } from '@game/shared-utils';

export type LifecycleEvents<T> = {
  created: (payload: T) => void;
  update: (payload: T) => void;
  destroy: (payload: T) => void;
};

export type LifecycleEmitter<T> = TypedEmitter<LifecycleEvents<T>>;

export const withLifeCycle = <TBase extends AnyConstructor>(Base: TBase) => {
  return class WithLifecycle extends Base {
    private emitter = new EventEmitter() as LifecycleEmitter<WithLifecycle>;

    on<E extends keyof LifecycleEvents<WithLifecycle>>(
      event: E,
      listener: LifecycleEvents<WithLifecycle>[E]
    ): void {
      this.emitter.on(event, listener);
    }

    off<E extends keyof LifecycleEvents<WithLifecycle>>(
      event: E,
      listener: LifecycleEvents<WithLifecycle>[E]
    ): void {
      this.emitter.off(event, listener);
    }

    update() {
      this.emitter.emit('update', this);
    }

    destroy() {
      this.emitter.emit('destroy', this);
    }
  };
};

export type LifeCyclable = ReturnType<typeof withLifeCycle>;

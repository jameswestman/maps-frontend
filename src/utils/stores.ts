import { type Readable } from "svelte/store";

export const flatten = <T>(store: Readable<Readable<T>>): Readable<T> => {
  return {
    subscribe: (callback) => {
      let innerUnsub;
      let unsub = store.subscribe((value) => {
        if (innerUnsub) {
          innerUnsub();
        }
        if (value) {
          innerUnsub = value.subscribe(callback);
        }
      });
      return () => {
        if (innerUnsub) {
          innerUnsub();
        }
        unsub();
      };
    },
  };
};

export const lazy = <T>(factory: () => Promise<T>): Lazy<T> => {
  let promise = null;
  let value = null;
  let cb = new Set<() => void>();

  return {
    subscribe(fn: (t: T) => void) {
      if (promise === null) {
        let fn2 = () => fn(value);
        cb.add(fn2);
        return () => {
          cb.delete(fn2);
        };
      }
    },
    started() {
      return promise !== null;
    },
    use(fn: (t: T) => void | Promise<void>) {
      if (promise === null) {
        promise = factory().then((v) => {
          value = v;
          for (let f of cb) {
            f();
          }
          cb.clear();
        });
      }

      promise = promise.then(async () => {
        await fn(value);
      });

      return promise;
    },
  };
};

export interface Lazy<T> {
  subscribe(fn: (t: T) => void): () => void;
  started(): boolean;
  use(fn: (t: T) => void | Promise<void>): Promise<void>;
}

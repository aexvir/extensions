import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";

const ttl = 60 * 60; // 1 hour // todo: make this configurable, maybe even per cache key / api call

type Cache<S> = {
  lastUpdate: number;
  data: S;
};

// generic cached state implementation
// receives a cache key, the initial value and a data loader function which will be used to refresh
// the state in the background and update the cache with the new data
export function useLocalState<S>(key: string, initialValue: S, dataLoader: () => Promise<S>): {state: S, updateAndSaveState: (arg0: S) => void, loading: boolean} {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<S>(initialValue);

  console.debug(`loading state for key ${key}`);

  useEffect(() => {
    (async () => {
      let cache = {} as Cache<S>;
      const dump = await LocalStorage.getItem(key);

      if (typeof dump === "string") {
        console.debug(`cache found for key ${key}`);
        cache = JSON.parse(dump) as Cache<S>;
        setState(prev => ({ ...prev, ...cache.data }));
        setLoading(false);
      }

      if (cache?.lastUpdate > Date.now() - ttl * 1000) {
        console.debug(`cache is up to date for key ${key}`);
        return;
      }

      console.debug(`started cache refresh routine for key ${key}; previous update: ${cache.lastUpdate}`);

      dataLoader()
        .then(data => {
          console.debug(`new data successfully loaded for key ${key}`);
          // merge existing cache data with fresh data
          // only overwrites elements returned by the loader, so additional items in the cache should be
          // persisted as long as the user doesn't manually clear the cache
          const merged = { ...cache.data, ...data };

          LocalStorage.setItem(key, JSON.stringify({ lastUpdate: Date.now(), data: merged } as Cache<S>));
          setState(prev => ({ ...prev, ...merged }));

          setLoading(false);
          showToast(Toast.Style.Success, "data refreshed successfully");
        })
        .catch(e => {
          showToast(Toast.Style.Failure, e.message);
        });
    })();
  }, []);

  const updateAndSaveState = (newState: S) => {
    console.debug(`updating state for key ${key}`);
    setState(prev => ({ ...prev, ...newState }));
    LocalStorage.setItem(key, JSON.stringify({ lastUpdate: Date.now(), data: newState } as Cache<S>));
  }

  return {state, updateAndSaveState, loading};
}

// clears the specific cache key and displays a toast with the outcome
export function clearLocalState(key: string) {
  LocalStorage.removeItem(key)
    .then(() => {
      showToast(Toast.Style.Success, `Cleared ${key} cache`);
    })
    .catch(() => {
      showToast(Toast.Style.Failure, `Failed to clear ${key} cache`);
    });
}

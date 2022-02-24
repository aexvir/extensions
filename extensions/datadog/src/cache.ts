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
export function useLocalState<S>(key: string, initialValue: S, dataLoader: () => Promise<S>): [S, boolean] {
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
        setState(cache.data);
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

          LocalStorage.setItem(key, JSON.stringify({ lastUpdate: Date.now(), data: data } as Cache<S>));
          setState(data);

          setLoading(false);
          showToast(Toast.Style.Success, "data refreshed successfully");
        })
        .catch(e => {
          showToast(Toast.Style.Failure, e.message);
        });
    })();
  }, []);

  return [state, loading];
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

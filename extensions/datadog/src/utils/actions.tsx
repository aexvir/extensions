import { Action, Icon } from "@raycast/api";
import { moveBetween, Identifiable } from ".";
import { clearLocalState } from "../fetchers/cache";

interface Actionable {
  apply: (id: number, args: Record<string, unknown>) => React.FC;
}

export function GetLinkTo(baseurl: string) {
  return (id: number) => <Action.OpenInBrowser url={`${baseurl}/${id}`} />;
}

export function ClearCache(key: string) {
  return () => <Action icon={Icon.Trash} title={`Clear ${key} cache`} onAction={() => clearLocalState(key)} />;
}

export function MarkFavorite(
  collection: Array<Identifiable>,
  favorites: Array<Identifiable>,
  callback: () => unknown
): Actionable {
  return (id: number, isFavorite = false) => {
    if (isFavorite) {
      return (
        <Action
          icon={Icon.XmarkCircle}
          title="Remove from favorites"
          onAction={() => {
            moveBetween(favorites, collection, id);
            callback();
          }}
        />
      );
    }

    return (
      <Action
        icon={Icon.Star}
        title="Add to favorites"
        onAction={() => {
          moveBetween(collection, favorites, id);
          callback();
        }}
      />
    );
  };
}

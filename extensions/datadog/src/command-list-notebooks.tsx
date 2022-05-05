import { NotebooksResponseData } from "@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/NotebooksResponseData";
import { ActionPanel, Icon, List } from "@raycast/api";
import { useNotebooks, Caches } from "./fetchers";
import { linkDomain, filterOut } from "./utils";
import { GetLinkTo, MarkFavorite, ClearCache } from "./utils/actions";

const Notebook = ({ data, actionables, isFavorite = false }) => {
  const icon = isFavorite ? Icon.Star : null;

  const actions = [];
  actionables.forEach(action => {
    actions.push(action(data.id));
  });

  return (
    <List.Item
      key={data.id}
      icon={icon}
      title={data.attributes.name}
      subtitle={data.attributes.metadata?.type}
      accessoryTitle={data.attributes.author?.email}
      actions={<ActionPanel>{actions}</ActionPanel>}
    />
  );
};

export default function CommandListNotebooks() {
  const { state, updateAndSaveState, notebooksAreLoading } = useNotebooks();
  filterOut(state.notebooks, state.favorites);

  const actionables = [
    GetLinkTo(`https://${linkDomain()}/notebook`),
    MarkFavorite(state.notebooks, state.favorites, updateAndSaveState),
    ClearCache(Caches.Notebooks),
  ];

  return (
    <List isLoading={notebooksAreLoading}>
      {state.favorites.length > 0 && (
        <List.Section title="Favorites" key="0-faves">
          {state.favorites.map(notebook => (
            <Notebook key={notebook.id} data={notebook} actionables={actionables} isFavorite={true} />
          ))}
        </List.Section>
      )}
      {/* this is not very nice, but there is no divider between sections currently */}
      {state.favorites.length == 0 ? (
        state.notebooks.map(notebook => (
          <Notebook key={notebook.id} data={notebook} actionables={actionables} isFavorite={true} />
        ))
      ) : (
        <List.Section title="All notebooks" key="1-all">
          {state.notebooks.map(notebook => (
            <Notebook key={notebook.id} data={notebook} actionables={actionables} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

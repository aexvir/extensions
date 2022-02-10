import { ActionPanel, getPreferenceValues, List, OpenInBrowserAction } from "@raycast/api";
import { useNotebooks } from "./useNotebooks";

// noinspection JSUnusedGlobalSymbols
export default function CommandListNotebooks() {
  const { notebooks, notebooksAreLoading } = useNotebooks();

  const SERVER = getPreferenceValues()["server"];

  return (
    <List isLoading={notebooksAreLoading}>
      {notebooks.map(notebook => (
        <List.Item
          key={notebook.id}
          icon={{ source: { light: "icon@light.png", dark: "icon@dark.png" } }}
          title={notebook.attributes.name}
          subtitle={notebook.attributes.metadata?.type}
          accessoryTitle={notebook.attributes.author?.email}
          actions={
            <ActionPanel>
              <OpenInBrowserAction url={`https://app.${SERVER}/notebook/${notebook.id}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

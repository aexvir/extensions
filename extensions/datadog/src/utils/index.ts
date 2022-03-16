import { getPreferenceValues } from "@raycast/api";

export const linkDomain = () => {
  return getPreferenceValues()["domain"] || "app." + getPreferenceValues()["server"];
};

interface Identifiable {
  id: number;
}

export function moveBetween(from: Array<Identifiable>, to: Array<Identifiable>, id: number): void {
  from.forEach((el, idx) => {
    if (el.id === id) {
      to.push(el);
      from.splice(idx, 1);
      return;
    }
  });
}

export function filterOut(from: Array<Identifiable>, items: Array<Identifiable>): void {
  items.forEach(item => {
    from.forEach((el, idx) => {
      if (el.id === item.id) {
        from.splice(idx, 1);
        return; // each item is assumed to be only once in from, so return as soon as found
      }
    });
  });
}

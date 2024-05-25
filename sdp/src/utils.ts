export function fileExists(matches: string[], searchElement: string) {
  if (matches.indexOf(searchElement) < 0) {
    throw new Error(`${searchElement} does not exist`);
  }
}

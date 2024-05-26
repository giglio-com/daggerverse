import { Directory } from "@dagger.io/dagger";

export async function patternMatchOrThrowException(
  directory: Directory,
  pattern: string,
): Promise<void> {
  const results: string[] = await directory.glob(pattern);
  if (results.length === 0) {
    throw Error(`${pattern} does not exist`);
  }
}

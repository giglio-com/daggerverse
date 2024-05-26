export interface ImageInterface {
  domain: string;
  project: string;
  repository: string;
  tag: string;

  getImage(): string;
}

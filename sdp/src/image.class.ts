import { ImageInterface } from "./image.interface";

type ImageConstructor = Partial<Omit<ImageInterface, "getImage()">>;

export class ImageClass implements ImageInterface {
  domain: string;
  project: string;
  repository: string;
  tag: string;

  constructor(image: ImageConstructor) {
    Object.assign(this, image);
  }

  getImage(): string {
    return [
      [this.domain, this.project, this.repository].join("/"),
      this.tag,
    ].join(":");
  }
}

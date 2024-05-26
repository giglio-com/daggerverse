import { ImageClass } from "./image.class";
import { ImageInterface } from "./image.interface";

export interface ServiceInterface {
  name: string;
  dockerFile: string;
  image: ImageInterface;
  context: string; //".",
  buildArg: string; //"--file ${path} "
}

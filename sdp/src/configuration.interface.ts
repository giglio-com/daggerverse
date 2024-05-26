import { ServiceInterface } from "./service.interface";

type ServiceInConfiguration = Partial<Omit<ServiceInterface, "">>;

export interface ConfigurationInterface {
  namespace: string;
  strategy: string;
  services: ServiceInConfiguration[];
}

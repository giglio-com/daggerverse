/**
 * A generated module for Sdp functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */

import {
  dag,
  Container,
  Directory,
  object,
  func,
  connect,
  Client,
} from "@dagger.io/dagger";
import { patternMatchOrThrowException } from "./utils";
import * as YAML from "yaml";
import { ConfigurationInterface } from "./configuration.interface";
import { ServiceInterface } from "./service.interface";
import { ImageClass } from "./image.class";
import * as domain from "node:domain";
import { WorkspaceInterface } from "./workspace.interface";
import { string } from "yaml/dist/schema/common/string";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Sdp {
  static readonly sdpConfigFileName: string = "sdp.yaml";

  sdpConfiguration: ConfigurationInterface;
  directoryArg: Directory;

  repoName: string;
  gitSha: string;

  domainRegistry: string;
  domainProject: string;
  envShortName: string;

  nodeVersion: string;
  nodeImage: string;

  /**
   *
   * @param directoryArg
   * @param repoName
   * @param domainRegistry
   * @param domainProject
   * @param gitSha
   * @param envShortName
   */
  constructor(
    directoryArg: Directory,
    repoName: string,
    domainRegistry: string,
    domainProject: string,
    gitSha: string,
    envShortName: string,
  ) {
    this.directoryArg = directoryArg;
    this.repoName = repoName;
    this.domainRegistry = domainRegistry;
    this.domainProject = domainProject;
    this.gitSha = gitSha;
    this.envShortName = envShortName;
  }

  /**
   * Returns a container that echoes whatever string argument is provided
   */
  @func()
  containerEcho(stringArg: string): Container {
    return dag.container().from("alpine:latest").withExec(["echo", stringArg]);
  }

  /**
   * Returns lines that match a pattern in the files of the provided Directory
   */
  @func()
  async grepDir(directoryArg: Directory, pattern: string): Promise<string> {
    return dag
      .container()
      .from("alpine:latest")
      .withMountedDirectory("/mnt", directoryArg)
      .withWorkdir("/mnt")
      .withExec(["grep", "-R", pattern, "."])
      .stdout();
  }

  async setConfiguration(): Promise<void> {
    await patternMatchOrThrowException(
      this.directoryArg,
      Sdp.sdpConfigFileName,
    );
    const configurationContents = await this.directoryArg
      .file("sdp.yaml")
      .contents();
    //@todo add validation to sdp.yaml
    this.sdpConfiguration = YAML.parse(configurationContents);
  }

  @func()
  async build(): Promise<string> {
    await this.setConfiguration();
    const services: ServiceInterface[] = await this.getServicesToBuild();
    return JSON.stringify(services);
  }

  async getServicesToBuild(): Promise<ServiceInterface[]> {
    if (this.sdpConfiguration.strategy === "Dockerfile") {
      await patternMatchOrThrowException(this.directoryArg, "Dockerfile");
      // @todo make Service Class and it's constructor or getter/setter methods
      return [
        {
          dockerFile: "Dockerfile",
          name: this.repoName,
          image: new ImageClass({
            domain: this.domainRegistry,
            project: this.domainProject,
            repository: this.repoName,
            tag: this.gitSha,
          }),
          buildArg: "",
          context: ".",
        },
      ];
    } else if (this.sdpConfiguration.strategy === "lerna") {
      //@todo trovare un modo per restituire nullla è cambiato e passare a lerna list con la selezione di jenkins
    } else {
      throw Error(
        `${this.sdpConfiguration.strategy} strategy is not supported`,
      );
    }
  }

  async setNodeImage(): Promise<void> {
    await patternMatchOrThrowException(this.directoryArg, ".nvmrc");
    const nodeVersion = await this.directoryArg.file(".nvmrc").contents();
    const regExp: RegExp =
      /^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$\n/;
    if (regExp.test(nodeVersion)) {
      this.nodeVersion = nodeVersion;
      this.nodeImage = `node:${nodeVersion}-slim`;
    } else {
      //@todo testare
      throw new Error(".nvmrc not contains a SemVer");
    }
  }

  async getServicesToBuildFromLerna(): Promise<ServiceInterface[]> {
    await this.setNodeImage();
    const conventionalGraduate: string =
      this.envShortName === "prod" ? "--conventional-graduate" : "";

    const lernaChanged: string = await dag
      .container()
      .from(this.nodeImage)
      .withMountedDirectory("/mnt", this.directoryArg)
      .withWorkdir("/mnt")
      // .withExec([
      //   "npx",
      //   "lerna",
      //   `changed --json -a ${conventionalGraduate} --include-merged-tags`,
      // ])
      //@todo remove debug purpose only
      .withExec(["npx", "list", `--json -a -l`])
      .stdout();

    //@todo classValidator and ClassTransformer and create Class Workspace
    //@todo merge availableworkspace with lerna list/change
    const workspaces: WorkspaceInterface[] = JSON.parse(lernaChanged);
    const availableWorkspaces = this.sdpConfiguration.services.reduce(
      (acc, next) => {
        acc.push(next.name);
        return acc;
      },
      [],
    );
    // return workspaces
    //   .filter(
    //     (workspace: WorkspaceInterface) =>
    //       availableWorkspaces.indexOf(workspace) > -1,
    //   )
    //   .map((workspace) => {
    //     return {
    //       name: workspace.name,
    //       dockerFile: workspace.
    //       image: new ImageClass({
    //
    //         domain: this.domainRegistry,
    //         project: this.domainProject,
    //         repository: `${this.repoName}_${workspace.name}`,
    //         tag: this.gitSha,
    //       }),
    //       buildArg: "",
    //       context: workspace.location,
    //     };
    //   });
  }
}

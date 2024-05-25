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

import { dag, Container, Directory, object, func } from "@dagger.io/dagger";
import { fileExists } from "./utils";
import * as yaml from "yaml";
import { ConfigurationInterface } from "./configuration.interface";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Sdp {
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

  @func()
  async getImagesToBuild(directoryArg: Directory): Promise<string> {
    const sdpConfig = await directoryArg.glob("spd.yaml");
    fileExists(sdpConfig, "sdp.yaml");

    const files = await directoryArg.entries({ path: "." });
    if (files.length < 1) {
      throw Error("sdp configuration not exits");
    }
    const glob = await directoryArg.glob("**/*.css");
    // const configuration = await directoryArg.file("sdp-a.yaml").contents();
    // const configurationJSON: ConfigurationInterface = yaml.parse(configuration);
    return JSON.stringify(glob);
  }
}

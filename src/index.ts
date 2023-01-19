import "./type-extensions";
export * from "./type-extensions";
import { addPlugin, ExtenderActionParams } from "locklift/plugins";
import "locklift";
import { PLUGIN_NAME } from "./type-extensions";
import { getVerificationApp } from "./verification-cli";

addPlugin({
  pluginName: PLUGIN_NAME,

  commandBuilders: [
    {
      commandCreator: (command) =>
        command.name("verify").action(async (option: ExtenderActionParams) => {
          const config = option.config();
          if (!("version" in config.compiler) || !("version" in config.linker)) {
            throw new Error("The verification plugin supports only explicitly provided linker and compiler version");
          }
          const verificationApp = await getVerificationApp({
            version: option.config().verificationPlugin.version,
            linkerVersion: config.linker.version as unknown as string,
            compilerVersion: config.compiler.version as unknown as string,
            apiKey: option.config().verificationPlugin.apiKey,
            secret: option.config().verificationPlugin.secretKey,
            license: option.config().verificationPlugin.license || "AGPL-3.0-or-later",
          });
          debugger;
          await verificationApp.verify({ contractsPath: option.contracts });
          process.exit(0);
        }),
    },
  ],
});

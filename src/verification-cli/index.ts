import envPaths from "env-paths";
import {
  getCompilerHash,
  getPathToBinaries,
  getPlatform,
  getSupportedCompilers,
  getVerificationAppReleases,
  tryToGetNodeModules,
} from "./utils";
import path from "path";
import * as fs from "fs-extra";
import { exec, execSync } from "child_process";

export class VerificationCli {
  constructor(
    private readonly pathToBinary: string,
    private readonly compilerHash: string,
    private readonly linkerVersion: string,
    private readonly apiKey: string,
    private readonly secret: string,
    private readonly license: string,
  ) {}

  verify = async ({ contractsPath }: { contractsPath?: string }) => {
    const child = exec(
      `${this.pathToBinary} verify -i ${contractsPath || "contracts"} --license ${this.license} --api-key ${
        this.apiKey
      } --secret ${this.secret}  --compiler-version ${this.compilerHash} --linker-version ${this.linkerVersion} -I ${
        tryToGetNodeModules() || "node_modules"
      } --compile-all --assume-yes`,
    );

    await new Promise((r, e) => {
      child.stdout?.on("data", (data) => {
        if (data.includes("Waiting for verification")) {
          process.stdout.moveCursor(0, -1);
          process.stdout.clearLine(1);
        }
        console.log(data);
      });

      child.stderr?.on("error", e);
      child.stdout?.on("close", r);
    });
  };
}

export const getVerificationApp = async ({
  version,
  compilerVersion,
  linkerVersion,
  secret,
  apiKey,
  license,
}: {
  version: "latest" | `${string}.${string}.${string}`;
  compilerVersion: string;
  linkerVersion: string;
  apiKey: string;
  secret: string;
  license: string;
}) => {
  const verificationPathsRootPath = envPaths("loclift_verification").cache;
  fs.ensureDirSync(verificationPathsRootPath);
  const releases = await getVerificationAppReleases();
  const verificationVersion = version === "latest" ? releases[0] : releases.find((el) => el === version);
  if (!verificationVersion) {
    throw new Error(`Not found verification app version ${version}\n supported versions: ${releases.join(", ")}`);
  }
  // Check compiler
  const compilerToHashMapPath = path.resolve(verificationPathsRootPath, "compiler-to-commit.json");
  const compilerHash = await getCompilerHash({ compilerToHashMapPath, compilerVersion });
  const { compilers, linkers } = await getSupportedCompilers().catch((e) => {
    throw new Error(`Fetch supported compilers error ${e}`);
  });

  const isCompilerSupported = compilers.some((compiler) => compiler === compilerHash);
  if (!isCompilerSupported) {
    throw new Error(`Compiler ${compilerVersion} not supported\n supported compilers: ${compilers.join(", ")}`);
  }
  const isLinkerSupported = linkers.some((linker) => linker === linkerVersion);
  if (!isLinkerSupported) {
    throw new Error(`Linker ${linkerVersion} not supported\n supported linkers: ${linkers.join(", ")}`);
  }

  const platform = getPlatform();

  const pathToVerificationApp = path.resolve(`${verificationPathsRootPath}/${verificationVersion}/${platform}`);

  fs.ensureDirSync(`${verificationPathsRootPath}/${verificationVersion}`);

  const pathToBinaries = await getPathToBinaries({
    pathToVerificationApp: pathToVerificationApp,
    version: verificationVersion,
  });
  return new VerificationCli(pathToBinaries, compilerHash, linkerVersion, apiKey, secret, license);
};

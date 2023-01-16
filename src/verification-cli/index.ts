import envPaths from "env-paths";
import { getCompilerHash, getPathToBinaries, getPlatform, getSupportedCompilers } from "./utils";
import path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";

export class VerificationCli {
  constructor(
    private readonly pathToBinary: string,
    private readonly compilerHash: string,
    private readonly linkerVersion: string,
    private readonly apiKey: string,
    private readonly secret: string,
  ) {}

  verify = async ({ contractsPath }: { contractsPath?: string }) => {
    const child = exec(
      `${this.pathToBinary} verify -i ${contractsPath || "contracts"} --license 'AGPL-3.0-or-later' --api-key ${
        this.apiKey
      } --secret ${this.secret}  --compiler-version ${this.compilerHash} --linker-version ${
        this.linkerVersion
      } -I node_modules --compile-all --assume-yes`,
    );
    child.stdout?.on("data", console.log);
    await new Promise((r, e) => {
      child.on("close", r);
      child.on("error", e);
    });
  };
}

export const getVerificationApp = async ({
  version,
  compilerVersion,
  linkerVersion,
  secret,
  apiKey,
}: {
  version: string;
  compilerVersion: string;
  linkerVersion: string;
  apiKey: string;
  secret: string;
}) => {
  const verificationPathsRootPath = envPaths("loclift_verification").cache;
  // Check compiler
  const compilerToHashMapPath = path.resolve(verificationPathsRootPath, "compiler-to-commit.json");
  const compilerHash = await getCompilerHash({ compilerToHashMapPath, compilerVersion });
  const { compilers, linkers } = await getSupportedCompilers();

  const isCompilerSupported = compilers.some((compiler) => compiler === compilerHash);
  if (!isCompilerSupported) {
    throw new Error(`Compiler ${compilerVersion} not supported\n supported compilers: ${compilers.join(", ")}`);
  }
  const isLinkerSupported = linkers.some((linker) => linker === linkerVersion);
  if (!isLinkerSupported) {
    throw new Error(`Linker ${linkerVersion} not supported\n supported linkers: ${linkers.join(", ")}`);
  }

  const platform = getPlatform();

  const pathToVerificationApp = path.resolve(`${verificationPathsRootPath}/${version}/${platform}`);

  fs.ensureDirSync(`${verificationPathsRootPath}/${version}`);

  const pathToBinaries = await getPathToBinaries({
    pathToVerificationApp: pathToVerificationApp,
    version,
  });
  return new VerificationCli(pathToBinaries, compilerHash, linkerVersion, apiKey, secret);
};

import os from "os";
import { supportedPlatforms } from "./constants";
import axios from "axios";
import * as fs from "fs-extra";
import { ungzip } from "node-gzip";
import tar from "tar";
import path, { resolve } from "path";
import { spawn } from "child_process";

export const getPlatform = (): string => {
  const type = os.type();
  const architecture = os.arch();
  let rustTarget = supportedPlatforms.find(({ TYPE, ARCHITECTURE }) => type === TYPE && ARCHITECTURE === architecture);
  if (!rustTarget) {
    throw new Error(`Verification plugin doesn't support ${type} Os with ${architecture} architecture`);
  }
  return rustTarget.RUST_TARGET;
};

export async function download(fileUrl: string, outputLocationPath: string) {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  })
    .then((response) => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);

        let error: Error | null;
        writer.on("error", (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on("close", () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    })
    .catch(async (e) => {
      await fs.unlink(outputLocationPath);
      throw e;
    });
}
export const getVerificationAppReleases = (): Promise<Array<string>> => {
  const url = `https://api.github.com/repos/broxus/everscan-verify/releases`;
  return axios.get<Array<{ tag_name: string }>>(url).then((res) => res.data.map((el) => el.tag_name.replace("v", "")));
};
export const getPathToBinaries = async ({
  pathToVerificationApp,
  version,
}: {
  pathToVerificationApp: string;
  version: string;
}) => {
  const platform = getPlatform();
  const isWindows = os.platform() === "win32";
  const pathWithExtension = `${pathToVerificationApp}${isWindows ? ".exe" : ""}`;
  if (fs.existsSync(pathWithExtension)) {
    return pathWithExtension;
  }
  console.log(`Downloading everscan-verify@${version} app...`);
  const repo_url = "https://github.com/broxus/everscan-verify";
  const appName = "everscan-verify";
  const url = `${repo_url}/releases/download/v${version}/${appName}-v${version}-${platform}.tar.gz`;
  const pathToGzippedFile = `${pathToVerificationApp}.tar.gz`;
  await download(url, pathToGzippedFile).catch((e) => {
    throw new Error(`Downloading everscan-verify error\n fetch url: ${url}\n ${e.message}`);
  });
  fs.ensureDirSync(pathToVerificationApp);
  try {
    await tar.x({
      cwd: pathToVerificationApp,
      file: pathToGzippedFile,
    });
    fs.rmSync(pathToGzippedFile);
    debugger;
    fs.moveSync(
      path.resolve(pathToVerificationApp, "dist", `everscan-verify${isWindows ? ".exe" : ""}`),
      pathToVerificationApp + "temp",
    );
    fs.rmSync(pathToVerificationApp, { recursive: true });
    fs.moveSync(pathToVerificationApp + "temp", pathWithExtension);
    fs.chmodSync(pathWithExtension, "755");
    console.log(`Everscan-verify@${version} was downloaded`);

    return pathWithExtension;
  } catch (e) {
    console.log(`Downloading error`);
    try {
      fs.rmSync(pathToGzippedFile);
    } catch (e) {}

    throw new Error(e as string);
  }
};

export const getSupportedCompilers = async (): Promise<{ compilers: Array<string>; linkers: Array<string> }> => {
  const compilers = await axios
    .get<Record<string, string>>("https://verify.everscan.io/supported/solc")
    .then((res) => Object.keys(res.data));

  const linkers = await axios.get<Array<string>>("https://verify.everscan.io/supported/linker").then((res) => res.data);
  return {
    compilers,
    linkers,
  };
};
const getHashToCompilerMap = async () => {
  return axios
    .get<Array<{ name: string; commit: { sha: string } }>>(
      `https://api.github.com/repos/tonlabs/TON-Solidity-Compiler/tags`,
    )
    .then((res) => res.data)

    .then((res) =>
      res.reduce((acc, { commit: { sha }, name }) => ({ ...acc, [name]: sha }), {} as Record<string, string>),
    );
};
export const getCompilerHash = async ({
  compilerVersion,
  compilerToHashMapPath,
}: {
  compilerToHashMapPath: string;
  compilerVersion: string;
}): Promise<string> => {
  if (!fs.existsSync(compilerToHashMapPath)) {
    fs.writeFileSync(compilerToHashMapPath, JSON.stringify({}));
  }
  let compilerToHashMap = JSON.parse(fs.readFileSync(compilerToHashMapPath, "utf-8")) as Record<string, string>;
  if (!compilerToHashMap[compilerVersion]) {
    console.log(`Finding hash for compiler ${compilerVersion} ...`);
    compilerToHashMap = await getHashToCompilerMap().catch((e) => {
      throw new Error(`Fetch compiler hashes error ${e}`);
    });
    if (!compilerToHashMap[compilerVersion]) {
      throw new Error("Compiler not exists, please check your locklift.config and the compiler version");
    }
    console.log(`Found hash ${compilerToHashMap[compilerVersion]} for compiler ${compilerVersion}`);

    fs.writeFileSync(compilerToHashMapPath, JSON.stringify(compilerToHashMap));
  }
  return compilerToHashMap[compilerVersion];
};

export const tryToGetNodeModules = (): string | undefined => {
  const findNodeModules = require("find-node-modules");

  try {
    return resolve(findNodeModules()[0]);
  } catch (e) {
    return undefined;
  }
};

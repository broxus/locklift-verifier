import { getVerificationApp } from "./verification-cli";

const main = async () => {
  await getVerificationApp({
    version: "latest",
    compilerVersion: "",
    linkerVersion: "",
    apiKey: "***",
    secret: "***",
    license: "AGPL-3.0-or-later",
  });
};

main();

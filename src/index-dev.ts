import { getVerificationApp } from "./verification-cli";

const main = async () => {
  await getVerificationApp({
    version: "1.6.8",
    compilerVersion: "",
    linkerVersion: "",
    apiKey: "***",
    secret: "***",
    license: "AGPL-3.0-or-later",
  });
};

main();

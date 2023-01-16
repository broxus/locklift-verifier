import { getVerificationApp } from "./verification-cli";

const main = async () => {
  await getVerificationApp({
    version: "1.6.8",
    compilerVersion: "",
    linkerVersion: "",
    apiKey: "ltiXLqM8q1",
    secret: "YhbJHWLH57gspZhh9kDU",
  });
};

main();

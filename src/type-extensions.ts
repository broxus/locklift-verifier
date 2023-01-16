export const PLUGIN_NAME = "verificationPlugin" as const;

type LockliftConfigExtension = {
  verificationPlugin: {
    version: string;
    apiKey: string;
    secretKey: string;
  };
};

declare module "locklift" {
  export interface LockliftConfig extends LockliftConfigExtension {}
}
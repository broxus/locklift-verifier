export const PLUGIN_NAME = "verificationPlugin" as const;

type LockliftConfigExtension = {
  verifier: {
    verifierVersion: "latest" | `${string}.${string}.${string}`;
    apiKey: string;
    secretKey: string;
    license?: string;
  };
};

declare module "locklift" {
  export interface LockliftConfig extends LockliftConfigExtension {}
}

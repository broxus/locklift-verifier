# Locklift Verification plugin

<p align="center">
    <p align="center">
        <a href="/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/badge/license-Apache--2.0-orange" />
        </a>
        <a href="https://www.npmjs.com/package/locklift-verifier">
            <img alt="npm" src="https://img.shields.io/npm/v/locklift-verifier">
        </a>
    </p>
</p>


## Install
Inside the locklift project
```shell
npm i locklift-verifier
```

Inside the locklift.config.ts
```typescript
import "locklift-verifier";

const config: LockliftConfig = {
    verificationPlugin: {
        version: "1.6.12", // contract verifier binary, see https://github.com/broxus/everscan-verify
        apiKey: "APIKEY",
        secretKey: "SECRET",
       // license: "AGPL-3.0-or-later", <- this is default value and can be overrided
    },
  ///////////////////
}
```

## Usage
```shell
npx locklift verify
```
Example output
```text
✅ Verified contracts:

╭────────────────────────────────┬──────────────────────────────────────────────────────────────────╮
│ Contract path                  ┆ Code hash                                                        │
╞════════════════════════════════╪══════════════════════════════════════════════════════════════════╡
│ /app/contracts/src/Sample.tsol ┆ a47ca4e6f055804482d01eeb65bc4a4d6aff83fd3cb703da3ff3569480b3c6e1 │
╰────────────────────────────────┴──────────────────────────────────────────────────────────────────╯
```




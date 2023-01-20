# Locklift Verification plugin


## install
Inside the locklift project
```shell
npm i locklift-verification-plugin
```

Inside the locklift.config.ts
```typescript
import "locklift-verification-plugin";

const config: LockliftConfig = {
    verificationPlugin: {
        version: "latest", // or can be explicitly specified from this page `https://github.com/broxus/everscan-verify/releases`
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




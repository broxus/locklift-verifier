# Locklift Verification plugin


## install
Inside the locklift project
```shell
npm i locklift-verification-plugin
```

Inside the locklift.config.ts
```typescript
import "verification-plugin";

const config: LockliftConfig = {
    verificationPlugin: {
        version: "1.6.10",
        apiKey: "APIKEY",
        secretKey: "SECRET",
    },
  ///////////////////
}
```

## Usage
```shell
npx locklift -n local verify
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




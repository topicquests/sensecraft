# SenseCraft

This is the front-end of the SenseCraft project. It uses the Quasar/Vue ecosystem. You need Postgrest running in the background, as described in the `server` directory.

## Install the dependencies

We assume node 18 is installed. We set `.nvmrc` to use `lts/hydrogen`.

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

Note: If your build complains about `ERR_OSSL_EVP_UNSUPPORTED`, you may have to set a `NODE_OPTIONS=--openssl-legacy-provider` environment variable.

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
npm run build
```

### Customize the configuration

See [Configuring quasar.conf.js](https://v1.quasar.dev/quasar-cli/quasar-conf-js).

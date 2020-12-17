# Sting desktop wallet - DEPRECATED

[![Join our community](https://img.shields.io/badge/discord-join%20chat-738bd7.svg)](https://discord.gg/v9PDKRN)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/erd_dev)

**PLEASE NOTE: The Sting desktop wallet is no longer under active development, and has been replaced by the [Sting web wallet](https://github.com/erdDEVcode/sting). Various elements of Sting have been split out into separate components, e.g. [erdbox](https://edbox.erd.dev). This repository is provided here just for reference sake.**

Cross-platform wallet for the [Elrond](https://elrond.com) blockchain.

Features:
* **Works on Windows, OS X and Linux** _(Sting is currently desktop-only)_.
* Unified balance view (staking/delegation + wallet).
* Send transactions, with full gas customization.
* Import wallet via seed/mnemonic, JSON/PEM file, Ledger nano.
* Switch between networks (currently supported: mainnet, testnet).

## Developer guide

_Note: Instructions are for OS X_.

Install all pre-requisites:

```shell
yarn
```

### Running the app locally

Create `buildConfig.json`:

```shell
cp buildConfig.json.default buildConfig.json
```

In one terminal run the React builder:

```shell
yarn start-react
```

In a separate terminal run Electron:

```shell
yarn start
```

To test the Dapp browser run the test Dapp in a separate terminal

```shell
cd test-dapp
yarn
yarn start
```

### Building the app

Install pre-requisites:

```shell
$ brew install fakeroot dpkg
$ brew cask install xquartz wine-stable
```

Build the app:

```shell
$ yarn build
```

The `out/make` folder contains the final output packages.

### Publishing a release

Create and publish a release:

```shell
yarn release
```

**Remember to commit change and push to Github after this.**

This process will:

* Call `yarn build`
* Update [CHANGELOG.md](./CHANGELOG.md)
* Create a git tag for the release
* Create a [Github releases](https://github.com/erdDEVcode/sting/releases) page for the release
* Upload the built app assets to the Github release page


## License

AGPLv3

## Why "Sting"?

According to the [LOTR wiki](https://lotr.fandom.com/wiki/Sting), Sting was an _"ancient Elvish blade made by weapon-smiths in Gondolin"_. It was carried by
some of the main characters in the story.

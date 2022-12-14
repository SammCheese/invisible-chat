# Replugged plugin template

[Use this template](https://github.com/replugged-org/plugin-template/generate)

## Prerequisites

- NodeJS
- pnpm: `npm i -g pnpm`
- [Replugged](https://github.com/replugged-org/replugged#installation)

## Install

1. [Create a copy of this template](https://github.com/replugged-org/plugin-template/generate)
2. Clone your new repository and cd into it
3. Install dependencies: `pnpm i`
4. Build the plugin: `pnpm run build`
5. Reload Discord to load the plugin

The unmodified plugin will log "Typing prevented" in the console when you start typing in any
channel.

## Development

The code must be rebuilt after every change. You can use `pnpm run watch` to automatically rebuild
the plugin when you save a file.

Building using the script above will automatically install the updated version of the plugin in
Replugged. You can find the plugin folder directories for your OS
[here](https://github.com/replugged-org/replugged#installing-plugins-and-themes).  
If you don't want to install the updated version, set the `NO_INSTALL` environment variable with any
value: `NO_INSTALL=true pnpm run build`.

You can format the code by running `pnpm run lint:fix`. The repository includes VSCode settings to
automatically format on save.

API docs coming soon(tm)

## Distribution

For plugin distribution, Replugged uses bundled `.asar` files. Bundled plugins can be installed to
the same plugin folder as listed above.

This repository includes a GitHub workflow to compile and publish a release with the asar file. To
trigger it, create a tag with the version number preceded by a `v` (e.g. `v1.0.0`) and push it to
GitHub:

```sh
git tag v1.0.0
git push --tags
```

The Replugged updater (coming soon™) will automatically check for updates on the repository
specified in the manifest. Make sure to update it to point to the correct repository!

You can manually compile the asar file with `pnpm run build-and-bundle`.

## Troubleshooting

### Make sure Replugged is installed and running.

Open Discord settings and make sure the Replugged tab is there. If not,
[follow these instructions](https://github.com/replugged-org/replugged#installation) to install
Replugged.

### Make sure the plugin is installed.

Check the [plugin folder](https://github.com/replugged-org/replugged#installing-plugins-and-themes)
for your OS and make sure the plugin is there. If not, make sure you have built the plugin and that
the `NO_INSTALL` environment variable is not set.  
You can run `replugged.plugins.list().then(console.log)` in the console to see a list of plugins in
the plugin folder.

### Make sure the plugin is running.

Check the console for a message saying `[Replugged:Plugin:Plugin Template] Plugin started`. If you
don't see it, try reloading Discord. If that doesn't work, check for any errors in the console.

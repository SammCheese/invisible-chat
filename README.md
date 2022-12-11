# Replugged plugin template

[Use this template](https://github.com/replugged-org/plugin-template/generate)

## Prerequisites

-   NodeJS
-   pnpm: `npm i -g pnpm`
-   [Replugged](https://github.com/replugged-org/replugged#installation)

## Install

1. [Create a copy of this template](https://github.com/replugged-org/plugin-template/generate)
2. Clone your new repository and cd into it
3. Install dependencies: `pnpm i`
4. Build the plugin: `pnpm run build`
5. Reload Discord to load the plugin

The unmodified plugin will log "Typing prevented" in the console when you start typing in any channel.

## Development

The code must be rebuilt after every change. You can use `pnpm run watch` to automatically rebuild the plugin when you save a file.

Building using the script above will automatically install the updated version of the plugin in Replugged. You can find the plugin folder directories for your OS [here](https://github.com/replugged-org/replugged#installing-plugins-and-themes).  
If you don't want to install the updated version, set the `NO_INSTALL` environment variable with any value: `NO_INSTALL=true pnpm run build`.

You can format the code by running `pnpm run lint:fix`. The repository includes VSCode settings to automatically format on save.

## Distribution

You can compile a packed `.asar` file for distribution with `pnpm run build-and-bundle`. This can be installed to the same plugin folder as listed above.

GitHub workflow and more distribution tools coming soon(tm)

## Troubleshooting

### Make sure Replugged is installed and running.

Open Discord settings and make sure the Replugged tab is there. If not, [follow these instructions](https://github.com/replugged-org/replugged#installation) to install Replugged.

### Make sure the plugin is installed.

Check the [plugin folder](https://github.com/replugged-org/replugged#installing-plugins-and-themes) for your OS and make sure the plugin is there. If not, make sure you have built the plugin and that the `NO_INSTALL` environment variable is not set.  
You can run `replugged.plugins.list().then(console.log)` in the console to see a list of plugins in the plugin folder.

### Make sure the plugin is running.

Check the console for a message saying `[Replugged:Plugin:Plugin Template] Plugin started`. If you don't see it, try reloading Discord. If that doesn't work, check for any errors in the console.

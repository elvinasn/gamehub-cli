# GameHub CLI

The **GameHub CLI** is a command-line tool for game developers to upload and manage their game assets on the GameHub platform. This CLI offers functionalities for logging in, initializing configurations, building and uploading game assets, and more.

## Installation

First, ensure you have Node.js installed on your system. Then, install the CLI via npm:

```bash
npm install -g gamehub-cli
```

## Commands & Usage

First, you have to have an account on the GS Dashboard and have access to the GameHub platform.

### `gamehub login`

Logs in to the GameHub platform.

```bash
gamehub login
```

### `gamehub logout`

Logs out of the GameHub platform.

```bash
gamehub logout
```

### `gamehub whoami`

Displays the current user's information.

```bash
gamehub whoami
```

### `gamehub init`

Initializes the configuration for the current directory with the organization, game, and platform. This command must be run in the root directory of the game project.

```bash
gamehub init
```

### `gamehub info`

Provides information about the current configuration.

```bash
gamehub info
```

### `gamehub build`

Uploads the game assets to the GameHub platform.

```bash
gamehub build
```

### `gamehub delete-version`

Deletes a specific version of the game.

```bash
gamehub delete-version
```

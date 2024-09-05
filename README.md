# GameHub CLI

The **GameHub CLI** is a command-line tool for game developers to upload and manage their game assets on the GameHub platform. This CLI offers functionalities for logging in, initializing configurations, building and uploading game assets, and more.

## Installation

First, ensure you have Node.js installed on your system. Then, install the CLI via npm or yarn:

```bash
npm install -g gamehub-cli
# or
yarn global add gamehub-cli
```

## Commands & Usage

First, you have to have an account on the GS Dashboard and have access to the GameHub platform.

### `gamehub login`

To login to the GameHub platform, run the following command:

```bash
gamehub login
```

### `gamehub logout`

To logout from the GameHub platform, run the following command:

```bash
gamehub logout
```

### `gamehub whoami`

To check the current user, run the following command:

```bash
gamehub whoami
```

### `gamehub init`

To initialize the configuration for the current directory with the organization, game, and platform use this command. This command must be run in the root directory of the game project.

```bash
gamehub init
```

### `gamehub info`

To get the information about the current game, run the following command:

```bash
gamehub info
```

### `gamehub build`

To upload game assets to the GameHub platform, run the following command:

```bash
gamehub build
```

### `gamehub delete-pending-version`

To delete a pending version of the game, run the following command:

```bash
gamehub delete-pending-version
```

### `gamehub delete-old-version`

To delete an old version of the game, run the following command:

```bash
gamehub delete-old-version
```

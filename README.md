# Edge viewer

This project only purpose is to visualize the graph of edge stacks, edge schedules and related items from a Portainer DB JSON export.

## How to use

#### 1. Generate your export.json file from your DB using [portainer-cli](https://github.com/portainer/portainer-cli)
```
git clone https://github.com/portainer/portainer-cli
cd portainer-cli
make build
./portainer-cli export /path/to/your/portainer.db
```
#### 2. Navigate to https://edge-viewer.xat0mz.dev
#### 3. Upload your `export.json` file then click the `Render` button

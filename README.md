# <img src="https://www.codbex.com/icon.svg" width="32" style="vertical-align: middle;"> codbex-cities

## 📖 Table of Contents
* [🗺️ Entity Data Model (EDM)](#️-entity-data-model-edm)
* [🧩 Core Entities](#-core-entities)
* [📦 Dependencies](#-dependencies)
* [🔗 Sample Data Modules](#-sample-data-modules)
* [🐳 Local Development with Docker](#-local-development-with-docker)

## 🗺️ Entity Data Model (EDM)

![model](images/model.png)

## 🧩 Core Entities

### Entity: `City`

| Field  | Type   | Details              | Description                                     |
| ------ | ------ | -------------------- | ----------------------------------------------- |
| Id     | INTEGER | PK, Identity         | Unique identifier for the city.                 |
| Name   | VARCHAR | Length: 100, Not Null | Name of the city.                               |
| Country | INTEGER | Not Null, FK         | Foreign key referencing the country of the city. |

## 📦 Dependencies

 - [codbex-countries](https://github.com/codbex/codbex-countries)

## 🔗 Sample Data Modules

- [codbex-cities-data](https://github.com/codbex/codbex-cities-data)

## 🐳 Local Development with Docker

When running this project inside the codbex Atlas Docker image, you must provide authentication for installing dependencies from GitHub Packages.
1. Create a GitHub Personal Access Token (PAT) with `read:packages` scope.
2. Pass `NPM_TOKEN` to the Docker container:

    ```
    docker run \
    -e NPM_TOKEN=<your_github_token> \
    --rm -p 80:80 \
    ghcr.io/codbex/codbex-atlas:latest
    ```

⚠️ **Notes**
- The `NPM_TOKEN` must be available at container runtime.
- This is required even for public packages hosted on GitHub Packages.
- Never bake the token into the Docker image or commit it to source control.

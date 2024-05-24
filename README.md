# Chat Users NestJS

## Table of contents

- [Chat Users NestJS](#chat-users-nestjs)
  - [Table of contents](#table-of-contents)
  - [Getting started](#getting-started)
  - [Usage](#usage)
  - [Documentation](#documentation)
  - [Development](#development)
    - [Style guide](#style-guide)
    - [Testing](#testing)
      - [Running tests](#running-tests)
  - [After finishing a task](#after-finishing-a-task)

## Getting started

1. First, clone the repo and install the dependencies,

   ```
   npm install
   ```

   Keep in mind that we use `npm` for managing Node packages. If you try installing the dependencies with `yarn`, it will generate a `yarn-lock` file that will likely cause problems with the existing `package-lock.json`.

2. Start the application with Docker.

   ```
   docker-compose up --build
   ```

3. The API will be available at `http://localhost:3000`.

## Usage

When you launch your Docker container, the project will be launched in watch mode, so any change you make in the code will be reflected in your instance.

## Documentation

To create the documentation for a new endpoint, you need to add the ApiTags with the desired tag name to the controller, and then add the ApiOperation to the method of the request.

```
@ApiTags('welcome')
@ApiOperation({ summary: 'Welcome message!' })
```

## Development

To create a new endpoint, you need to run the following commands to generate the module, controller, and service:

```
nest g module users
nest g controller users
nest g service users
```

### Style guide

Before submitting a patch, please make sure that the code is formatted executing this command:

```
npm run format
```

### Testing

Testing is crucial for us and we strive for high coverage of our code.

We encourage you to write tests for every functionality you build and also update the existing ones if they need to.

#### Running tests

Before running the test, install the needed dependencies:

```
npm install
```

Execute all tests with:

To run the tests we need to run this script

```
npm run test
```

## After finishing a task

Before pushing your changes, make sure you run the linter and prettier to ensure the code follows the rules, or the CI pipeline will throw an error and fail:

```
npm run lint
npm run format
```

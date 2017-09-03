# node-web-push

A simple __Push Notification Server__ written in koa.


## Setup

`foreman` is used to setup the environment variables and start the server. 

To install `foreman` globally:

```bash
# With yarn
$ yarn global add foreman

# With NPM
$ npm i -g foreman
```

To install other dependencies:

```bash
# With yarn
$ yarn install

# With NPM
$ npm i
```

Create a `.env` file which contains the following:

```bash
MAILTO=mailto:youremailaddress@mail.com
```

The `.env` will be automatically loaded when running the server. We skip the `.env` file from being committed to Github by adding it in the `.gitignore` file.

## Run

Start the server with the following comand:
```bash
$ nf start
```

`nf` stands for `node-foreman`. The server should start at port __5000__.

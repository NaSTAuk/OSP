# NaSTA Awards Entry System

This is the system used by the NaSTA awards to allow affiliated stations to upload their entries.

## Requirements (Development)

- Meteor
- Node

## Requirements (Production)

- Node
- Mongodb
- An email account that can send mail (see [The Meteor Docs](https://docs.meteor.com/api/email.html))
- Dropbox account and API key (see [The Dropbox Docs](https://www.dropbox.com/developers/documentation/http/overview))

## Setup (Development)

- Clone repo
- Run `meteor npm install` in cloned directory
- Run `meteor` to start development server
- Navigate to `http://127.0.0.1:3000` to view the running app

## Setup (Production)

- Clone repo
- Run `meteor npm install` in cloned directory
- Run `meteor build ./build`
- Copy the contents of the tar file in the `build` directory to the prodcution server (e.g. to `/home/nasta/osp`)
- Inside `/home/nasta/osp/programs/server` run `npm install`
- Inside `/home/nasta/osp` export the following environment variables:
  - `export MONGO_URL='mongodb://user:password@host:port/databasename'`
  - `export ROOT_URL='http://osp.nasta.tv'`
  - `export MAIL_URL='smtp://user:password@mailhost:port/'`
  - `export METEOR_SETTINGS='{ "dropbox": { "accessToken": "01234567890abcdefghijklmnopqrstuvwxyz" } }'`
- Inside `/home/nasta/osp` run `node main.js`

## Post-deploy setup

See [Docs](docs/setup.md)

# Basic Contact Service

This example illustrates the use of Carbon.io to implement a public API for managing contacts. 

## Installing the service

We encourage you to clone the git repository so you can play around
with the code. 

```
$ git clone -b carbon-0.7 git@github.com:carbon-io-examples/contacts-service-simple.git
$ cd contacts-service-simple
$ npm install
```

## Setting up your environment

This example expects a running MongoDB database. The code will honor a `DB_URI` environment variable. The default URI is
`mongodb://localhost:27017/contacts`.

To set the environment variable to point the app at a database different from the default (on Mac):

```sh
$ export DB_URI=mongodb://localhost:27017/mydb
```

## Running the service

To run the service:

```sh
$ node lib/ContactService
```

For cmdline help:

```sh
$ node lib/ContactService -h
```

## Accessing the service

You can interact with the service via HTTP. Here is an example using curl to add a new contact:

```
$ curl localhost:9900/contacts -H "Content-Type: application/json" -d '{"firstName": "Foo", "lastName": "Bar", "email":"foo@bar.com", "phoneMobile": "415-555-5555", "phoneWork": "415-555-5555"}'
```

## Running the unit tests

This example comes with a simple unit test written in Carbon.io's test framework called TestTube. It is located in the `test` directory. 

```
$ node test/ContactServiceTest
```

or 

```
$ npm test
```

## Generating API documentation (aglio flavor)

To generate documentation using aglio, install it as a devDependency:

```
$ npm install -D --no-optional aglio
```

Using `--no-optional` speeds up aglio's install time significantly. Then generate the docs using this command:

```sh
$ node lib/ContactService gen-static-docs --flavor aglio --out docs/index.html
```

* [View current documentation](
http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io-examples/example__simple-rest-api/tree/carbon-0.7/docs/index.html)

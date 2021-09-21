# fauna-edge-api

The notion that one can just connect any database to the edge simply doesn’t exist. 
Today, many popular databases used in application development have existed long before edge computing. 
Within an application “stack,” databases lie connected to app servers and require persistent 
connection pools, making them incompatible with edge computing architectures.

Oftentimes, we’ll see a configuration where the API simply gets proxied by the edge. 
Performance and scaling improvements are realized by caching objects (where possible) at the edge. 
However, this does not remove the need to operate the server(s) and database. 

![notserverless](/images/notserverless.png)

Imagine a globally distributed database, delivered as SaaS and accessed via API. This is where Fauna comes into the picture. 

![image](/images/serverless.png)

## Sample App
This sample app is a login and registration workflow for a website. The flow is shown below:

![app](/images/app.png)

## Setup

Clone this project. `cd` into the folder and  install dependencies. 
It is needed to run "migrations" in the next step.
```
npm install
```

### 1. Create Fauna Resources:
Create a database and obtain the "Admin Key" for the setup scripts (in the next step) to access the database.
* Signin to Fauna. [Register](https://dashboard.fauna.com/accounts/register) for a free for life developer account
  if you haven't done so already.
* Create a database: 
  * Name your database, e.g. `demo-api`
  * Choose a [Region Group](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups)

* Click [Security] in the left sidebar, then click the [New key] button.
  * In the "New key" form, the current database should already be selected. 
  * For the "Role" field, leave it as "Admin". Optionally, add a key name. 
  * Next, click [Save] and copy the key’s secret displayed on the next page. **It is never displayed again.**

Run "migrations"

* Set the `FAUNA_ADMIN_KEY` environment variable to the key you just generated above:
  ```
  export FAUNA_ADMIN_KEY=<<admin key>>
  ```

* Set the `FAUNADB_DOMAIN` environment variable to one of the following values: `db.fauna.com` or `db.eu.fauna.com` 
  or `db.us.fauna.com` depending on which [Region Group](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups)
  you created your database in.
  ```
  export FAUNADB_DOMAIN=<<db.fauna.com OR db.eu.fauna.com OR db.us.fauna.com>>
  ```

* Look in the [fauna-schema-migrate/resources](/fauna-schema-migrate/resources) folder and peruse the contents. 
  These are all the Collections, Indexes, Functions and Roles that we'll be creating using the
  [fauna-schema-migrate](https://github.com/fauna-labs/fauna-schema-migrate) tool
  (which should already be installed when you ran `npm install` earlier).
  In the [fauna-schema-migrate/migrations](/fauna-schema-migrate/migrations) folder,
  migrations are already pre-generated (from the files in `resources`).
  So simply run the script command below to apply them:

  ```
  npm run fauna-schema-migrate
  ```

### 2. Setup External Authentication with Auth0:
* In your Fauna dashboard, click [Security] in the left sidebar, then click the [Providers] button. 
  You should notice an `Auth0` "AccessProvider" already created by the migration script. Click the "gear" icon to edit it.  
* Replace the string `YOURAUTH0DOMAIN` with your actual "Auth0 domain" and click [Update]
* Copy the `Audience` string for the next step.
* In Auth0, create a new API:
  * Identifier = The `Audience` value copied from the previous step
  * Signing Algorithm = **RS256**
* Create a new Application (or use an existing one) in Auth0 with these settings:
  * Application Type = **Single Page Application**
  * Add Allowed Callback URLs: **http://localhost:8080**
  * Add Allowed Logout URLs: **http://localhost:8080**

### 3. Edge computing setup:

Follow the instructions for the Edge provider of your choice:

| Edge provider | Instructions |
| ------------- | ------------ |
| Fastly        | [README](/edge/Fastly) |


### 4. Setup the spa
In the root of this project, add a file `.env.development.local` with these contents:
```
VUE_APP_AUTH0_DOMAIN=<<Auth0 domain. e.g. mydomain.auth0.com>>
VUE_APP_AUTH0_CLIENT_ID=<<client_id>>
VUE_APP_FAUNA_ACCESS_PROVIDER_AUD=<<Fauna AccessProvider Audience>>
VUE_APP_API_ENDPOINT=<<Deployed API endpoint, e.g. `https://frequently-faithful-mouse.edgecompute.app`>>
```

Compile and hot-reload for development
```
npm run serve
```


This repository contains unofficial patterns, sample code, or tools to help developers build more effectively with [Fauna][fauna]. All [Fauna Labs][fauna-labs] repositories are provided “as-is” and without support. By using this repository or its contents, you agree that this repository may never be officially supported and moved to the [Fauna organization][fauna-organization].

[fauna]: https://www.fauna.com/
[fauna-labs]: https://github.com/fauna-labs
[fauna-organization]: https://github.com/fauna

---

# Introducing "Serverless Database"

Many database options today were created long before edge computing existed and required connections
to app servers, and persistent connection pools
-- making them incompatible with the edge computing architectures of today.

When you have an existing API, you can place it behind the edge in the configuration shown below
Performance and scaling improvements are realized by caching objects (where possible) at the edge. 
However, this does not remove the need to operate the server(s) and database. 

![notserverless](/images/notserverless.png)

In order to realize the full promise of scale, resiliency and performance that edge computing provides,
you need a “globally distributed, serverless database” that the edge functions can access using `fetch`.
This is where Fauna comes into the picture.

![image](/images/serverless.png)

---

## Sample App

To demonstrate the serverless architecture above, this project provides a sample user registration
app that's implemented using Auth0, Fauna and an Edge Computing provider - **completely serverless**. 
The flow is illustrated in the following diagram:

![app](/images/app.png)


This project comprises:
1. A sample Vue application built for the above.
2. The Fauna schema and implementation (via User Defined Functions) for `GET`, `POST` and `PUT` `/users`
3. The Edge Computing provider sample code to implement the `GET`, `POST` and `PUT` `/users` routes.


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

Follow the instructions for one of the available
[edge-gateway-samples](https://github.com/orgs/fauna-labs/repositories?q=edge-gateway-sample)

### 4. Setup the spa
In the root of this project, add a file `.env.local` with these contents:<a name="finishing"></a>
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

Compile and minify for production<a name="buildprod"></a>
```
npm run build
```
> Files will be created in `/dist`
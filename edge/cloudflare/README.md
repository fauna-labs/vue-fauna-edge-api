# Cloudflare Setup

> Note: Generated from template [https://github.com/cloudflare/worker-template-router](https://github.com/cloudflare/worker-template-router)
---

## Setup

1. [Install wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).
   
2. Login to your Cloudflare account
   ```
   wrangler login
   ``` 
   This will open a web page asking you to login to Cloudflare. 
   After you complete the login process, there should be an API Token in your session for wrangler

3. Edit `wrangler.toml` found in this folder (`/edge/cloudflare/wrangler.toml`):
   * Provide a value for your `account_id`.
   * (Optional) Override the value in `name` if you need to.
   * Set the `FAUNADB_DOMAIN` environment variable to one of the following values depending on which
    [Region Group](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups)  
    you created your database in.

      | Region Group       | FAUNADB_DOMAIN |
      | ------------------ | --------------------------- |
      | Classic            | `db.fauna.com`              |
      | United States (US) | `db.us.fauna.com`           |
      | Europe (EU)        | `db.eu.fauna.com`           |


  <!-- `db.fauna.com` or `db.eu.fauna.com` or `db.us.fauna.com` depending on which
  [Region Group](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups) 
  you created your database in. -->

4. Publish to Cloudflare workers
   ```
   wrangler publish
   ```

5. Return to the [instructions](../../README.md#finishing) to finish setting up the Vue app. 

---

## (Optional) Deploy the API to a custom domain
### Prerequisites
Be sure to have already 
[added a Site and Domain](https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website)
in Cloudflare.

### Configure DNS and route
In Clouldflare:
1. Click on your Site settings.
2. Click [DNS]. Then click [Add record]:
   * Type = **A**
   * Name = *Enter a value....e.g. `app`*
   * IPv4 address = **192.0.2.1**
3. Save
> This is a bogus value but is needed to add the record into the DNS. `192.0.2.1` is chosen because it is rarely used. 
  Any value will do. In the next step we'll route the DNS record to the deployed Worker (`192.0.2.1` will be overridden).
4. Click [Workers]. Then click [Add route]
   * Route = The route matching the DNS record defined above plus a wildcard path (`/*`) *e.g.* `app.mydomain.com/*` 
   * Worker = *Select the worker deployed previously*
5. Save
> The router code in the Worker will handle all the routing. So we are routing everything (`/*`) to it.

## (Optional) Use Cloudflare Workers to deploy the Vue SPA to your Domain

### Prerequisites
Be sure to have already:
1. [Compiled and minified](../../README.md#buildprod) the SPA before beginning.
2. [Added a Site and Domain](https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website)
   in Cloudflare.
3. Deployed the API to your custom domain in the previous step.

### Deploy the Vue SPA with Cloudflare Workers
1. `cd` into `/edge/cloudflare/site/`
2. Edit the `wrangler.toml` file in the folder:
   * Provide a value for your `account_id`.
   * Edit `name` if necessary.
3. Publish to Cloudflare workers
   ```
   wrangler publish
   ```
4. Note down the url it was deployed to. The value is derived from the `name` configuration in `wrangler.toml`
   and your Cloudflare Workers subdomain. i.e. `https://<name>.<subdomain>`.
   e.g. `https://vue-fauna-edge-api-spa.your-subdomain.workers.dev`

### Serve the SPA and API from the same Cloudflare Worker
1. Head back to `/edge/cloudflare/wrangler.toml` and edit the value for `SPA_HOST`. 
   * Set the value equal to the hostname of the deployed SPA. e.g. `vue-fauna-edge-api-spa.your-subdomain.workers.dev`
2. Publish the worker one more time:
   ```
   wrangler publish
   ```
> The SPA should  now be at the "`/`" path of your custom domain. And the APIs at `/users`.
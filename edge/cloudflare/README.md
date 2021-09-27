## Wrangler

Generated from template [https://github.com/cloudflare/worker-template-router](https://github.com/cloudflare/worker-template-router)

1. This will open a web page asking you to login to Cloudflare. 
   After you complete the login process, there should be an API Token in your session for wrangler
  ```
  wrangler login
  ```

2. Edit `wrangler.toml`
   * Provide your `account_id`
   * Set the `FAUNADB_DOMAIN` environment variable to one of the following values: 
  `db.fauna.com` or `db.eu.fauna.com` or `db.us.fauna.com` depending on which
  [Region Group](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups) 
  you created your database in.
  

3. Publish to Cloudflare workers
  ```
  wrangler publish
  ```

# Compute@Edge Setup

> Generated using [Fastly starter kit](https://github.com/fastly/compute-starter-kit-javascript-default)

---

Example Compute @ Edge implementation of GET, PUT, POST /users:

![fastly](./images/Fastly.png)

## Setup

### Create a Wasm service:
* [Sign in](https://manage.fastly.com/auth/sign-in) to Fastly. Click [Create service] and choose **Wasm**. 
* Navigate to **Origins > Hosts**. In the empty field), enter the *Hostname or IPv4 addres for the backend...*.
  Use one of these values depending on which Fauna Region Group you chose to create your database:

  | Region Group       | Hostname to enter in Fastly |
  | ------------------ | --------------------------- |
  | Classic            | `db.fauna.com`              |
  | United States (US) | `db.us.fauna.com`           |
  | Europe (EU)        | `db.eu.fauna.com`           |

* Change the default name of the host to **`host_fauna`**.
* Navigate to **Dictionaries** and click [Create your first dictionary]. Give it a name, e.g. `client_serverles_kv`
  * When the screen updates, click [Add item]. Set:
    * Key = **host_fauna**
    * Value = *<<same value as used for Hostname in the previous step. e.g. `db.eu.fauna.com`>>*
* Now, find the **ID** of this service at the top of the screen. Copy it and edit in `fastly.toml` with its value:
  ```
  service_id = "<<service id>>"
  ```

### Generate a Personal API Token
From the top right corner of your Fastly dashboard, click on your username to activate a dropdown menu. 
Choose “Account” to enter the Account Settings page. Use the left navigator panel and select Personal API Tokens. 
Configure these settings:

* Provide a name. e.g. `client-serverless-api`.
* Service Access = **A specific service**. From the dropdown, select the service created earlier
* Scope = **Global API access**
* Expiration = **Never expire**
* Click [Create Token]. On the next screen, copy the generated value and save it somewhere safe for future reference. 
  You won’t be able to access this value again. 

### Deploy
* Set environment variable `FASTLY_API_TOKEN` to Personal API Token from the previous step.
  ```
  export FASTLY_API_TOKEN=<<token>>
  ```

* Install dependencies (make sure you're in the correct folder: `/edge/Fastly`).
  ```
  npm install
  ```

* Build
  ```
  fastly compute build
  ```

* Deploy
  ```
  fastly compute deploy
  ```
  When prompted to provide a domain, click Enter to accept the generated value. Wait a few seconds for the service to deploy. You should see the progress on the terminal.


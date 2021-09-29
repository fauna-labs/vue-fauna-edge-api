// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { Router } from 'itty-router';
import faunadb from 'faunadb';
import {customFetch, getFaunaError, getBearerToken} from './utils.js';

const router = Router();

const faunaClient = new faunadb.Client({
  secret: 'none',
  domain: FAUNADB_DOMAIN,
  fetch: customFetch
});  
const {Call, Function} = faunadb.query;

/*
 * Allows us to serve the SPA at "/".
 * To enable, set the [var] SPA_HOST in the wrangler.toml file to the. The value should be a hostname, e.g. www.mydomain.com 
 * SPAs deployed on the default .workers.dev domain return 404. You must deploy the SPA in a Zone
 */
if (SPA_HOST && SPA_HOST != "none") {
  const proxyToSPA = request => {
    const url = new URL(request.url);
    const forwardedHost = url.hostname;
    url.hostname = SPA_HOST;
    // Build request. Keep track of the original Host.
    const req = new Request(url, request);
    req.headers.append('X-Forwarded-Host', forwardedHost);
    return fetch(req);
  }
  router.get("/", proxyToSPA);
  router.get("/css/*", proxyToSPA);
  router.get("/js/*", proxyToSPA);
  router.get("/img/*", proxyToSPA);
  router.get("/fonts/*", proxyToSPA);
}

router.post("/users", async (req) => {
  try {
    const acessToken = getBearerToken(req)
    const body = await req.json();
    const result = await faunaClient.query(
      Call(Function('CreateUser'), body),
      { secret: acessToken }
    );
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { 
      status: faunaError.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  }  
});

router.get("/users/:id", async (req) => {
  try {
    const {params} = req;
    const userId = decodeURIComponent(params.id);
  
    const acessToken = getBearerToken(req)
    const result = await faunaClient.query(
      Call(Function('GetUser'), [userId]),
      { secret: acessToken }
    );
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",        
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { 
      status: faunaError.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  }
});

router.put("/users/:id", async (req) => {
  try {
    const {params} = req;
    const userId = decodeURIComponent(params.id);
  
    const acessToken = getBearerToken(req)
    const body = await req.json();
    const result = await faunaClient.query(
      Call(Function('UpdateUser'), [userId, body]),
      { secret: acessToken }
    );
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { 
      status: faunaError.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Set CORS headers
      }
    });
  }
});

/*
 * Match anything that hasn't hit any routes defined above. Return 404
 */
router.all("*", () => new Response("404, not found!", { status: 404 }))


/*
 * CORS handler
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,PUT,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ){
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
    // Allow all future content Request headers to go back to browser
    // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  }
  else {
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, PUT, OPTIONS",
      },
    });
  }
}

addEventListener('fetch', (event) => {
  const request = event.request;
  const method = request.method;

  if (method === "OPTIONS") {
    // Handle CORS preflight requests
    event.respondWith(handleOptions(request));
  } else {
    event.respondWith(router.handle(request));
  }
});

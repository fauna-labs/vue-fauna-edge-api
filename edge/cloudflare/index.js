// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { Router } from 'itty-router';
import faunadb from 'faunadb';
import {customFetch, getFaunaError, getBearerToken} from './utils.js';

const faunaClient = new faunadb.Client({
  secret: 'none',
  domain: 'db.eu.fauna.com',
  fetch: customFetch
});  
const {Call, Function} = faunadb.query;

const router = Router()

/*
Our index route, a simple hello world.
*/
router.get("/", () => {
  return new Response("Hello, world!")
})

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
        "Content-Type": "application/json"
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { status: faunaError.status });
  }  
})

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
        "Content-Type": "application/json"
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { status: faunaError.status });
  }
})

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
        "Content-Type": "application/json"
      }
    });
  } catch(e) {
    const faunaError = getFaunaError(e);
    return new Response(faunaError.code, { status: faunaError.status });
  }
})

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

/*
This snippet ties our worker to the router we deifned above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})

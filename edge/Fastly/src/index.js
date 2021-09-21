// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import {
  badRequest, getFaunaError,
  resolveBackend, formatFaunaCallFunction
} from './utils.js';

addEventListener('fetch', event => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  const req = event.request;

  // Allows the edge to respond to CORS
  if (req.method === "OPTIONS" && req.headers.has("Origin") && (
    req.headers.has("access-control-request-headers") ||
    req.headers.has("access-control-request-method"))
  ) {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,POST,PUT,OPTIONS",
        "access-control-allow-headers": req.headers.get('access-control-request-headers') || '',
        "access-control-max-age": 86400,
      }
    });
  }

  const VALID_METHODS = ["GET", "POST", "PUT"];
  if (!VALID_METHODS.includes(req.method)) {
    const response = new Response("This method is not allowed", {
      status: 405
    });
    return response;
  }

  const method = req.method;
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // GET "/", "/js", "/css", "/favicon.ico" returns static contents from Object store bucket
  if (method == "GET" &&
    ["", "js", "css", "favicon.ico"].includes(pathname.split("/")[1])) {

    // Below is an example. Update and point to your own bucket 
    const SPA_HOST = 'example-bucket.s3-website-us-west-2.amazonaws.com';
    const SPA_BACKEND = 's3staticwebsite';

    const s3StaticWebsite = new Request(`http://${SPA_HOST}${pathname}`, {
      method: "GET"
    });

    const s3res = await fetch(s3StaticWebsite, { backend: SPA_BACKEND });

    let headers = new Headers();
    const resource = pathname.split("/")[1];
    if (resource == 'js')
      headers.set('Content-Type', 'application/javascript');
    else if (resource == 'css')
      headers.set('Content-Type', 'text/css; charset=utf-8');
    else if (resource == 'favicon.ico')
      headers.set('Content-Type', 'image/x-icon');
    else
      headers.set('Content-Type', 'text/html; charset=utf-8');

    return new Response(await s3res.text(), {
      status: 200,
      headers
    });
  }

  if (method == "GET" && pathname == "/geo") {
    let clientGeo = {};
    try {
      clientGeo = event.client.geo;
      console.log(`clientGeo: ${JSON.stringify(clientGeo, null, 2)}`);
    } catch (e) {
      console.log(`there was a problem with event.client.geo: ${e}`);
      clientGeo = { error: `${e}` }
    }
    return new Response(
      JSON.stringify({
        geo: clientGeo
      }), {
      headers: { "content-type": "application/json;charset=UTF-8" },
      status: 200
    });
  }

  // POST /users
  if (method == "POST" && pathname == "/users") {
    try {
      const reqBody = await req.json();
      return await callUDF(req, () => {
        return formatFaunaCallFunction('CreateUser', null, reqBody);
      });
    } catch {
      return badRequest();
    }
  }

  if (pathname.match(`\/users\/[^\/]+(\/)?$`)) {

    const userId = decodeURI(pathname.split('/')[2]);

    // GET /users/{id}
    if (method == "GET") {
      return await callUDF(req, () => {
        return formatFaunaCallFunction('GetUser', userId, null);
      });
    }

    // PUT /users/{id}
    if (method == "PUT") {
      try {
        const reqBody = await req.json();
        return await callUDF(req, () => {
          return formatFaunaCallFunction('UpdateUser', userId, reqBody);
        });
      } catch {
        return badRequest();
      }
    }
  }

  return new Response("The page you requested could not be found", {
    status: 404
  });
};

async function callUDF(request, formatHandler) {
  try {
    const { backend, backendUrl, bearerToken } = resolveBackend(request);

    // formatHandler translates REST request into FQL "Call(Function('name'))" equivalent
    const body = formatHandler();

    const headers = new Headers({
      "Authorization": `Bearer ${bearerToken}`,
      "Content-Type": "application/json"
    });

    const faunaRest = new Request(backendUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    const res = await fetch(faunaRest, { backend: backend });

    let response = await res.json();

    // If FQL throws an error, return error
    const faunaErrors = getFaunaError(response);
    if (faunaErrors) {
      return new Response(
        faunaErrors.description, {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },          
        status: faunaErrors.status
      });
    } else {
      return new Response(
        JSON.stringify(response.resource), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    }
  } catch (e) {
    console.log(`${e}`);
    return new Response(`${e}`, { status: 500 });
  }
}


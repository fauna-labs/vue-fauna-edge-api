/* 
 * Fauna embeds its own error “codes” (actually string text) in the response body. 
 * This function parses out the error codes and translate it back to HTTP error codes.
 */
export function getFaunaError(response) {
  try {
    const errors = response.errors[0]
    let { code, description, cause } = errors;
    let status;

    try {
      // report on the inner errors if they exist
      code = cause[0].code;
      description = cause[0].description;
      if (code == 'transaction aborted') {
        // Inside UDFs use 'transaction aborted' status to bubble up the actual error code in the description.
        code = description;
      }
    } catch {
      // no error causes
    }

    switch (code) {
      case 'instance not found':
        status = 404;
        break;
      case 'instance not unique':
        status = 409;
        break;
      case 'permission denied':
        status = 403;
        break;
      case 'unauthorized':
      case 'authentication failed':
        status = 401;
        break;
      default:
        status = 500;
    }
    return { code, description, status };
  } catch {
    // no errors in response
    return false;
  }
}

/*
 * Doesn’t do much for now. We'll come back here later when we
 * utilize Geo-IP at the Edge functionality 
 */
export function resolveBackend(request) {
  try {
    const bearerToken = request.headers.get('Authorization').split('Bearer ')[1];

    var backend, backendUrl;
    backend = 'db_eu_fauna_com';
    backendUrl = 'https://db.eu.fauna.com';

    return { backend, backendUrl, bearerToken };
  } catch (e) {
    console.log(`${e}`);
    throw e;
  }
}

/*
 * Fauna’s UDF needs to distinguish arguments between scalar and object types.
 * Objects must be wrapped with "object".
 * Example: a UDF input argument of type object:
 * {
 *   foo: { 
 *     bar: {
 *        key: 'value'
 *     }
 *   }
 * }
 * ...must be formatted for REST call:
 * object: {
 *   foo: {
 *     object: {
 *       bar: {
 *         object: {
 *           key: 'value'
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function wrapWithObject(obj) {
  let result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      result[key] = {
        object: wrapWithObject(value)
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/* 
 * Translates Call(Function('name')) to REST
 */
export function formatFaunaCallFunction(functionName, id, requestBody) {
  let payload = {
    call: { function: functionName },
    arguments: []
  };
  if (id) {
    payload.arguments.push(id);
  }
  if (requestBody) {
    payload.arguments.push({ object: wrapWithObject(requestBody) });
  }
  return payload;
}


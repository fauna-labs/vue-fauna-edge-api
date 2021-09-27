// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export function customFetch (url, params) {
  const signal = params.signal;
  delete params.signal;

  const abortPromise = new Promise((resolve) => {
    if (signal) {
      signal.onabort = resolve
    }
  });

  return Promise.race([abortPromise, fetch(url, params)])
}

/* 
 * Fauna embeds its own error “codes” (actually string text) in the response body. 
 * This function parses out the error codes and translate it back to HTTP error codes.
 */
export function getFaunaError(response) {
  try {
    const errors = response.requestResult.responseContent.errors[0];
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

export function getBearerToken(req) {
  try {
    return req.headers.get('Authorization').split('Bearer ')[1];
  } catch {
    throw {
      requestResult: {
        responseContent: {
          errors: [
            {
              code: 'unauthorized',
              description: 'No Bearer token'  
            }
          ]
        }
      }
    }
  }
}
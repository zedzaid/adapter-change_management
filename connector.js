const request = require('request');

const validResponseRegex = /(2\d\d)/;


/**
 * The ServiceNowConnector class.
 *
 * @summary ServiceNow Change Request Connector
 * @description This class contains properties and methods to execute the
 *   ServiceNow Change Request product's APIs.
 */
class ServiceNowConnector {

  /**
   * @memberof ServiceNowConnector
   * @constructs
   * @description Copies the options parameter to a public property for use
   *   by class methods.
   *
   * @param {object} options - API instance options.
   * @param {string} options.url - Your ServiceNow Developer instance's URL.
   * @param {string} options.username - Username to your ServiceNow instance.
   * @param {string} options.password - Your ServiceNow user's password.
   * @param {string} options.serviceNowTable - The table target of the ServiceNow table API.
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @callback iapCallback
   * @description A [callback function]{@link
   *   https://developer.mozilla.org/en-US/docs/Glossary/Callback_function}
   *   is a function passed into another function as an argument, which is
   *   then invoked inside the outer function to complete some kind of
   *   routine or action.
   *
   * @param {*} responseData - When no errors are caught, return data as a
   *   single argument to callback function.
   * @param {error} [errorMessage] - If an error is caught, return error
   *   message in optional second argument to callback function.
   */

  /**
   * @memberof ServiceNowConnector
   * @method get
   * @summary Calls ServiceNow GET API
   * @description Call the ServiceNow GET API. Sets the API call's method and query,
   *   then calls this.sendRequest(). In a production environment, this method
   *   should have a parameter for passing limit, sort, and filter options.
   *   We are ignoring that for this course and hardcoding a limit of one.
   *
   * @param {iapCallback} callback - Callback a function.
   * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
   *   Will be HTML text if hibernating instance.
   * @param {error} callback.error - The error property of callback.
   */
  get(callback) {
    let getCallOptions = { ...this.options };
    getCallOptions.method = 'GET';
    getCallOptions.query = 'sysparm_limit=1';
    this.sendRequest(getCallOptions, (results, error) => callback(results,error));
  }

  

  constructUri(serviceNowTable, query = null) {
  let uri = `/api/now/table/${serviceNowTable}`;
  if (query) {
    uri = uri + '?' + query;
  }
  return uri;
}

isHibernating(response) {
  return response.body.includes('Instance Hibernating page')
  && response.body.includes('<html>')
  && response.statusCode === 200;
}

processRequestResults(error, response, body, callback) {
  /**
   * You must build the contents of this function.
   * Study your package and note which parts of the get()
   * and post() functions evaluate and respond to data
   * and/or errors the request() function returns.
   * This function must not check for a hibernating instance;
   * it must call function isHibernating.
   */
   // Initialize return arguments for callback
  let callbackData = null;
  let callbackError = null;

  if (error) {
      console.error('Error present.');
      callbackError = error;
    } else if (!validResponseRegex.test(response.statusCode)) {
      console.error('Bad response code.');
      callbackError = response;
    } else if (this.isHibernating(response)) {
      callbackError = 'Service Now instance is hibernating';
      console.error(callbackError);
    } else {
      callbackData = response;
    }
    return callback(callbackData, callbackError);
}


sendRequest(callOptions, callback) {
  // Initialize return arguments for callback
  let uri;
  if (callOptions.query)
    uri = this.constructUri(callOptions.serviceNowTable, callOptions.query);
  else
    uri = this.constructUri(callOptions.serviceNowTable);
  /**
   * You must build the requestOptions object.
   * This is not a simple copy/paste of the requestOptions object
   * from the previous lab. There should be no
   * hardcoded values.
   */
  const requestOptions = {
    method: callOptions.method,
    auth: {
      user: this.options.username,
      pass: this.options.password,
    },
    baseUrl: this.options.url,
    uri: uri,
  };
  console.log('OPTIONS :::',requestOptions);
  request(requestOptions, (error, response, body) => {
    this.processRequestResults(error, response, body, (processedResults, processedError) => callback(processedResults, processedError));
  });
}


post(callback) {
  let postCallOptions = { ...this.options };
    postCallOptions.method = 'GET';
    this.sendRequest(postCallOptions, (results, error) => callback(results, error));
}

}

module.exports = ServiceNowConnector;
'use strict'

const request = require('request');

/**
 * Mapping knowing error_code
 * @param {*} error_code 
 * @param {*} msg 
 */
function error_def(error_code, msg) {
    let status, message;
    switch(error_code){
        case 400:
        case 401:
        case 402:
        case 403:            
        case 1000:
        case 1001:
        case 1002:
        case 1003:
        case 1005:
            status = error_code;
            message = msg;
            break;
        default:
            status =  2000;
            message = 'Undefined Error'
    }
    return {status: status, msg: message};
}

/**
 * Generate error message
 * @param {String} tag
 * @param {Number} error_code
 * @param {String} msg
 */
function gen_error_func(tag = null) {    
    return function(error_code, msg = null) {
        return {tag: tag, error_message: error_def(error_code, msg)}
    }
}

/**
 * Wrap the request and return interesting keys
 * @param {String} tag 
 * @param {Object} req_opt 
 * @param {Array} interesting_resp
 * @return {Object}
 */

function req_wrap(tag = null, req_opt, interesting_resp = null){
    return new Promise((resolve, reject) => {
        let gen_error = gen_error_func(tag)

        if (!req_opt.url) {
            reject(gen_error(1000, 'missing url'));
        }

        let option = {
            url: req_opt.url,
            method: (req_opt.method)? req_opt.method: 'GET',
        }

        request(option, function(error, response, body) {
            if(error) {
                reject(gen_error(1001, error));
                return;
            }

            if (!response) {
                reject(gen_error(1005, 'response is undefine, maybe wrong url!'))
                return;
            }

            if (response.statusCode >= 400) {
                //http level error
                reject(gen_error(response.statusCode, body));
            }else {
                let result = {};
                let body_json;
                try {
                    body_json = JSON.parse(body);
                }catch(e) {
                    reject(gen_error(1002, `Unknow response: ${body}`))
                }
                if (interesting_resp) {
                    interesting_resp.map(key => {
                        if (body_json[key] == undefined) {
                            reject(gen_error(1003, `In ${body_json}, undefined ${key}`))
                            return;
                        }
                        result[key] = body_json[key];
                    })
                }else {
                    result = body_json;
                }
                resolve(result);
            }
        })
    })
}

let url = 'http://test:8080/api'
req_wrap('first_conn', {url: url}).then(result => {
    console.log(result)
}).catch(error => {
    console.log(error)
})

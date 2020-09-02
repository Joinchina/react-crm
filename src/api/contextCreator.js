import moment from 'moment';

const apiBase = window.API_BASE || 'http://d.crm.wanhuhealth.com/_api';
const credentials = 'include';

export default function contextCreator(dispatch, getState) {
    return {
        get apiBase(){
            return apiBase;
        },

        async requestWithoutBody(method, api, query, opts = {}) {
            // await timeout(10000);
            const url = this.url(api, query);
            const resp = await fetch(url, {
                method,
                credentials,
                ...opts,
            });
            return await this.checkResponse(resp);
        },

        get(url, params, opts) {
            return this.requestWithoutBody('GET', url, params, opts);
        },

        delete(url, params, opts) {
            return this.requestWithoutBody('DELETE', url, params, opts);
        },

        async requestWithFormBody(method, api, data, opts = {}) {
            const form = [];
            if (data) {
                for (const key in data) {
                    const val = data[key];
                    if (val === undefined) {
                        continue;
                    } else if (val === null) {
                        form.push(`${encodeURIComponent(key)}=`);
                    } else if (typeof val === 'string') {
                        form.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
                    } else {
                        form.push(`${encodeURIComponent(key)}=${encodeURIComponent(this.toJSONString(val))}`);
                    }
                }
            }
            const url = this.url(api);
            const headers = opts.headers || {};
            const resp = await fetch(url, {
                method,
                ...opts,
                credentials,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    ...headers
                },
                body: form.join("&"),
            });
            return await this.checkResponse(resp);
        },

        post(url, data, opts) {
            return this.requestWithFormBody('POST', url, data, opts);
        },

        put(url, data, opts) {
            return this.requestWithFormBody('PUT', url, data, opts);
        },

        checkResponse: checkRequestResponse,
        url, queryString, toJSONString
    };
}

export function queryString(object) {
    const arr = [];
    for (const key in object) {
        if (object[key] !== undefined && object[key] !== null) {
            let val;
            if (typeof object[key] === 'object') {
                val = toJSONString(object[key]);
            } else {
                val = `${object[key]}`;
            }
            arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        }
    }
    return arr.join('&');
}

export function url(baseUrl, query) {
    const qs = query && queryString(query);
    let url;
    if (qs) {
        if (baseUrl.indexOf('?') >= 0) {
            url = baseUrl + '&' + qs;
        } else {
            url = baseUrl + '?' + qs;
        }
    } else {
        url = baseUrl;
    }
    if (apiBase[apiBase.length-1] === '/' && url[0] === '/') {
        url = url.substr(1);
    } else if (apiBase[apiBase.length-1] !== '/' && url[0] !== '/') {
        url = `/${url}`;
    }
    return `${apiBase}${url}`;
}

export function toJSONString(obj) {
    const old = Date.prototype.toJSON;
    try {
        const toDateString = date => moment(date).format('yyyy-MM-dd');
        Date.prototype.toJSON = function () {
            return toDateString(this);
        };
        return JSON.stringify(obj, (key, value) => {
            if (key.startsWith('$$')) {
                return undefined;
            }
            return value;
        });
    } finally {
        Date.prototype.toJSON = old;
    }
}

async function checkRequestResponse(resp) {
    if (resp.status === 401) {
        const e = new Error('会话过期，请重新登录系统');
        e.code = 'ELOGOUT';
        e.status = 401;
        throw e;
    }
    if (resp.status < 200 || resp.status > 299) {
        const e = new Error(`网络错误：${resp.status} ${resp.statusText || 'Unknown'}`);
        e.status = resp.status;
        throw e;
    }
    const data = await resp.json();
    return checkResponse(data);
}

export function checkResponse(data){
    if (Number(data.code) !== 0) {
        const e = new Error(data.message || '未知错误');
        e.code = data.code;
        e.data = data.data;
        throw e;
    }
    return data.data;
}

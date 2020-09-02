import React from 'react';
import propTypes from 'prop-types';
import querystring from 'querystring';
import urllib from 'url';
import pathToRegexp from 'path-to-regexp';
import ReactRouterPropTypes from 'react-router-prop-types';

/*
 * 给组件添加以下属性：
 *    router: {
 *        path: string                        当前页面路径
 *        query: object                       当前页面 query 参数
 *        modal: string                       当前显示的弹窗
 *        modalParam: string                  弹窗的参数
 *        go: function(path, query)
 *        back: function()
 *        backTo: function(path, query)       如果后退到的页面是path，则后退，否则
 *        setQuery: function(object, {        更新 query 参数，保留未更新的参数，
 *            replace: bool,                  为 true 时替换现有页面（不能后退到本页）
 *            reset: bool,                    为 true 时重置所有 query 参数，否则未更新的值保留旧值
 *        })
 *        openModal: function(name:string, params: string)    打开一个弹窗
 *        closeModal: function()              关闭当前的弹窗
 *    }
 */

class Router {
    constructor(router) {
        this.router = router;
    }

    get fullPath() {
        return `${this.router.route.location.pathname}${this.router.route.location.search}`;
    }

    get path() {
        return this.router.route.location.pathname;
    }

    get query() {
        if (!this.queryCache) {
            let qs = this.router.route.location.search;
            if (qs && qs[0] === '?') {
                qs = qs.slice(1);
            }
            this.queryCache = querystring.parse(qs);
        }
        return this.queryCache;
    }

    get querystring() {
        return this.router.route.location.search;
    }

    get modal() {
        return this.query.modal;
    }

    get modalParam() {
        return this.query.modalParam;
    }

    set({ query, path }, { replace, reset } = {}) {
        let qs = this.querystring;
        if (query) {
            const n = {};
            const q = this.query;
            const data = query;
            if (!reset) {
                for (const name of Object.keys(q)) {
                    if (data[name] === undefined) {
                        n[name] = q[name];
                    } else {
                        n[name] = data[name];
                    }
                }
                for (const name of Object.keys(data)) {
                    if (!(name in q) && data[name] !== null && data[name] !== undefined) {
                        n[name] = data[name];
                    }
                }
            } else {
                for (const name of Object.keys(data)) {
                    if (data[name] !== null && data[name] !== undefined) {
                        n[name] = data[name];
                    }
                }
            }
            qs = querystring.stringify(n);
            if (qs) {
                qs = `?${qs}`;
            }
        }
        let p = this.path;
        if (path) {
            p = urllib.resolve(this.path, path);
        }
        const url = `${p}${qs}`;
        if (replace) {
            this.router.history.replace(url);
        } else {
            this.router.history.push(url);
        }
    }

    match(pattern, opts) {
        if (pattern instanceof RegExp) {
            return pattern.exec(this.path);
        }
        const keys = [];
        const reg = pathToRegexp(pattern, keys, opts);
        const r = reg.exec(this.path);
        if (r) {
            const result = {};
            for (let i = 0; i < keys.length; i += 1) {
                result[keys[i].name] = r[i + 1];
            }
            return result;
        }
        return r;
    }

    setQuery(data, opts) {
        this.set({
            query: data,
        }, opts);
    }

    setPath(relUrl, opts) {
        this.set({ path: relUrl }, opts);
    }

    openModal(modal, modalParam) {
        this.setQuery({ modal, modalParam });
    }

    closeModal() {
        this.setQuery({ modal: null, modalParam: null });
    }

    replace(...args) {
        this.router.history.replace(...args);
    }

    push(...args) {
        this.router.history.push(...args);
    }
}

export const routerPropType = () => propTypes.shape({
    fullPath: propTypes.string.isRequired,
    path: propTypes.string.isRequired,
    query: propTypes.objectOf(propTypes.string).isRequired,
    querystring: propTypes.string.isRequired,
    modal: propTypes.string.isRequired,
    modalParam: propTypes.string,
    set: propTypes.func.isRequired,
    match: propTypes.func.isRequired,
    setQuery: propTypes.func.isRequired,
    setPath: propTypes.func.isRequired,
    openModal: propTypes.func.isRequired,
    closeModal: propTypes.func.isRequired,
    replace: propTypes.func.isRequired,
    push: propTypes.func.isRequired,
});

export default function connectRouter(Component) {
    function render(props, context) {
        const { router } = context;
        return <Component {...props} router={new Router(router)} />;
    }

    render.contextTypes = {
        router: propTypes.shape({
            route: ReactRouterPropTypes.route.isRequired,
            history: ReactRouterPropTypes.history.isRequired,
        }).isRequired,
    };

    return render;
}

export { connectRouter, connectRouter as connect };

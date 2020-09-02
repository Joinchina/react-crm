import React from 'react';
import { Breadcrumb } from 'antd'
import routes from '../../routes';
import { connectRouter } from '../../mixins/router';
import querystring from 'querystring';
import { Link } from 'react-router-dom';

function NavigatorBreadcrumn(props) {
    const { router, defaultNavigateStack, ...rest } = props;
    let list;
    if (router.query.r || !defaultNavigateStack) {
        let path = router.fullPath;
        list = [];
        while(path) {
            const route = findRouteByPath(path);
            if (route) {
                list.unshift(<Breadcrumb.Item key={route.id}>
                    { list.length ?
                        <Link to={path}>{route.label || route.name}</Link>
                        :
                        (route.label || route.name)
                    }
                    
                </Breadcrumb.Item>);
            }
            if(path.indexOf('?') >= 0) {
                const qs = path.slice(path.indexOf('?') + 1);
                const q = querystring.parse(qs);
                if (q.r) {
                    path = q.r;
                } else {
                    path = null;
                }
            } else {
                path = null;
            }
        }
    } else {
        list = defaultNavigateStack.map((item, i) =>
            <Breadcrumb.Item key={i}>
                {
                    item.url ?
                    <Link to={item.url}>{item.label}</Link>
                    :
                    item.label
                }
            </Breadcrumb.Item>
        );
    }
    return <Breadcrumb {...rest}>{list}</Breadcrumb>
}

export default connectRouter(NavigatorBreadcrumn);

function findRoute(predict) {
    return findRouteRec(routes);

    function findRouteRec(routes) {
        for (const route of routes) {
            if (predict(route)) {
                return route;
            }
            if (route.children) {
                const rec = findRouteRec(route.children);
                if (rec) return rec;
            }
        }
        return undefined;
    }
}

function findRouteByPath(url) {
    let path;
    if (url.indexOf('?') >= 0) {
        path = url.substr(0, url.indexOf('?'));
    } else {
        path = url;
    }
    return findRoute(route => route.pathMatcher && route.pathMatcher.test(path));
}

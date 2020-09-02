import React from 'react';
import { Route, Link } from 'react-router-dom';
import querystring from 'querystring';
import blacklist from 'blacklist';

export default function RouteQuery(props) {
    return <Route render={routerProps => {
        const { location } = routerProps;
        if (location.search && props.query) {
            const q = querystring.parse(location.search.substr(1));
            for (const name in props.query) {
                if (q[name] !== props.query[name]) {
                    return null;
                }
            }
            const Comp = props.component;
            return <Comp {...blacklist(props, 'query', 'component')} {...routerProps}/>
        }
        return null;
    }} />
}

export function getLocation(location, query) {
    let nq;
    if (location.search) {
        nq = querystring.parse(location.search.substr(1));
    } else {
        nq = {};
    }
    for (const name in query) {
        if (query[name] === null || query[name] === undefined) {
            delete nq[name];
        } else {
            nq[name] = query[name];
        }
    }
    const qs = querystring.stringify(nq);
    return qs ? `${location.pathname}?${qs}` : `${location.pathname}`;
}

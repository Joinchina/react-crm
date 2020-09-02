import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import { Menu } from 'antd';
import routes from '../../routes';
import { renderWithPermission } from '../common/HasPermission';
import { closest, hasClass } from '../../helpers/dom';

import './index.scss';

// 上游的 Bug 修复尚未发布到使用中的版本
// https://github.com/ant-design/ant-design/pull/7042
Menu.SubMenu.isSubMenu = Menu.Item.isMenuItem = Menu.ItemGroup.isMenuItemGroup = 1;

class NavMenu extends Component{

    componentWillMount(){
        this.route = this.findMenuRouteByPath(this.props.path);
        this.onRouteChanged(this.route);
    }

    componentWillReceiveProps(props) {
        if (!props.expanded && this.props.expanded) {
            this.setState({ openKeys: [] });
        }
        if (props.expanded && !this.props.expanded) {
            this.setState({ openKeys: this.getAncestorKeys(this.state.current) });
        }
        if (this.props.path !== props.path) {
            const route = this.findMenuRouteByPath(props.path);
            if (route !== this.route) {
                this.route = route;
                this.onRouteChanged(route);
            }
        }
    }

    onRouteChanged(route) {
        if (!route) {
            this.setState({
                current: null,
            });
            if (this.props.expanded) {
                this.setState({
                    openKeys: []
                });
            }
            return;
        } else {
            this.setState({
                current: route.id,
            });
            if (this.props.expanded) {
                this.setState({
                    openKeys: this.getAncestorKeys(route.id),
                });
            }
        }
    }

    onClickMenu = (e) => {
        const route = this.findRouteById(e.keyPath[0]);
        if (route.path) {
            this.props.push(route.path);
            this.setState({ current: route.id });
        }
        //清楚存储得local
        window.localStorage.removeItem('localCode')
    }

    onExpandedOpenChange = (openKeys) => {
        const state = this.state;
        const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
        const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

        let nextOpenKeys = [];
        if (latestOpenKey) {
            nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
        }
        if (latestCloseKey) {
            nextOpenKeys = this.getAncestorKeys(latestCloseKey);
        }
        this.setState({ openKeys: nextOpenKeys });
    }

    onShrinkedOpenChange = (openKeys) => {
        this.setState({ openKeys: openKeys });
        for (const key of openKeys) {
            if (this.submenuElements[key]) {
                this.syncTop(this.submenuElements[key]);
            }
        }
    }

    syncTop(el) {
        const top = el.getBoundingClientRect().top;
        const ul = el.getElementsByTagName('ul')[0];
        if (ul) {
            ul.style.top = `${Math.max(top, 63)}px`;
        }
    }

    getAncestorKeys = (key) => {
        const current = this.findRoutePath(route => route.id === key);
        if (current) {
            return current.slice(1).map(r => r.id);
        } else {
            return [];
        }
    }

    submenuElements = {};

    refSubmenu = (key) => {
        if (!this.refSubmenu.keys) {
            this.refSubmenu.keys = {};
        }
        if (!this.refSubmenu.keys[key]) {
            let el;
            this.refSubmenu.keys[key] = ref => {
                el = closest(hasClass('ant-menu-submenu'))(ref);
                this.syncTop(el);
                this.submenuElements[key] = el;
            }
            this.refSubmenu.keys[key].refChildren = ref => {
                if (el && ref) {
                    this.syncTop(el);
                }
            }
        }
        return this.refSubmenu.keys[key];
    }

    render(){
        return <Menu
            style={this.props.style}
            className={this.props.expanded ? 'flatmenu' : 'iconmenu'}
            mode={this.props.expanded ? 'inline' : 'vertical'}
            openKeys={this.state.openKeys}
            selectedKeys={[this.state.current]}
            onOpenChange={this.props.expanded ? this.onExpandedOpenChange : this.onShrinkedOpenChange}
            onClick={this.onClickMenu}
            >
            { this.renderSubmenus() }
        </Menu>
    }

    renderSubmenus(){
        const renderSubmenusRec = (routes, level, ref) => {
            return routes.map(menu => {
                if (!menu.label) {
                    return null;
                } else if (menu.path) {
                    return renderWithPermission(menu.permission)(
                        <Menu.Item key={menu.id}>
                            { menu.icon ? <span className={`navmenu-icon ${menu.icon}`} /> : null }
                            <span ref={ref}>{this.props.expanded ? menu.label : (menu.labelShort || menu.label)}</span>
                        </Menu.Item>
                    )
                } else {
                    return renderWithPermission(menu.permission)(
                        <Menu.SubMenu key={menu.id}
                            title={<span ref={this.refSubmenu(menu.id)}>
                                    { menu.icon ? <span className={`navmenu-icon ${menu.icon}`} /> : null }
                                    {this.props.expanded ? menu.label : (menu.labelShort || menu.label)}
                                </span>}
                            >
                            {
                                renderSubmenusRec(menu.children, level + 1, this.refSubmenu(menu.id).refChildren)
                            }
                        </Menu.SubMenu>
                    )
                }
            });
        }

        return renderSubmenusRec(routes, 0);
    }

    findRouteById(id) {
        return this.findRoute(route => route.id === id);
    }

    findMenuRouteByPath(path) {
        const routePath = this.findRoutePath(route => route.pathMatcher && route.pathMatcher.test(path));
        if (!routePath) return null;
        let prev;
        for (const r of routePath) {
            if (r.path) {
                prev = r;
            } else {
                break;
            }
        }
        return prev;
    }

    findRoute(predict) {
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

    findRoutePath(predict) {
        return findRoutePathRec(routes);
        function findRoutePathRec(routes) {
            for (const route of routes) {
                if (predict(route)) {
                    return [route];
                }
                if (route.children) {
                    const rec = findRoutePathRec(route.children);
                    if (rec) return [...rec, route];
                }
            }
            return undefined;
        }
    }
}



export default connect(
    state => ({
        path: state.routerReducer.location.pathname,
        expanded: state.navMenu.expanded,
    }),
    dispatch => bindActionCreators({
        push,
    }, dispatch)
)(NavMenu);

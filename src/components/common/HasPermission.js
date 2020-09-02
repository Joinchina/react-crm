import { Component } from 'react';
import propTypes from 'prop-types';
import { matchPermission, testPermission } from '../../helpers/permission';

export { matchPermission, testPermission };

export default function HasPermission(props, context) {
    const { match, children } = props;
    const { permissions } = context;
    if (matchPermission(match, permissions)) {
        return children;
    }
    return null;
}

HasPermission.contextTypes = {
    permissions: propTypes.shape({
        map: propTypes.objectOf(propTypes.bool),
        list: propTypes.arrayOf(propTypes.string),
    }),
};

export function renderWithPermission(match, permission) {
    if (testPermission(match, permission)) {
        return a => a;
    }
    return () => null;
}

export class Permissions extends Component {
    static propTypes = {
        permissions: propTypes.shape({
            map: propTypes.objectOf(propTypes.bool),
            list: propTypes.arrayOf(propTypes.string),
        }).isRequired,
        children: propTypes.element.isRequired,
    }

    static childContextTypes = {
        permissions: propTypes.shape({
            map: propTypes.objectOf(propTypes.bool),
            list: propTypes.arrayOf(propTypes.string),
        }),
    }

    getChildContext() {
        const { permissions } = this.props;
        return { permissions };
    }

    render() {
        const { children } = this.props;
        return children;
    }
}

import { Component } from 'react';
import { alertError } from './AlertError';

export default class AsyncEvent extends Component {

    componentWillReceiveProps(nextProps) {
        const status = this.props.status || (this.props.async && this.props.async.status);
        const nextStatus = nextProps.status || (nextProps.async && nextProps.async.status);
        const nextPayload = nextProps.payload || (nextProps.async && nextProps.async.payload);
        const nextParams = nextProps.params || (nextProps.async && nextProps.async.params);
        if (status !== 'fulfilled' && nextStatus === 'fulfilled') {
            nextProps.onFulfill && nextProps.onFulfill(nextPayload, nextParams);
        }
        if (status !== 'rejected' && nextStatus === 'rejected') {
            if (nextProps.alertError) {
                alertError(nextPayload, nextProps.alertError);
            }
            nextProps.onReject && nextProps.onReject(nextPayload, nextParams);
        }
    }

    render(){
        return null;
    }
}

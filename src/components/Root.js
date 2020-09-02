import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import App from './App';
import './base.css';
import './print.css';

class Root extends Component {
    componentDidMount() {
        function isAnyPendingAction() {
            const { async } = store.getState();
            /* eslint-disable consistent-return */
            Object.values(async).forEach((value) => {
                if (value) {
                    return true;
                }
            });
            return false;
        }

        if (!window.completePageRender) return;

        if (!isAnyPendingAction()) {
            window.completePageRender(store.getState());
        } else {
            store.subscribe(() => {
                if (!isAnyPendingAction()) {
                    window.completePageRender(store.getState());
                }
            });
        }
    }

    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}

export default Root;

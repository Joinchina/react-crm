import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import freeze from 'redux-freeze';
import history from './history';
import reducers from './states/reducers';
import { setGlobalStore } from './helpers/permission';

// import debuggerMiddleware from './debugger/middleware';

// const logger = store => next => (action) => {
//     if (typeof action === 'function') {
//         console.log('dispatching a function');
//     } else {
//         console.log('dispatching', action);
//     }
//     const result = next(action);
//     console.log('next state', store.getState());
//     return result;
// };

let middlewares;
if (process.env.NODE_ENV === 'development') {
    middlewares = [
    //  logger,
        freeze,
        routerMiddleware(history),
        thunkMiddleware,
    ];
    // if (debuggerMiddleware) {
    //     middlewares.push(debuggerMiddleware);
    // }
} else {
    middlewares = [
        routerMiddleware(history),
        thunkMiddleware,
    ];
}

/* eslint-disable-next-line no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducers,
    window.INITIAL_STATE || {},
    composeEnhancers(
        applyMiddleware(...middlewares),
    ),
);

window.store = store;

setGlobalStore(store);

export default store;

import asyncActionCreator from '../helpers/asyncActionCreator';
import randomString from '../helpers/randomString';
import timeout from '../helpers/timeout';
import contextCreator, { checkResponse } from './contextCreator';

/*
 * 与asyncActionCreator的使用方法类似，用在API的异步函数上。
 *
 * 区别：
 *   * apiFunc 被调用时，会给参数表之前加上一个 context 对象，该对象用法请参考 contextCreator 的说明。
 *   * 执行过程中，除了会分发异步函数通用的三个action (status=pending, fulfilled, rejected)之外，
 *     某些特殊情况也会直接发出API相关的其他action。
 *
 */
export default function apiActionCreator(actionName, apiFunc, arg3) {
    if (typeof arg3 === 'function') {
        throw new Error('apiActionCreator\'s 3rd argument is changed from function mapArgumentsToParams to object { mapArgumentsToParams }');
    }
    if (arg3 && arg3.throttle) {
        return throttledApiActionCreator(actionName, apiFunc, arg3);
    }
    const mapArgumentsToParams = arg3 && arg3.mapArgumentsToParams;
    const opts = {};
    if (mapArgumentsToParams){
        opts.mapArgumentsToParams = (ctx, ...args) => mapArgumentsToParams(...args);
    }
    const creator = asyncActionCreator(actionName, apiFunc, opts);
    const result = function(...args) {
        return function(dispatch, getState) {
            const ctx = contextCreator(dispatch, getState);
            dispatch(creator(ctx, ...args));
        }
    }
    result.actionName = actionName;
    return result;
}

export function uploadActionCreator(actionName) {
    return function(s, response, error) {
        let status;
        let payload;
        if (s === 'uploading') {
            status = 'pending';
        } else if (s === 'done') {
            try {
                payload = checkResponse(response);
                status = 'fulfilled';
            } catch (e) {
                payload = {
                    status: e.status,
                    code: e.code,
                    message: e.message,
                };
                status = 'rejected';
            }
        } else if (s === 'error') {
            status = 'rejected';
            payload = {
                status: error.status,
                code: response.code || error.code,
                message: response.message || error.message,
            };
        }
        return {
            type: actionName,
            status: status,
            payload: payload
        };
    }
}

export function throttledApiActionCreator(actionName, apiFunc, arg3) {
    const mapArgumentsToParams = arg3 && arg3.mapArgumentsToParams;
    const time = arg3 && arg3.throttle || 300;
    let cancelPrevious;
    const opts = {};
    if (mapArgumentsToParams){
        opts.mapArgumentsToParams = (ctx, ...args) => mapArgumentsToParams(...args);
    }
    const creator = asyncActionCreator(actionName, (cancel, controlDispatchPending) => {
        // const dispatchPending = controlDispatchPending();
        return async (ctx, ...args) => {
            if (cancelPrevious) cancelPrevious();
            let isCancelled;
            const myCancelPrevious = () => { isCancelled = true; };
            cancelPrevious = myCancelPrevious;
            try {
                await timeout(time);
                if (isCancelled) {
                    cancel();
                    return;
                }
                // dispatchPending();
                const r = await apiFunc(ctx, ...args);
                if (isCancelled) {
                    cancel();
                    return;
                }
                return r;
            } finally {
                if (cancelPrevious === myCancelPrevious) {
                    cancelPrevious = null;
                }
            }
        }
    }, { ...opts, cancellable: true });
    const result = function(...args) {
        return function(dispatch, getState) {
            const ctx = contextCreator(dispatch, getState);
            dispatch(creator(ctx, ...args));
        }
    }
    result.actionName = actionName;
    return result;
}

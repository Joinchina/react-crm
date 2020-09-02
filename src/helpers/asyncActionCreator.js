import randomString from './randomString';
/* 将任意的异步函数转换为异步action
 * 异步Action处理过程中，会发出三个action，async属性为true, type属性为传入的参数，
 * 根据处理状态不同，会有不同的status、payload属性：
 *   * 开始异步函数时，status = 'pending', 无 payload 属性
 *   * 异步函数成功结束时，status = 'fulfilled'，payload 为异步函数的返回值
 *   * 异步函数抛出异常时，status = 'rejected'，payload 为抛出的异常对象中 status、code、message 三个属性
 * 如果需要给 action 对象添加额外的数据，可以使用 getParams 参数。
 * 参数：
 *   type: action.type 属性的值
 *   func: 需要异步处理的函数，该函数必须返回 Promise。
 *   getParams: 传入一个函数时，会调用这个函数，参数和func的传入参数相同，返回的值会附加给action的params属性。
 */
// export const ASYNC_ACTION_CANCELLED = 'ASYNC_ACTION_CANCELLED';

export default function asyncActionCreator(type, func, {
    mapArgumentsToParams, cancellable,
} = {}) {
    function withId(id) {
        return (...args) => (dispatch) => {
            const params = mapArgumentsToParams && mapArgumentsToParams(...args);
            let isCancelled;
            let promise;
            if (cancellable) {
                // console.log('start async action', id);
                const cancel = () => {
                    // console.log('cancel async action', id);
                    isCancelled = true;
                };
                let autoPending = true;
                const dispatchPending = () => {
                    autoPending = false;
                    return opts => dispatch({
                        async: id,
                        type,
                        params,
                        status: 'pending',
                        ...opts,
                    });
                };
                const actualFunc = func(cancel, dispatchPending);
                if (autoPending) {
                    dispatch({
                        async: id,
                        type,
                        params,
                        status: 'pending',
                    });
                }
                promise = actualFunc(...args);
            } else {
                dispatch({
                    async: id,
                    type,
                    params,
                    status: 'pending',
                });
                promise = func(...args);
            }
            promise
                .then((result) => {
                    if (isCancelled) {
                        // console.log('async action is cancelled', id);
                        // dispatch({
                        //     type: ASYNC_ACTION_CANCELLED,
                        //     async: id
                        // });
                        return;
                    }
                    // console.log('async action is fulfilled', id);
                    dispatch({
                        async: id,
                        type,
                        params,
                        status: 'fulfilled',
                        payload: result,
                    });
                }, (err) => {
                    // console.warn(`Async action ${type} failed`, err);
                    if (isCancelled) {
                        // console.log('async action is cancelled with error', id);
                        // dispatch({
                        //     type: ASYNC_ACTION_CANCELLED,
                        //     async: id
                        // });
                        return;
                    }
                    // console.log('async action is rejected', id);
                    dispatch({
                        async: id,
                        type,
                        params,
                        status: 'rejected',
                        payload: {
                            status: err.status,
                            code: err.code,
                            message: err.message,
                            data: err.data,
                        },
                    });
                });
        };
    }
    const result = (...args) => withId(randomString())(...args);
    result.withId = withId;
    return result;
}

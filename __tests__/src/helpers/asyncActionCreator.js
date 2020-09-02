import asyncActionCreator from '../../../src/helpers/asyncActionCreator';

describe('asyncActionCreator', () => {
    it('returns a function', () => {
        const fn = jest.fn();
        expect(typeof asyncActionCreator('TEST_ACTION', fn)).toBe('function');
    });

    it('returns an action creator', () => {
        const asyncFn = jest.fn(() => new Promise((fulfill, reject) => fulfill()));
        const actionCreator = asyncActionCreator('TEST_ACTION', asyncFn);
        const actionFn = actionCreator('arg1', 'arg2');
        const dispatchFn = jest.fn();
        actionFn(dispatchFn, jest.fn());
        expect(asyncFn).toBeCalledWith('arg1', 'arg2');
        expect(dispatchFn).toBeCalled();
        expect(dispatchFn.mock.calls[0][0]).toMatchObject({
            type: 'TEST_ACTION',
            status: 'pending'
        });
    });

    it('dispatch an action after async function is fulfulled', async () => {
        let dispatchPromiseFulfilled;
        let dispatchPromise = new Promise(fulfill => dispatchPromiseFulfilled = fulfill);
        const dispatchFn = jest.fn(action => {
            dispatchPromiseFulfilled(action);
        });
        let actionPromiseFulfilled;
        const actionPromise = new Promise(fulfill => actionPromiseFulfilled = fulfill);
        const actionCreator = asyncActionCreator('TEST_ACTION', () => actionPromise);
        const actionFn = actionCreator();
        actionFn(dispatchFn, jest.fn());
        expect(await dispatchPromise).toMatchObject({
            type: 'TEST_ACTION',
            status: 'pending'
        });
        dispatchPromise = new Promise(fulfill => dispatchPromiseFulfilled = fulfill);
        actionPromiseFulfilled('result');
        expect(await dispatchPromise).toMatchObject({
            type: 'TEST_ACTION',
            status: 'fulfilled',
            payload: 'result'
        });
    });

    it('dispatch an action after async function is rejected', async () => {
        let dispatchPromiseFulfilled;
        let dispatchPromise = new Promise(fulfill => dispatchPromiseFulfilled = fulfill);
        const dispatchFn = jest.fn(action => {
            dispatchPromiseFulfilled(action);
        });
        let actionPromiseRejected;
        const actionPromise = new Promise((_, reject) => actionPromiseRejected = reject);
        const actionCreator = asyncActionCreator('TEST_ACTION', () => actionPromise);
        const actionFn = actionCreator();
        actionFn(dispatchFn, jest.fn());
        expect(await dispatchPromise).toMatchObject({
            type: 'TEST_ACTION',
            status: 'pending'
        });
        dispatchPromise = new Promise(fulfill => dispatchPromiseFulfilled = fulfill);
        actionPromiseRejected(new Error('Test Error'));
        expect(await dispatchPromise).toMatchObject({
            type: 'TEST_ACTION',
            status: 'rejected',
            payload: {
                message: 'Test Error'
            }
        });
    });
});

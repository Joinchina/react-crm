import timeout from '../../../src/helpers/timeout';

describe('timeout', () => {
    it('returns a promise fulfilled at given time', done => {
        const finishFn = jest.fn();
        timeout(100).then(finishFn);
        setTimeout(function(){
            try {
                expect(finishFn).not.toBeCalled();
            } catch (e) {
                done.fail(e);
            }
        }, 99);
        setTimeout(function(){
            try {
                expect(finishFn).toBeCalled();
                done();
            } catch (e) {
                done.fail(e);
            }
        }, 101);
    });
});

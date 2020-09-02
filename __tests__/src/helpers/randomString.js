import randomString from '../../../src/helpers/randomString';

describe('randomString', () => {
    it('returns different string for each call', () => {
        const a = randomString();
        const b = randomString();
        const c = randomString();
        expect(typeof a).toBe('string');
        expect(typeof b).toBe('string');
        expect(typeof c).toBe('string');
        expect(a).not.toBe(b);
        expect(a).not.toBe(c);
        expect(b).not.toBe(c);
    });
});

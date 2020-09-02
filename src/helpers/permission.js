let store;

export function setGlobalStore(s) {
    console.log('register global store for permission');
    store = s;
}

export function matchPermission(matcher, auth) {
    if (!matcher) return true;
    if (typeof matcher === 'string') {
        return auth.map[matcher];
    }
    if (matcher.$all && matcher.$all.some(submatcher => !matchPermission(submatcher, auth))) {
        return false;
    }
    if (matcher.$any && matcher.$any.every(submatcher => !matchPermission(submatcher, auth))) {
        return false;
    }
    if (matcher.test && auth.list.every(p => !matcher.test(p))) {
        return false;
    }
    return true;
}

export function testPermission(match, permissions) {
    let p = permissions;
    if (!p && store) {
        const state = store.getState();
        if (state.auth.status !== 'fulfilled') {
            throw new Error('Cannot use testPermission before user info is initialized. You should call this function in any component\'s lifecycle');
        }
        p = state.auth.payload.permissions;
    }
    if (!p) return false;
    if (matchPermission(match, p)) {
        return true;
    }
    return false;
}

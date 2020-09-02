import { alertError } from '../components/common/AlertError';

export default function(){

    return (target, name, desc) => {
        if (typeof desc.value !== 'function') {
            throw new Error(`alertError should used to decorate member functions, check prop ${name}`);
        }
        const oldFunc = desc.value;
        const obj = {
            [name]: function(...args){
                try {
                    const r = oldFunc.apply(this, args);
                    if (typeof r.then === 'function') {
                        return r.then(null, e => {
                            alertError(e);
                            throw e;
                        });
                    }
                    return r;
                } catch (e) {
                    alertError(e);
                    throw e;
                }
            }
        }
        return {
            ...desc,
            value: obj[name]
        };
    }
}

export default class ValidatorBuilder {

    static EmptyValidator = () => null;

    constructor(validators) {
        this.validators = validators ? [...validators] : [];
    }

    clone(){
        return new ValidatorBuilder(this.validators);
    }

    addValidator(func) {
        this.validators = [...this.validators, func];
        return this;
    }

    addPriorityValidator(func) {
        this.validators = [func, ...this.validators];
        return this;
    }

    validator(func) {
        return this.addValidator(func);
    }

    buildValidator() {
        const validators = this.validators;
        if (!validators.length) {
            return ValidatorBuilder.EmptyValidator;
        }
        return (...args) => {
            const asyncValidators = [];
            for (const validator of validators) {
                const r = validator(...args);
                if (typeof r === 'string') {
                    return r;
                } else if (typeof r === 'function') {
                    asyncValidators.push(r);
                } else if (r) {
                    return '验证失败：未知错误';
                }
            }
            if (asyncValidators.length) {
                return new Promise((fulfill, reject) => {
                    let isResolved;
                    let asyncResolved = asyncValidators.map(f => false);
                    asyncValidators.forEach((func, i) => {
                        Promise.resolve(func())
                        .then(res => {
                            asyncResolved[i] = true;
                            if (isResolved) return;
                            if (res) {
                                isResolved = true;
                                fulfill(res);
                            } else if (asyncResolved.every(a => a)) {
                                fulfill(null);
                            }
                        }, err => {
                            asyncResolved[i] = true;
                            if (isResolved) return;
                            isResolved = true;
                            reject(err);
                        });
                    });
                });
            }
            return null;
        }
    }

    build(){
        return {
            validator: this.buildValidator
        };
    }
}

import React from 'react';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import DatePicker from 'antd/lib/date-picker';
import ValidatorBuilder from './validatorBuilder';
import moment from 'moment';

export const EditorSupports = {
    maxLength: Symbol('SupportsMaxLength')
};

let cloning;

class FieldBuilder extends ValidatorBuilder {

    constructor(validators, decorators, rule, onChanges, initialValue, validateTrigger) {
        super(validators);
        if (!cloning) {
            this.decorators = decorators ? [...decorators] : [];
            this.rule = rule ? { ...rule } : {};
            this.onChanges = onChanges ? [...onChanges] : [];
            this._initialValue = initialValue;
            this._validateTrigger = validateTrigger;
        } else {
            this.decorators = decorators;
            this.rule = rule;
            this.onChanges = onChanges;
            this._initialValue = initialValue;
            this._validateTrigger = validateTrigger;
        }
    }

    clone(){
        cloning = true;
        const r = new FieldBuilder(this.validators, this.decorators, this.rule, this.onChanges, this._initialValue, this._validateTrigger);
        cloning = false;
        return r;
    }

    addDecorator(func) {
        this.decorators = [...this.decorators, func];
        return this;
    }

    decorator(func) {
        return this.addDecorator(func);
    }

    buildDecorator() {
        const decorators = this.decorators;
        return (target, ...moreDecorators) => {
            let props = target.props;
            for (const dec of decorators) {
                props = dec(target.type, props) || props;
            }
            for (const dec of moreDecorators) {
                props = dec(target.type, props) || props;
            }
            if (props !== target.props) {
                const children = props.children || [];
                return React.cloneElement(target, props, ...children);
            }
            return target;
        }
    }

    addRule(rule) {
        this.rule = { ...this.rule, ...rule };
        return this;
    }

    buildRule() {
        const validate = this.buildValidator();
        let rule;
        if (validate === ValidatorBuilder.EmptyValidator && fieldIsEmpty(this.rule)) {
            rule = null;
        } else {
            rule = { ...this.rule }
        }
        return form => {
            if (!rule) return rule;
            const boundRule = { ...rule };
            if (validate !== ValidatorBuilder.EmptyValidator) {
                boundRule.validator = function validator(rule, value, callback) {
                    try {
                        let r = validate(value, form);
                        if (r) {
                            if (typeof r.then === 'function') {
                                r.then(res => {
                                    callback(res || undefined);
                                }, err => {
                                    callback(err.message || '验证失败：未知错误')
                                })
                            } else {
                                callback(r);
                            }
                        } else if (r === '') {
                            callback('验证失败：未知错误');
                        } else {
                            callback();
                        }
                    } catch (e) {
                        callback(e.message || '验证失败：未知错误');
                    }
                };
            }
            return boundRule;
        }
    }

    onChange(func) {
        this.onChanges = [...this.onChanges, func];
        return this;
    }

    buildOnChange() {
        if (this.onChanges.length === 0) {
            return null;
        }
        const onChanges = this.onChanges;
        return (...args) => {
            onChanges.forEach(func => func(...args));
        }
    }

    initialValue(value) {
        this._initialValue = value;
        return this;
    }

    validateTrigger(trigger) {
        this._validateTrigger = trigger;
        return this;
    }

    validatorTrigger(trigger) {
        return this.validateTrigger(trigger);
    }

    build() {
        return {
            ...super.build(),
            decorator: this.buildDecorator(),
            rule: this.buildRule(),
            onChange: this.buildOnChange(),
            initialValue: this._initialValue,
            validateTrigger: this._validateTrigger
        };
    }

    required(message) {
        if (!message) {
            message = '必填项';
        }
        return this
        .addValidator(val => {
            return fieldIsEmpty(val) ? message : null;
        })
        .addRule({ required: true });
    }

    maxLength(length, message) {
        if (!message) {
            message = `最大长度为${length}`;
        }
        if (length <= 0) {
            throw new Error('maxlength must greater than zero');
        }
        return this
        .addValidator(val => {
            if (val === null || val === undefined) {
                return null;
            }
            const str = `${val}`;
            if (str.length > length) {
                return message;
            }
            return null;
        })
        // .addRule({ type: 'string', max: length, message: message })
        .addDecorator((component, props) => {
            if (component[EditorSupports.maxLength] || component === 'input' || component === 'textarea' || component === Input || component === InputNumber) {
                const maxLength = props.maxLength ? Math.min(props.maxLength, length) : length;
                return  {
                    ...props,
                    maxLength
                };

            }
        });
    }

    maxDate(maxDate, message) {
        if (!moment.isMoment(maxDate) || !maxDate.isValid()) {
            throw new Error('maxDate should called with a valid moment date');
        }
        maxDate.hour(23).minute(59).second(59).millisecond(999);
        if (!message) {
            message = `只能选择${maxDate.format('YYYY-MM-DD')}之前的日期`;
        }
        return this.addValidator(function validateMaxDate(val){
            if (Array.isArray(val)) {
                for (const v of val) {
                    const r = validateMaxDate(v);
                    if (r) return r;
                }
                return null;
            }
            if (maxDate.isBefore(val)) {
                return message;
            }
            return null;
        })
        .addDecorator((component, props) => {
            if (component === DatePicker || component === DatePicker.RangePicker || component === DatePicker.MonthPicker) {
                return {
                    ...props,
                    disabledDate: (date) => {
                        if (maxDate.isBefore(date)) {
                            return true;
                        }
                        return props.disabledDate ? props.disabledDate(date) : false;
                    }
                }
            }
        });
    }

    integer(message) {
        if (!message) message = `必须输入一个整数`;
        return this
        .addValidator(val => {
            const num = Number(val);
            if (!isFinite(num)) {
                return message;
            }
            if (Math.floor(num) !== num) {
                return message;
            }
            return null;
        })
    }

    min(min, message) {
        if (!message) {
            message = `必须输入大于等于${min}的数字`;
        }
        return this
        .addValidator(val => {
            const num = Number(val);
            if (!isFinite(num)) {
                return message;
            }
            if (num < min) {
                return message;
            }
            return null;
        })
        .addDecorator((component, props) => {
            if ((component === 'input' && props.type === 'number') || component === InputNumber) {
                let newMin;
                if (props.min !== undefined) {
                    newMin = Math.max(props.min, min);
                } else {
                    newMin = min;
                }
                return {
                    ...props,
                    min: newMin
                };
            }
        });
    }

    max(max, message) {
        if (!message) {
            message = `必须输入小于等于${max}的数字`;
        }
        return this
        .addValidator(val => {
            const num = Number(val);
            if (!isFinite(num)) {
                return message;
            }
            if (num > max) {
                return message;
            }
            return null;
        })
        .addDecorator((component, props) => {
            if ((component === 'input' && props.type === 'number') || component === InputNumber) {
                let newMax;
                if (props.max !== undefined) {
                    newMax = Math.min(props.max, max);
                } else {
                    newMax = max;
                }
                return {
                    ...props,
                    max: newMax
                };
            }
        })
    }

    minMax(min, max, message) {
        if (!message) {
            message = `必须输入在${min}至${max}之间的数字`
        }
        return this.min(min, message).max(max, message);
    }

    validateNestedForm(message) {
        let nestedFormValidate;
        return this
            .addValidator(value => {
                if (nestedFormValidate) {
                    return () => new Promise((fulfill, reject) => {
                        nestedFormValidate(err => {
                            if (typeof message === 'function') {
                                fulfill(message(err));
                            } else if (typeof message === 'string') {
                                fulfill(message);
                            } else {
                                console.log(err);
                                fulfill('nested error');
                            }
                        })
                    });
                }
                return null;
            })
            .addDecorator((type, props) => {
                return {
                    ...props,
                    validatorRef(validator) {
                        nestedFormValidate = validator;
                        if (props.validatorRef) {
                            props.validatorRef(validator);
                        }
                    }
                }
            });
    }

    pattern(regex, message) {
        if (!message) message = '';
        return this.validator(value => {
            if (!regex.test(value || '')) {
                return message;
            }
            return null;
        });
    }
}

export default () => new FieldBuilder();

export function fieldIsEmpty(val) {
    if (val === null || val === undefined) {
        return true;
    }
    if (Array.isArray(val)) {
        return val.length === 0;
    }
    if (typeof val === 'string') {
        return val.trim() === "";
    }
    if (typeof val === 'object') {
        for (const k in val) {
            return false;
        }
        return true;
    }
    return false;
}

export function runValidator(validator, callback) {
    if (!callback) callback = a => a;
    return (...args) => {
        try {
            const r = validator(...args);
            function resolve(resolveAsyncToThunk, r){
                if (typeof r === 'string') {
                    return callback(r || '验证失败：未知错误');
                } else if (typeof r === 'function') {
                    const promise = new Promise((fulfill, reject) => {
                        r().then(resolve.bind(null, false), e => {
                            callback(e.message || '验证失败：未知错误');
                        });
                    });
                    return resolveAsyncToThunk ? () => promise : promise;
                } else if (r) {
                    return callback('验证失败：未知错误');
                } else {
                    return callback(null);
                }
            }
            return resolve(true, r);
        } catch (e) {
            return callback(e.message || '验证失败：未知错误');
        }
    }
}

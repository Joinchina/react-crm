import ValidatorBuilder from './validatorBuilder';
import { fieldIsEmpty, runValidator } from './fieldBuilder';

class FormBuilder extends ValidatorBuilder {

    static EmptyFieldDecorator = a => a;

    constructor(validators, fieldDecorators) {
        super(validators);
        this.fieldDecorators = fieldDecorators ? [...fieldDecorators] : [];
    }

    fieldDecorator(func) {
        this.fieldDecorators = [...this.fieldDecorators, func];
        return this;
    }

    buildFieldDecorator(){
        if (!this.fieldDecorators.length) {
            return FormBuilder.EmptyFieldDecorator;
        }
        const fieldDecorators = this.fieldDecorators;
        return fields => {
            const newFields = {};
            let anyChange;
            for (const name in fields) {
                const ofield = fields[name];
                let field = ofield;
                fieldDecorators.forEach(dec => field = dec(name, field) || field);
                newFields[name] = field;
                if (ofield !== field) {
                    anyChange = true;
                }
            }
            return anyChange ? newFields : fields;
        }
    }

    build(){
        return {
            ...super.build(),
            fieldDecorator: this.buildFieldDecorator()
        };
    }

    requiredAny(fields, message){
        if (!fields || fields.length < 2) {
            throw new Error('requiredAny need at least 2 fields');
        }
        return this.fieldDecorator((name, field) => {
            if (fields.indexOf(name) >= 0) {
                const otherFields = fields.filter(f => f !== name);
                return field.clone()
                    .addPriorityValidator((val, form) => {
                        const otherValues = otherFields.map(f => form.getFieldValue(f));
                        if (otherValues.every(v => fieldIsEmpty(v))) {
                            const setFieldsOpt = {};
                            otherFields.forEach((f, i) => setFieldsOpt[f] = {
                                value: otherValues[i],
                                errors: fieldIsEmpty(val) ? [message] : null
                            });
                            form.setFields(setFieldsOpt);
                            return fieldIsEmpty(val) ? message : null;
                        }
                        return null;
                    });
            }
        })
    }

    nestedForm(fieldName) {
        let validatorRef;
        return this.fieldDecorator((name, field) => {
            if (name === '__form') {
                return field.clone()
                    .validator((val, form) => {
                        return () => new Promise((fulfill, reject) => {
                            if (validatorRef) {
                                validatorRef((err, values) => {
                                    if (err) {
                                        fulfill('nested form has errors');
                                    } else {
                                        fulfill();
                                    }
                                });
                            } else {
                                fulfill();
                            }
                        });
                    })
            } else if (name === fieldName) {
                return field.clone()
                    .decorator((type, props) => {
                        return {
                            ...props,
                            validatorRef: ref => {
                                validatorRef = ref;
                                if (props.validatorRef) {
                                    props.validatorRef(ref);
                                }
                            }
                        };
                    });
            }
        })
    }

    fieldValidator(fieldName, validator) {
        return this.fieldDecorator((name, field) => {
            if (name === fieldName) {
                return field.clone()
                    .validator((val, form) => {
                        if (form.validatingAllFields){
                            return runValidator(validator)(val, form);
                        }
                        return null;
                    });
            }
        })
    }
}

export default () => new FormBuilder();

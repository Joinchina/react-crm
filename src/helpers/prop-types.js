import propTypes from 'prop-types';

const newTypes = {
    ...propTypes,
    asyncResult(t, paramsT) {
        if (paramsT) {
            return propTypes.shape({
                status: propTypes.oneOf(['pending', 'fulfilled', 'rejected']),
                payload: t,
                params: paramsT,
            });
        }
        return propTypes.shape({
            status: propTypes.oneOf(['pending', 'fulfilled', 'rejected']),
            payload: t,
        });
    },
    form() {
        return propTypes.shape({
            getFieldsValue: propTypes.func.isRequired,
        });
    },
};

export default newTypes;

import { apiActionCreator, getDoctorsByHospitalId } from '../../api';

const ACTION_NAME = 'components.getDoctorsByHospitalId';

export default function(state = {}, action) {
    if (action.type === ACTION_NAME) {
        const key = action.params;
        state = { ...state,
            [key]: {
                status: action.status,
                payload: action.payload,
            }
        };
    }
    return state;
}

export const getDoctor = apiActionCreator(ACTION_NAME,
    async (ctx, key, hospitalId) => {
        const result = await getDoctorsByHospitalId(ctx, hospitalId);
        return result.list
    },
    { mapArgumentsToParams: key => key }
);

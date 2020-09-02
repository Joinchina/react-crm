import { apiActionCreator, getSystemUser as getSystemUserApi, getUserGroupById } from '../../api';

const GET_SYSTEM_USER = 'components.selectSystemUser';

export default function(state = {}, action) {
    if (action.type === GET_SYSTEM_USER) {
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

export const getSystemUser = apiActionCreator(GET_SYSTEM_USER,
    (ctx, key, companyId, status) => getSystemUserApi(ctx, {
        companyId,
        status: 0,
    }),
    { mapArgumentsToParams: key => key }
);

export const getUserInGroup = apiActionCreator(GET_SYSTEM_USER,
    async (ctx, key, groupId) => {
        const r = await getUserGroupById(ctx, groupId);
        return r.users;
    },
    { mapArgumentsToParams: key => key }
)

import { apiActionCreator, getSystemUserGroup as getSystemUserGroupApi } from '../../api';

const GET_SYSTEM_USERGROUP = 'components.selectSystemUserGroup';

export default function(state = {}, action) {
    if (action.type === GET_SYSTEM_USERGROUP && state.status !== 'fulfilled') {
        state = { ...state,
            [action.params]: {
                status: action.status,
                payload: action.payload,
            }
        };
    }
    return state;
}

export const getSystemUserGroup = apiActionCreator(GET_SYSTEM_USERGROUP, async (ctx, key, userId) => {
    const r = await getSystemUserGroupApi(ctx, {
        status: 1,
        userId,
    });
    return r.list;
}, {
    mapArgumentsToParams: key => key
});

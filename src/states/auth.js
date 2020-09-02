import { apiActionCreator, getUserInfo as getUserInfoApi } from '../api';
import { reduceAsyncAction } from '../helpers/reducers';

const GET_USER_INFO = 'auth.GET_USER_INFO';

export default reduceAsyncAction(GET_USER_INFO);

const parentPermissions = {
    'patient.admin': ['patient.view', 'patient.edit'],
    'patient.edit': ['patient.view'],
    'order.admin': ['order.view', 'order.edit'],
    'order.edit': ['order.view'],
    'crm.task.admin': ['crm.task.view', 'crm.task.edit'],
    'crm.task.edit': ['crm.task.view'],
    'crm.task_pool.admin': ['crm.task_pool.view', 'crm.task_pool.edit'],
    'crm.task_pool.edit': ['crm.task_pool.view'],
    'billing.h_account.admin': ['billing.h_account.view', 'billing.h_account.edit'],
    'billing.h_account.edit': ['billing.h_account.view'],
}

export const getUserInfo = apiActionCreator(GET_USER_INFO, async (ctx, ...args) => {
    const r = await getUserInfoApi(ctx, ...args);
    window.localStorage.setItem("userInfo",JSON.stringify(r))
    const list = r.authorities.split(',');
    for (let i = 0; i < list.length; i ++) {
        const a = list[i];
        if (parentPermissions[a]) {
            parentPermissions[a].forEach(s => {
                if (list.indexOf(s) < 0) {
                    list.push(s);
                }
            });
        }
    }
    const permissions = { map: {}, list: list };
    list.forEach(p => permissions.map[p] = true);
    return {
        ...r,
        permissions
    };
});

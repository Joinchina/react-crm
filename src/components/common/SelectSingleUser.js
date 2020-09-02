import { getSystemUser, getUserInGroup } from '../../states/components/selectSystemUser';
import { connectSelectSingle } from './BaseSelectSingle'

const cache = {};
export function forCompanyId(companyId) {
    let key;
    if (companyId === null || companyId === undefined) {
        key = "c:null";
    } else {
        key = `c:${companyId}`;
    }
    if (!cache[key]) {
        const mapItemToLabel = companyId ? item => item.name : item => `${item.name}（${item.company}）`;
        cache[key] = connectSelectSingle({
            mapStateToAsyncStatus: state => state.components.selectSystemUser[key] || {},
            mapItemToLabel,
            mapItemToId: item => item.id,
            getOptionsActionCreator: () => getSystemUser(key, companyId),
            reloadOnMount: true,
        });
    }
    return cache[key];
}

export function inUserGroup(groupId) {
    let key;
    if (groupId === null || groupId === undefined) {
        throw new Error('user group id cannot be null');
    } else {
        key = `g:${groupId}`;
    }
    if (!cache[key]) {
        cache[key] = connectSelectSingle({
            mapStateToAsyncStatus: state => state.components.selectSystemUser[key] || {},
            mapItemToLabel: item => item.name,
            mapItemToId: item => item.id,
            getOptionsActionCreator: () => getUserInGroup(key, groupId),
            reloadOnMount: true,
        });
    }
    return cache[key];
}

export const SelectSystemUser = forCompanyId();
export default SelectSystemUser;
SelectSystemUser.forCompanyId = forCompanyId;
SelectSystemUser.inUserGroup = inUserGroup;

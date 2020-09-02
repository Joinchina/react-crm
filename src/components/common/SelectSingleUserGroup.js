import { getSystemUserGroup } from '../../states/components/selectSystemUserGroup';
import { connectSelectSingle } from './BaseSelectSingle'

const cache = {};
export function forUserId(userId) {
    let key;
    if (userId === null || userId === undefined) {
        key = "null";
    } else {
        key = `${userId}`;
    }
    if (!cache[key]) {
        cache[key] = connectSelectSingle({
            mapStateToAsyncStatus: state => state.components.selectSystemUserGroup[key] || {},
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            getOptionsActionCreator: () => getSystemUserGroup(key, userId),
            reloadOnMount: true,
        });
    }
    return cache[key];
}

export const SelectSingleUserGroup = forUserId();
export default SelectSingleUserGroup;
SelectSingleUserGroup.forUserId = forUserId;

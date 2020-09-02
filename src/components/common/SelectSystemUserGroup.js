import { getSystemUserGroup } from '../../states/components/selectSystemUserGroup';
import { connectSelectMultiple } from './BaseSelectMultiple'

const cache = {};
export function forUserId(userId) {
    let key;
    if (userId === null || userId === undefined) {
        key = "null";
    } else {
        key = `${userId}`;
    }
    if (!cache[key]) {
        cache[key] = connectSelectMultiple({
            mapStateToAsyncStatus: state => state.components.selectSystemUserGroup[key] || {},
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            reloadOnMount: true,
            getOptionsActionCreator: () => getSystemUserGroup(key, userId)
        });
    }
    return cache[key];
}

export const SelectSystemUserGroup = forUserId();
export default SelectSystemUserGroup;
SelectSystemUserGroup.forUserId = forUserId;

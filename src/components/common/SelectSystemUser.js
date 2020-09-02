import { getSystemUser } from '../../states/components/selectSystemUser';
import { connectSelectMultiple } from './BaseSelectMultiple'

const cache = {};
export function forCompanyId(companyId) {
    let key;
    if (companyId === null || companyId === undefined) {
        key = "_null";
    } else {
        key = `${companyId}`;
    }
    if (!cache[key]) {
        const mapItemToLabel = companyId ? item => item.name : item => `${item.name}（${item.company}）`;
        cache[key] = connectSelectMultiple({
            mapStateToAsyncStatus: state => state.components.selectSystemUser[key] || {},
            mapItemToLabel,
            reloadOnMount: true,
            mapItemToId: item => item.id,
            getOptionsActionCreator: () => getSystemUser(key, companyId)
        });
    }
    return cache[key];
}

export const SelectSystemUser = forCompanyId();
export default SelectSystemUser;
SelectSystemUser.forCompanyId = forCompanyId;

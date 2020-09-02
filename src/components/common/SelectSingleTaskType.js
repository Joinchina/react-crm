import { getTaskType } from '../../states/components/selectTaskType';
import { connectSelectSingle } from './BaseSelectSingle'

const SelectSingleTaskType = connectSelectSingle({
    mapStateToAsyncStatus: state => ({
        status: state.components.selectTaskType.default.status,
        payload: state.components.selectTaskType.default.payload
    }),
    mapItemToLabel: item => item.name,
    mapItemToId: item => `${item.id}`,
    getOptionsActionCreator: () => getTaskType()
});

export default SelectSingleTaskType;
export { SelectSingleTaskType };

const cache = {};
function forGroupType(groupType) {
    if (!groupType) {
        return SelectSingleTaskType;
    }
    if (!cache[groupType]) {
        cache[groupType] = connectSelectSingle({
            mapStateToAsyncStatus: state => ({
                status: state.components.selectTaskType[groupType] && state.components.selectTaskType[groupType].status,
                payload: state.components.selectTaskType[groupType] && state.components.selectTaskType[groupType].payload
            }),
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            getOptionsActionCreator: () => getTaskType(groupType)
        });
    }
    return cache[groupType];
}

SelectSingleTaskType.forGroupType = forGroupType;
export { forGroupType };

const subTypesSelectCache = {}
const subTypesSelectForEmpty = connectSelectSingle({
    mapStateToAsyncStatus: store => ({
        status: 'fulfilled',
        payload: []
    }),
    mapItemToLabel: item => item.name,
    mapItemToId: item => `${item.id}`,
    getOptionsActionCreator: () => {}
});

function subTypesForPrimaryType(typeid) {
    if (!typeid) {
        return subTypesSelectForEmpty;
    }
    if (!subTypesSelectCache[typeid]) {
        subTypesSelectCache[typeid] = connectSelectSingle({
            mapStateToAsyncStatus: store => {
                const state = store.components.selectTaskType.default || {};
                let payload;
                if (state.payload) {
                    const primary = state.payload.find(item => item.id == typeid);
                    payload = primary && primary.secondaryType || []
                }
                return {
                    status: state.status,
                    payload
                }
            },
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            getOptionsActionCreator: () => getTaskType()
        })
    }
    return subTypesSelectCache[typeid];
}

SelectSingleTaskType.subTypesForPrimaryType = subTypesForPrimaryType;
export { subTypesForPrimaryType }

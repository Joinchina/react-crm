import { getTaskType } from '../../states/components/selectTaskType';
import { connectSelectMultiple } from './BaseSelectMultiple'

const taskGroupType = "1";

const SelectSystemFrozenType = connectSelectMultiple({
    mapStateToAsyncStatus: state => ({
        status: state.components.selectTaskType[taskGroupType] && state.components.selectTaskType[taskGroupType].status,
        payload: state.components.selectTaskType[taskGroupType] && state.components.selectTaskType[taskGroupType].payload
    }),
    mapItemToLabel: item => item.name,
    mapItemToId: item => `${item.hospitalFreezeFlag}`,
    getOptionsActionCreator: () => getTaskType(taskGroupType)
});

export default SelectSystemFrozenType;
export { SelectSystemFrozenType };

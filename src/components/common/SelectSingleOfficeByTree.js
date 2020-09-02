import { getOffices } from '../../states/components/selectOffice';
import { connectSelectTree } from './BaseSelectTree'


const SelectSingleOffice = connectSelectTree({
    mapStateToAsyncStatus: state => ({
        status: state.components.selectOffice.tree.status,
        payload: state.components.selectOffice.tree.payload
    }),
    mapItemToLabel: item => item.name,
    mapItemToId: item => `${item.id}`,
    getOptionsActionCreator: getOffices
});

export default SelectSingleOffice;
export { SelectSingleOffice as SelectSingleOfficeByTree };

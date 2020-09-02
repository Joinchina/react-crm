import { getDiseases } from '../../states/components/selectMultipleDiseases';
import { connectSelectMultiple } from './BaseSelectMultiple'


const SelectMultipleDisease = connectSelectMultiple({
    mapStateToAsyncStatus: state => state.components.selectMultipleDiseases,
    mapItemToLabel: item => item.name,
    mapItemToId: item => item.id,
    getOptionsActionCreator: getDiseases
});

export default SelectMultipleDisease;
export { SelectMultipleDisease };

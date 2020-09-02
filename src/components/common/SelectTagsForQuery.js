import React, { PureComponent } from 'react';
import { getTagsForQuery } from '../../states/components/selectTagsForQuery';
import { connectSelectMultiple } from './BaseSelectMultipleDropdown';

const forDataRangeCache = {};

function createInstance(key, fetchData) {
    const BaseSelectMultipleTags = connectSelectMultiple({
        mapStateToAsyncStatus: state => state.components.selectTagsForQuery[key] || {},
        mapItemToLabel: item => item.name,
        mapItemToGroupId: item => item.group && item.group.id,
        mapItemToGroupLabel: item => item.group && item.group.name,
        mapItemToId: item => item.id,
        getOptionsActionCreator: fetchData,
    });
    return class SelectTagsForQuery extends PureComponent {
        render() {
            return (<BaseSelectMultipleTags existGroup {...this.props} />);
        }
    };
}

function forDataRange(dataRange) {
    let key;
    if (dataRange === null || dataRange === undefined) {
        key = 'null';
    }
    if (!forDataRangeCache[key]) {
        const params = { dataRange };
        forDataRangeCache[key] = createInstance(key, () => getTagsForQuery(params, key));
    }
    return forDataRangeCache[key];
}

const defaultComponent = forDataRange();
defaultComponent.forDataRange = forDataRange;
export default defaultComponent;
export { defaultComponent as SelectTagsForQuery };

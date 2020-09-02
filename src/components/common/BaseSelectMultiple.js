import React, { Component } from 'react';
import { Select, Tag } from 'antd';
import WHButton from './WHButton';
import blacklist from 'blacklist';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { closestScrollableArea } from '../../helpers/dom';
import SelectPlaceholder from './SelectPlaceholder';
import _ from 'underscore';

function defaultComparator(a, b) {
    return `${a}`.localeCompare(`${b}`);
}

const REMOVING_MARK = {};

/*
**normalize**: 如果 value 中某一项的 id （通过 mapItemToId 获取）可以跟列表中的项匹配，但是实际的值不同（使用 underscore.isEqual 测试），是否需要将 value 修改为列表中的值。

* `false`: 不修改，
* `true`: 修改
* `'unselectNonMatched'`: 修改，并且对于匹配不上的项，取消选择。

例如 `value = [{id: 1}, {id: 3}]`，选项为：`[{id: 1, label: 'a'}, {id: 2, label: 'b'}]`，对应的normalize为以下的值时，会有下列行为：
* `false`: 不触发 onChange，
* `true`: 触发 onChange(newValue), newValue = [{id: 1, label: 'a'}, {id: 3}]
* `'unselectNonMatched'`: 触发 onChange(newValue), newValue = [{id: 1, label: 'a'}]
*/

class SelectMultiple extends Component {

    componentWillMount(){
        const reloadOnMount = this.props.reloadOnMount === undefined ? this.props.connectedReloadOnMount : this.props.reloadOnMount;
        this.reload(reloadOnMount);
        if (this.props.normalize) {
            this.normalizeValue(this.props);
        }
        if (this.props.status === 'fulfilled') {
            this.options = this.getOptions(this.props);
        }
    }

    componentWillReceiveProps(props) {
        if (props.normalize && props.value !== this.props.value) {
            this.normalizeValue(props);
        }
        if (props.status === 'fulfilled' && (!this.options || this.props.status !== 'fulfilled')){
            this.options = this.getOptions(props);
        }
    }

    normalizeValue(props) {
        const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
        if (!props.onChange) return;
        if (props.value && props.status === 'fulfilled') {
            let anyChange;
            let newValue = props.value && props.value.map(item => {
                const id = mapItemToId(item);
                const found = props.payload.find(item => mapItemToId(item) === id);
                if (found) {
                    if (!_.isEqual(item, found)) {
                        anyChange = true;
                        return found;
                    }
                } else {
                    if (props.normalize !== 'unselectNonMatched') {
                        anyChange = REMOVING_MARK;
                        return REMOVING_MARK;
                    }
                }
                return item;
            });
            if (anyChange === REMOVING_MARK) {
                newValue = newValue.filter(it => it !== REMOVING_MARK);
            }
            if (anyChange) {
                props.onChange(newValue, props.payload);
            }
        }
    }

    reload = (force) => {
        if (force || (this.props.status !== 'fulfilled' && this.props.status !== 'pending')) {
            this.props.fetch();
        }
    };

    onSelect = (value) => {
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const item = (() => {
            for (const u of this.props.payload) {
                if (mapItemToId(u) === value) {
                    return u;
                }
            }
            return null;
        })();
        if (!item) return;
        const itemId = mapItemToId(item);
        const o = this.props.value || [];
        if (o.some(u => mapItemToId(u) === itemId)) {
            return;
        }
        this.props.onChange([...o, item], this.props.payload);
    }

    onRemove = (value) => {
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const o = this.props.value || [];
        const valueId = mapItemToId(value);
        this.props.onChange(o.filter(u => mapItemToId(u) !== valueId), this.props.status === 'fulfilled' ? this.props.payload : undefined);
    }

    getOptions(props){
        const mapItemToGroupId = props.mapItemToGroupId || props.connectedMapItemToGroupId || (() => null);
        const mapItemToGroupLabel = props.mapItemToGroupLabel || props.connectedMapItemToGroupLabel || (() => null);
        const groups = [];
        const noGroup = [];
        props.payload.forEach((item, index) => {
            const groupId = mapItemToGroupId(item);
            if (groupId) {
                let group = groups.find(g => g.id === groupId);
                if (!group) {
                    group = {
                        id: groupId,
                        label: mapItemToGroupLabel(item),
                        items: []
                    };
                    groups.push(group);
                }
                group.items.push(item);
            } else {
                noGroup.push(item);
            }
        });
        return {
            noGroup,
            groups
        };
    }

    render() {
        const value = this.props.value || [];
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const mapItemToLabel = this.props.mapItemToLabel || this.props.connectedMapItemToLabel;
        const mapItemToOptionLabel = this.props.mapItemToOptionLabel || this.props.connectedMapItemToOptionLabel || mapItemToLabel;
        const mapItemToDisabled = this.props.mapItemToDisabled || this.props.connectedMapItemToDisabled || (() => false);
        const mapItemToGroupOrder = this.props.mapItemToGroupOrder || this.props.connectedMapItemToGroupOrder;
        const mapItemToOrder = this.props.mapItemToOrder || this.props.connectedMapItemToOrder;
        const itemOrderComparator = this.props.itemOrderComparator || this.props.connectedItemOrderComparator || defaultComparator;
        const groupOrderComparator = this.props.groupOrderComparator || this.props.connectedGroupOrderComparator || defaultComparator;
        const filter = this.props.filter || this.props.connectedFilter || (() => true);
        const noGroup = this.options && this.options.noGroup || [];
        const errorTip = this.props.payload && this.props.payload.status == '403' ? '权限不足，请联系管理员' : this.props.errorTip
        if (mapItemToOrder) {
            noGroup.sort((a, b) => itemOrderComparator(mapItemToOrder(a), mapItemToOrder(b)));
        }
        const groups = this.options && this.options.groups || [];
        if (mapItemToGroupOrder) {
            groups.sort((a, b) => groupOrderComparator(mapItemToGroupOrder(a.items[0]), mapItemToGroupOrder(b.items[0])));
            if (mapItemToOrder) {
                groups.forEach(g => {
                    g.items.sort((a, b) => itemOrderComparator(mapItemToOrder(a), mapItemToOrder(b)));
                });
            }
        }
        return <div style={this.props.style} className={this.props.className}>
            {
                (this.props.value || []).map(u => {
                    if (this.props.status === 'fulfilled') {
                        const id = mapItemToId(u);
                        u = this.props.payload.find(item => mapItemToId(item) === id) || u;
                    }
                    return <WHButton
                        style={{marginRight: 5, marginBottom:10, maxWidth: 120, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}
                        key={mapItemToId(u)}
                        onClick={()=>this.onRemove(u)}
                        selected={true}
                        disabled={this.props.disabled || mapItemToDisabled(u)}
                        title={mapItemToLabel(u)}
                        >
                        {mapItemToLabel(u)}
                    </WHButton>
                })
            }
            <Select
                style={this.props.selectStyle}
                placeholder={this.props.placeholder || (this.props.keyword && `请选择${this.props.keyword}`)}
                value={undefined}
                onSelect={this.onSelect}
                showSearch
                getPopupContainer={closestScrollableArea}
                filterOption={(input, opt) => opt.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                notFoundContent={
                    <SelectPlaceholder keyword={this.props.keyword}
                        loadingTip={this.props.loadingTip} errorTip={errorTip}
                        emptyTip={this.props.emptyTip}
                        status={this.props.status} onReload={this.reload}/> }
                { ...blacklist(this.props, 'value', 'onChange', 'style', 'className') }
                >
                {
                    noGroup.filter(u => !mapItemToDisabled(u) && filter(u) && value.every(v => mapItemToId(v) !== mapItemToId(u)))
                        .map(item => {
                            const label = mapItemToOptionLabel(item);
                            const id = mapItemToId(item);
                            return <Select.Option key={`c:${id}`} value={id} title={label}>{label}</Select.Option>
                        })
                }
                {
                    groups.map(group => {
                        const opts = group.items
                            .filter(u => !mapItemToDisabled(u) && filter(u) && value.every(v => mapItemToId(v) !== mapItemToId(u)))
                            .map(item => {
                                const label = mapItemToOptionLabel(item);
                                const id = mapItemToId(item);
                                return <Select.Option key={id} value={id}>{label}</Select.Option>
                            });
                        if (opts.length) {
                            return <Select.OptGroup key={`g:${group.id}`} label={group.label} title={group.label}>{ opts }</Select.OptGroup>;
                        } else {
                            return null;
                        }
                    }).filter(a => a)
                }
            </Select>
        </div>
    }
}

class SelectMultipleViewer extends Component {

    constructor(props){
        super(props);
        if (props.status === 'fulfilled') {
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
            const map = {};
            props.payload.forEach(item => {
                map[mapItemToId(item)] = item;
            });
            this.itemMap = map;
        }
    }

    componentWillMount(){
        this.reload();
    }

    componentWillReceiveProps(props) {
        if (props.status === 'fulfilled' && (this.props.status !== 'filfilled' || !this.itemMap)) {
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
            const map = {};
            props.payload.forEach(item => {
                map[mapItemToId(item)] = item;
            });
            this.itemMap = map;
        }
    }

    reload = () => {
        if (this.props.status !== 'fulfilled' && this.props.status !== 'pending') {
            this.props.fetch();
        }
    }

    render() {
        if (this.props.status !== 'fulfilled') {
            return <SelectPlaceholder style={{display:'inline-block', margin: '0 10px'}} keyword={this.props.keyword} status={this.props.status} onReload={this.reload}/>;
        }
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const mapItemToLabel = this.props.mapItemToLabel || this.props.connectedMapItemToLabel;
        const Wrapper = this.props.wrapper || 'div';
        const renderItem = this.props.renderItem || ((item, i) => <Tag key={i}>{mapItemToLabel(item)}</Tag>);
        const renderNotFoundItem = this.props.renderNotFoundItem || renderItem;
        return <Wrapper style={this.props.style} className={this.props.className}>{
            (this.props.value || []).map((item, index) => {
                const id = mapItemToId(item);
                const matchedItem = this.itemMap[id];
                if (matchedItem) {
                    return renderItem(matchedItem, index);
                } else {
                    return renderNotFoundItem(item, index);
                }
            })
        }</Wrapper>
    }
}

export function connectSelectMultiple({ mapStateToAsyncStatus, mapItemToLabel,
    mapItemToOptionLabel, mapItemToId, mapItemToOrder, itemOrderComparator,
    mapItemToGroupId, mapItemToGroupLabel, mapItemToGroupOrder, groupOrderComparator,
    mapItemToDisabled, filter, getOptionsActionCreator, reloadOnMount }) {
    const select = state => {
        const as = mapStateToAsyncStatus(state);
        return {
            status: as.status,
            payload: as.payload,
            connectedMapItemToLabel: mapItemToLabel,
            connectedMapItemToId: mapItemToId,
            connectedMapItemToOptionLabel: mapItemToOptionLabel,
            connectedMapItemToGroupId: mapItemToGroupId,
            connectedMapItemToGroupLabel: mapItemToGroupLabel,
            connectedMapItemToDisabled: mapItemToDisabled,
            connectedFilter: filter,
            connectedReloadOnMount: reloadOnMount,
            connectedMapItemToOrder: mapItemToOrder,
            connectedMapItemToGroupOrder: mapItemToGroupOrder,
            connectedItemOrderComparator: itemOrderComparator,
            connectedGroupOrderComparator: groupOrderComparator,
        };
    };
    const mapDispathToProps = dispatch => bindActionCreators({
        fetch: getOptionsActionCreator,
    }, dispatch);
    const ConnectedSelectMultiple = connect(select, mapDispathToProps)(SelectMultiple);
    const ConnectedSelectMultipleViewer = connect(select, mapDispathToProps)(SelectMultipleViewer);
    ConnectedSelectMultiple.Viewer = ConnectedSelectMultipleViewer;
    return ConnectedSelectMultiple;
}

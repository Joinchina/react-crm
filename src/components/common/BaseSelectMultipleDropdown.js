import React, { Component } from 'react';
import { Tag } from 'antd';
import blacklist from 'blacklist';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { closestScrollableArea } from '../../helpers/dom';
import SelectPlaceholder from './SelectPlaceholder';
import DropdownMultipleSelect from './DropdownMultipleSelect';

function defaultComparator(a, b) {
    return `${a}`.localeCompare(`${b}`);
}

const REMOVING_MARK = {};

class SelectMultiple extends Component {
    componentWillMount() {
        const {
            reloadOnMount,
            connectedReloadOnMount,
            normalize,
            status,
        } = this.props;
        const reloadOnMounts = reloadOnMount ? connectedReloadOnMount : reloadOnMount;
        this.reload(reloadOnMounts);
        if (normalize) {
            this.normalizeValue(this.props);
        }
        if (status === 'fulfilled') {
            this.options = this.getOptions(this.props);
        }
    }

    componentWillReceiveProps(props) {
        const { value, status } = this.props;
        if (props.normalize && props.value !== value) {
            this.normalizeValue(props);
        }
        if (props.status === 'fulfilled' && (!this.options || status !== 'fulfilled')) {
            this.options = this.getOptions(props);
        }
    }

    
    normalizeValue(props) {
        const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
        if (!props.onChange) return;
        if (props.value && props.status === 'fulfilled') {
            let anyChange;
            let newValue = props.value && props.value.map((item) => {
                const id = mapItemToId(item);
                const found = props.payload.find(item => mapItemToId(item) === id);
                if (found) {
                    if (!_.isEqual(item, found)) {
                        anyChange = true;
                        return found;
                    }
                } else if (props.normalize !== 'unselectNonMatched') {
                    anyChange = REMOVING_MARK;
                    return REMOVING_MARK;
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

    onChange = (values) => {
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const nv = values.map((value) => {
            let item = this.props.payload.find(u => mapItemToId(u) === value);
            if (item) return item;
            item = this.props.value && this.props.value.find(u => mapItemToId(u) === value);
            return item;
        }).filter(a => a);
        this.props.onChange(nv, this.props.payload);
    }

    getOptions(props) {
        const mapItemToGroupId = props.mapItemToGroupId || props.connectedMapItemToGroupId || (() => null);
        const mapItemToGroupLabel = props.mapItemToGroupLabel || props.connectedMapItemToGroupLabel || (() => null);
        const groups = [];
        const noGroup = [];
        props.payload.forEach((item) => {
            const groupId = mapItemToGroupId(item);
            if (groupId) {
                let group = groups.find(g => g.id === groupId);
                if (!group) {
                    group = {
                        id: groupId,
                        label: mapItemToGroupLabel(item),
                        items: [],
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
            groups,
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
        const errorTip = this.props.payload && this.props.payload.status == '403' ? '权限不足，请联系管理员' : this.props.errorTip;
        if (mapItemToOrder) {
            noGroup.sort((a, b) => itemOrderComparator(mapItemToOrder(a), mapItemToOrder(b)));
        }
        const groups = this.options && this.options.groups || [];
        if (mapItemToGroupOrder) {
            groups.sort((a, b) => groupOrderComparator(mapItemToGroupOrder(a.items[0]), mapItemToGroupOrder(b.items[0])));
            if (mapItemToOrder) {
                groups.forEach((g) => {
                    g.items.sort((a, b) => itemOrderComparator(mapItemToOrder(a), mapItemToOrder(b)));
                });
            }
        }
        const Option = DropdownMultipleSelect.Option;
        const OptGroup = DropdownMultipleSelect.OptGroup;
        return (
            <div style={this.props.style} className={this.props.className}>
                <DropdownMultipleSelect
                    style={this.props.selectStyle}
                    placeholder={this.props.placeholder || (this.props.keyword && `请选择${this.props.keyword}`)}
                    value={value.map(v => mapItemToId(v) ? mapItemToId(v) : v)}
                    onChange={this.onChange}
                    getPopupContainer={closestScrollableArea}
                    notFoundContent={(
                        <SelectPlaceholder
                            keyword={this.props.keyword}
                            loadingTip={this.props.loadingTip}
                            errorTip={errorTip}
                            emptyTip={this.props.emptyTip}
                            status={this.props.status}
                            onReload={this.reload}
                        />
                    )}
                    {...blacklist(this.props, 'value', 'onChange', 'style', 'className')}
                >
                    {
                        noGroup.filter(u => !mapItemToDisabled(u) && filter(u))
                            .map((item) => {
                                const label = mapItemToOptionLabel(item);
                                const id = mapItemToId(item);
                                return (
                                    <Option key={`c:${id}`} value={id} title={label}>
                                        {label}
                                    </Option>
                                );
                            })
                    }
                    {
                        groups.map((group) => {
                            const opts = group.items
                                .filter(u => !mapItemToDisabled(u) && filter(u))
                                .map((item) => {
                                    const label = mapItemToOptionLabel(item);
                                    const id = mapItemToId(item);
                                    return (
                                        <Option key={`c:${id}`} value={id}>
                                            {label}
                                        </Option>
                                    );
                                });
                            if (opts.length) {
                                return (
                                    <OptGroup key={`g:${group.id}`} value={group.id} label={group.label} title={group.label}>
                                        { opts }
                                    </OptGroup>
                                );
                            }
                            return null;
                        }).filter(a => a)
                    }
                </DropdownMultipleSelect>
            </div>
        );
    }
}

class SelectMultipleViewer extends Component {
    constructor(props) {
        super(props);
        if (props.status === 'fulfilled') {
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
            const map = {};
            props.payload.forEach((item) => {
                map[mapItemToId(item)] = item;
            });
            this.itemMap = map;
        }
    }

    componentWillMount() {
        this.reload();
    }

    componentWillReceiveProps(props) {
        if (props.status === 'fulfilled' && (this.props.status !== 'filfilled' || !this.itemMap)) {
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
            const map = {};
            props.payload.forEach((item) => {
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
            return <SelectPlaceholder style={{ display: 'inline-block', margin: '0 10px' }} keyword={this.props.keyword} status={this.props.status} onReload={this.reload} />;
        }
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const mapItemToLabel = this.props.mapItemToLabel || this.props.connectedMapItemToLabel;
        const Wrapper = this.props.wrapper || 'div';
        const renderItem = this.props.renderItem || ((item, i) => (
            <Tag key={i}>
                {mapItemToLabel(item)}
            </Tag>
        ));
        const renderNotFoundItem = this.props.renderNotFoundItem || renderItem;
        return (
            <Wrapper style={this.props.style} className={this.props.className}>
                {
                    (this.props.value || []).map((item, index) => {
                        const id = mapItemToId(item);
                        const matchedItem = this.itemMap[id];
                        if (matchedItem) {
                            return renderItem(matchedItem, index);
                        }
                        return renderNotFoundItem(item, index);
                    })
                }

            </Wrapper>
        );
    }
}

export function connectSelectMultiple({
    mapStateToAsyncStatus, mapItemToLabel,
    mapItemToOptionLabel, mapItemToId, mapItemToOrder, itemOrderComparator,
    mapItemToGroupId, mapItemToGroupLabel, mapItemToGroupOrder, groupOrderComparator,
    mapItemToDisabled, filter, getOptionsActionCreator, reloadOnMount,
}) {
    const select = (state) => {
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

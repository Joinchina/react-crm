import React, { Component } from 'react';
import { Select } from 'antd';
import blacklist from 'blacklist';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { closestScrollableArea } from '../../helpers/dom';
import SelectPlaceholder from './SelectPlaceholder';
import _ from 'underscore';

class SelectSingle extends Component {

    componentWillMount(){
        const reloadOnMount = this.props.reloadOnMount === undefined ? this.props.connectedReloadOnMount : this.props.reloadOnMount;
        this.reload(reloadOnMount);
        if (!this.props.value && this.props.nonNull && this.props.status === 'fulfilled') {
            this.changeToNonNullValue(this.props);
        }
        if (this.props.normalize) {
            this.normalizeValue(this.props);
        }
    }

    componentWillReceiveProps(props) {
        const oldTrigger = !this.props.value && this.props.nonNull && this.props.status === 'fulfilled';
        const newTrigger = !props.value && props.nonNull && props.status === 'fulfilled';
        if (newTrigger && !oldTrigger) {
            this.changeToNonNullValue(props);
        }
        if (props.normalize) {
            this.normalizeValue(props);
        }
    }

    normalizeValue(props) {
        if (!props.onChange) return;
        if (props.value && props.status === 'fulfilled') {
            if (typeof props.normalize === 'function') {
                const newVal = props.normalize(props.value, props.payload);
                if (newVal !== props.value) {
                    props.onChange(newVal);
                }
            } else {
                const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
                const id = mapItemToId(props.value);
                const found = props.payload.find(item => mapItemToId(item) === id);
                if (found) {
                    if (!_.isEqual(props.value, found)) {
                        props.onChange(found);
                    }
                } else {
                    if (props.normalize === 'unselectNonMatched') {
                        props.onChange(undefined);
                    }
                }
            }
        }
    }

    changeToNonNullValue(props){
        if (props.onChange) {
            const getNonNullValue = props.defaultNonNullValue || (list => list[0]);
            const filter = props.filter || (() => true);
            const val = getNonNullValue(props.payload.filter(filter));
            props.onChange(val);
        }
    }

    reload = (force) => {
        if (force || (this.props.status !== 'fulfilled' && this.props.status !== 'pending')) {
            this.props.fetch();
        }
    };

    changeSelect = (id) => {
        if (this.props.onChange && this.props.status === 'fulfilled') {
            const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
            this.props.onChange(this.props.payload.find(item => mapItemToId(item) === id));
        }
    }

    render() {
        const mapItemToLabel = this.props.mapItemToLabel || this.props.connectedMapItemToLabel;
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const filter = this.props.filter || (() => true);
        let opts, errorTip;
        if (this.props.status === 'fulfilled' && this.props.payload) {
            opts = this.props.payload.filter(filter).map(opt => {
                const label = mapItemToLabel(opt);
                const value = mapItemToId(opt);
                return {
                    label, value
                }
            });
        } else {
            opts = [];
        }

        if (this.props.status === 'rejected' && this.props.payload && this.props.payload.status == '403') {
          errorTip = '权限不足，请联系管理员'
        }else{
          errorTip = this.props.errorTip
        }
        let value;
        let id = this.props.value ? mapItemToId(this.props.value) : undefined;
        if (id) {
            if (opts.some(opt => opt.value === id)) {
                value = id;
            } else {
                value = mapItemToLabel(this.props.value);
            }
        } else {
            value = id;
        }
        return <div style={this.props.style} className={this.props.className}>
            <Select
                style={this.props.selectStyle}
                placeholder={this.props.placeholder || (this.props.keyword && `请选择${this.props.keyword}`)}
                value={value}
                onChange={this.changeSelect}
                showSearch
                allowClear={this.props.allowClear}
                getPopupContainer={closestScrollableArea}
                filterOption={(input, opt) => opt.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                notFoundContent={<SelectPlaceholder
                    keyword={this.props.keyword} status={this.props.status} onReload={this.reload}
                    loadingTip={this.props.loadingTip} errorTip={errorTip}
                    emptyTip={this.props.emptyTip} /> }
                { ...blacklist(this.props, 'value', 'onChange', 'style', 'className') }
                >
                {
                    opts.map(u => <Select.Option key={u.value} value={u.value} title={u.label}>{u.label}</Select.Option>)
                }
            </Select>
        </div>
    }
}

class SelectSingleViewer extends Component {

    constructor(props){
        super(props);
        if (props.status === 'fulfilled') {
            const map = {};
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
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
        if (props.status === 'fulfilled' && (this.props.status !== 'fulfilled' || !this.itemMap)) {
            const map = {};
            const mapItemToId = props.mapItemToId || props.connectedMapItemToId;
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

    defaultItemRenderer = item => {
        const mapItemToLabel = this.props.mapItemToLabel || this.props.connectedMapItemToLabel;
        return <span>{mapItemToLabel(item)}</span>;
    }

    render() {
        if (this.props.status !== 'fulfilled') {
            if (this.props.hideAsyncPlaceholder) {
                return null;
            }
            return <SelectPlaceholder style={{display:'inline-block', margin: '0 10px'}} keyword={this.props.keyword} status={this.props.status} onReload={this.reload}/>;
        }
        if (!this.props.value) {
            return this.props.placeholder || null;
        }
        const mapItemToId = this.props.mapItemToId || this.props.connectedMapItemToId;
        const renderItem = this.props.renderItem || this.defaultItemRenderer;
        const renderNotFoundItem = this.props.renderNotFoundItem || renderItem;

        const matchedItem = this.itemMap[mapItemToId(this.props.value)];
        if (matchedItem) {
            return renderItem(matchedItem, this.props.value);
        } else {
            return renderNotFoundItem(this.props.value);
        }
    }
}

export function connectSelectSingle({ mapStateToAsyncStatus, mapItemToLabel, mapItemToId, getOptionsActionCreator, reloadOnMount }) {
    const select = state => {
        const as = mapStateToAsyncStatus(state);
        return {
            status: as.status,
            payload: as.payload,
            connectedMapItemToLabel: mapItemToLabel,
            connectedMapItemToId: mapItemToId,
            connectedReloadOnMount: reloadOnMount,
        };
    };
    const mapDispathToProps = dispatch => bindActionCreators({
        fetch: getOptionsActionCreator,
    }, dispatch);
    const ConnectedSelectSingle = connect(select, mapDispathToProps)(SelectSingle);
    const ConnectedSelectSingleViewer = connect(select, mapDispathToProps)(SelectSingleViewer);
    ConnectedSelectSingle.Viewer = ConnectedSelectSingleViewer;
    ConnectedSelectSingle.reloadActionCreator = getOptionsActionCreator;
    return ConnectedSelectSingle;
}

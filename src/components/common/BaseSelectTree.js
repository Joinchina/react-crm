import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import blacklist from 'blacklist';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { closestScrollableArea } from '../../helpers/dom';
import SelectPlaceholder from './SelectPlaceholder';
import './BaseSelectTree.scss';

class SelectTree extends Component {

    state = {}

    componentWillMount(){
        this.reload();
    }

    reload = () => {
        if (this.props.status !== 'fulfilled') {
            this.props.fetch();
        }
    };

    onSearch = (val) => {
        this.setState({ search: val });
    }

    onChange = (val) => {
        if (val.length > 0) {
            const id = val[val.length-1];
            if (this.props.onChange && this.props.status === 'fulfilled') {
                this.props.onChange(this.props.payload.list.find(item => this.props.mapItemToId(item) === id));
            }
            this.setState({ open: false, search: '' });
        } else {
            this.props.onChange(null);
            this.setState({ search: '' });
        }
    }

    onDropdownVisibleChange = (visible) => {
        if (!visible) {
            this.setState({ open: visible, search: '' });
        } else {
            this.setState({ open: visible });
        }
        return true;
    }

    filterTreeNode = (input, node) => {
        const { mapItemToLabel } = this.props;
        const label = mapItemToLabel(node.props);
        return label.indexOf(input) >= 0;
    }


    render() {
        const { mapItemToId, mapItemToLabel } = this.props;
        const data = this.props.status === 'fulfilled' ? this.props.payload.tree : [];
        const cx = ['wh-select-tree'];
        if (!this.state.search) {
            cx.push('wh-select-tree-no-search-text');
        }
        if (this.props.className){
            cx.push(this.props.className);
        }

        let placeholder;
        if (this.props.value) {
            placeholder = mapItemToLabel(this.props.value);
        } else {
            placeholder = this.props.placeholder || (this.props.keyword && `请选择${this.props.keyword}`);
        }

        let value;
        const id = this.props.value ? mapItemToId(this.props.value) : undefined;
        if(id && this.props.status === 'fulfilled') {
            if(data.some(o => o.value === id)) {
                value = id;
            } else {
                value = mapItemToLabel(this.props.value);
            }
        } else {
            value = id;
        }
        return <TreeSelect className={cx.join(' ')}
                open={this.state.open}
                multiple
                placeholder={placeholder}
                value={value}
                getPopupContainer={closestScrollableArea}
                locale={{ notFoundContent: <SelectPlaceholder keyword={this.props.keyword} status={this.props.status} onReload={this.reload}/> }}
                treeData={data}
                allowClear={true}
                onSearch={this.onSearch}
                inputValue={this.state.search}
                onChange={this.onChange}
                filterTreeNode={this.filterTreeNode}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                { ...blacklist(this.props, 'value', 'onChange', 'style', 'className', 'placeholder') }
            />
    }
}

export function connectSelectTree({ mapStateToAsyncStatus, mapItemToLabel, mapItemToId, getOptionsActionCreator }) {
    const select = state => {
        const as = mapStateToAsyncStatus(state);
        return {
            status: as.status,
            payload: as.payload,
            mapItemToLabel,
            mapItemToId
        };
    };
    const mapDispathToProps = dispatch => bindActionCreators({
        fetch: getOptionsActionCreator,
    }, dispatch);
    const ConnectedSelectSingle = connect(select, mapDispathToProps)(SelectTree);
    return ConnectedSelectSingle;
}

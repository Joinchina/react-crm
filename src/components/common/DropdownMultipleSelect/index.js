import React, { Component } from 'react';
import { Checkbox } from 'antd';
import RcSelect, { Option, OptGroup } from 'rc-select';
import './index.scss';

const SELECT_ALL = `__SELECT_ALL${Math.random()}`;
const NOT_FOUND = `__NOT_FOUND${Math.random()}`;

const stopPropagation = (e) => {
    e.stopPropagation();
};

export default class DropdownMultipleSelect extends Component {
    static Option = Option;

    static OptGroup = OptGroup;

    state = {};

    onSearch = (val) => {
        this.setState({
            search: val,
        });
        const { onSearch } = this.props;
        if (onSearch) {
            onSearch(val);
        }
    }

    onSelect = (value) => {
        const selectedValues = this.props.value || [];
        if (value.indexOf(SELECT_ALL) !== 0) {
            this.toggleValue(value, selectedValues.indexOf(value) < 0);
        } else {
            let allValues;
            if (!this.props.existGroup) {// 下拉列表选项存在分组
                allValues = JSON.parse(value.substr(SELECT_ALL.length)); 
            } else {
                allValues = this.props.payload && this.props.payload.map(item => item.id);
            }       
            this.toggleAll(allValues, allValues.some(v => selectedValues.indexOf(v) < 0));
        }
        if (this.selectRef) {
            const old = this.selectRef.setInputValue;
            this.selectRef.setInputValue = () => { // cancel next setInputValue
                this.selectRef.setInputValue = old;
            };
        }
    }

    onPopupVisibleChange(visible) {
        if (visible) {
            this.setState({ search: '' });
        }
    }

    refSelect = (ref) => {
        this.selectRef = ref;
        if (this.selectRef) {
            const oldSetOpenState = this.selectRef.setOpenState;
            this.selectRef.setOpenState = (...args) => {
                this.onPopupVisibleChange(...args);
                oldSetOpenState.apply(this.selectRef, args);
            };
        }
    }

    toggleValue(val, selected) {
        const { onChange, value } = this.props;
        if (!onChange) return;
        const selectedValues = value || [];
        const idx = selectedValues.indexOf(val);
        if (idx >= 0 && !selected) {
            const nv = [...selectedValues];
            nv.splice(idx, 1);
            onChange(nv);
        }
        if (idx < 0 && selected) {
            const nv = [...selectedValues, val];
            onChange(nv);
        }
    }

    toggleAll(values, selected) {
        const { onChange, value } = this.props;
        if (!onChange) return;
        const selectedValues = value || [];
        let nv;
        if (!selected) {
            nv = selectedValues.filter(val => values.indexOf(val) < 0);
        } else {
            nv = [...selectedValues];
            values.forEach((val) => {
                if (nv.indexOf(val) < 0) {
                    nv.push(val);
                }
            });
        }
        onChange(nv);
    }

    render() {
        const {
            dropdownClassName,
            children,
            existGroup,
            value,
            onChange,
            onSearch,
            notFoundContent,
            filterOption,
            placeholder,
            searchPlaceholder,
            ...restProps
        } = this.props;
        const { search } = this.state;
        const childrens = React.Children.map(children, a => a) || [];
        const selectedValues = value || [];
        let anySelected;
        let anyNotSelected;
        let label;
        if (selectedValues.length === 0) {
            label = null;
        }
        const arr = [];
        if (existGroup) {
            childrens.forEach((ele) => {
                selectedValues.forEach((val) => {
                    const found = ele.props.children
                        .find(childrenVal => childrenVal.props.value === val);
                    if (found) {
                        arr.push(found.props.children);
                    }
                });
            });
            label = arr.join('，');
        } else {
            label = selectedValues.map((val) => {
                const item = childrens.find(opt => opt.props.value === val);
                if (item) {
                    return item.props.children;
                }
                return val;
            }).join('，');
        }
        let filterOptions;
        if (!filterOption) {
            filterOptions = (keyword, opt) => opt.props.children.toLowerCase()
                .indexOf(keyword.toLowerCase()) >= 0;
        }
        let rawOptions;
        let allValues;
        if (!existGroup) {
            rawOptions = childrens.filter(opt => !search || filterOptions(search, opt));
            allValues = rawOptions.map(opt => opt.props.value);
        } else {
            rawOptions = childrens.filter(opt => !search || opt.props.children.some(item => item.props.children.toLowerCase().indexOf(search.toLowerCase()) >= 0));
        }
        const options = rawOptions.map((opt) => {
            const {
                children, value, label, ...restProps
            } = opt.props;
            if (Array.isArray(children)) {
                return (
                    <OptGroup key={value} value={value} label={label}>
                        {
                            children.map((item) => {
                                const selected = selectedValues.indexOf(item.props.value) >= 0;
                                if (selected) {
                                    anySelected = true;
                                } else {
                                    anyNotSelected = true;
                                }
                                return (
                                    <Option
                                        key={item.props.value}
                                        value={item.props.value}
                                        title={item.props.children}
                                        {...restProps}
                                    >
                                        <div className="wh-dropdown-multiple-select-item">
                                            <Checkbox checked={selected} />
                                            {' '}
                                            {item.props.children}
                                        </div>
                                    </Option>
                                );
                            })
                        }
                    </OptGroup>
                );
            }
            const selected = selectedValues.indexOf(value) >= 0;
            if (selected) {
                anySelected = true;
            } else {
                anyNotSelected = true;
            }
            return (
                <Option key={value} value={value} {...restProps} title={children}>
                    <div className="wh-dropdown-multiple-select-item">
                        <Checkbox checked={selected} />
                        {' '}
                        {children}
                    </div>
                </Option>
            );
        });
        if (options.length) {
            if (options.length > 1) {
                let allSelected = null;
                if (anySelected && !anyNotSelected) {
                    allSelected = true;
                } else if (!anySelected && anyNotSelected) {
                    allSelected = false;
                }
                options.unshift(
                    <Option key={SELECT_ALL} value={`${SELECT_ALL}${JSON.stringify(allValues)}`}>
                        <div className="wh-dropdown-multiple-select-item">
                            <Checkbox indeterminate={allSelected === null} checked={allSelected}>
                                全选
                            </Checkbox>
                        </div>
                    </Option>,
                );
            }
        } else {
            options.unshift(
                <Option key={NOT_FOUND} disabled>
                    {/* eslint-disable-next-line */}
                    <div onClick={stopPropagation} className="wh-dropdown-multiple-select-item">
                        {notFoundContent}
                    </div>
                </Option>,
            );
        }
        return (
            <RcSelect
                {...restProps}
                multiple
                prefixCls="ant-select"
                transitionName="slide-up"
                choiceTransitionName="zoom"
                ref={this.refSelect}
                value={undefined}
                placeholder={selectedValues.length ? label : placeholder}
                dropdownClassName={dropdownClassName ? `${dropdownClassName} wh-dropdown-multiple-select-dropdown` : 'wh-dropdown-multiple-select-dropdown'}
                className={selectedValues.length ? 'wh-dropdown-multiple-select has-value' : 'wh-dropdown-multiple-select'}
                showSearch
                onSearch={this.onSearch}
                onSelect={this.onSelect}
                onDeselect={this.onDeselect}
                onChange={this.onChange}
                filterOption={false}
                searchPlaceholder={searchPlaceholder || placeholder}
                getInputElement={() => <input autoComplete="off" />}
            >
                {options}
            </RcSelect>
        );
    }
}

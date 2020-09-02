import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Input, Dropdown, Menu } from 'antd';
import NumberInput from './NumberInput';
import './index.scss';
import { closest } from '../../../helpers/dom';

export default class SelectWithNumber extends Component {

    state = {
        counts: {}
    };

    showDropdown = () => {
        if (!this.state.visible) {
            this.setState(state => {
                if (!state.visible) {
                    return {
                        visible: true,
                        counts: {}
                    }
                }
            });
        }
        if (!this.outsideEventRegistered) {
           document.addEventListener('click', this.handleOutsideClick, true);
           this.outsideEventRegistered = true;
        }
    }

    hideDropdown = () => {
        this.setState({
            visible: false
        });
        if (this.outsideEventRegistered) {
            document.removeEventListener('click', this.handleOutsideClick, true);
            this.outsideEventRegistered = false;
        }
        this.props.resetDrugs();
    }

    selectMenuItem(key) {
        if (this.inputRefs[key]) {
            this.inputRefs[key].focus();
        }
    }

    selectSearch(){
        if (this.searchRef) {
            this.searchRef.focus();
            setTimeout(() => this.searchRef.setSelectionRange(0, this.searchRef.value.length));
        }
    }

    selectNext = (currentKey) => {
        let found;
        let result;
        React.Children.forEach(this.props.children, node => {
            if(node && node.props && node.key){
                if (node.props.disabled) {
                    return;
                }
                if (!found) {
                    if (!currentKey) {
                        found = true;
                        result = node;
                    } else if (node.key === currentKey) {
                        found = true;
                    }
                } else if (!result) {
                    result = node;
                }
            }              
        });
        if (result) {
            this.selectMenuItem(result.key);
        }
    }

    selectPrev = (currentKey) => {
        let found;
        let result;
        React.Children.forEach(this.props.children, node => {
            if(node && node.props && node.key){
                if (node.props.disabled) {
                    return;
                }
                if (!found) {
                    if (node.key === currentKey) {
                        found = true;
                    } else {
                        result = node;
                    }
                }
            }
        });
        if (result) {
            this.selectMenuItem(result.key);
        } else {
            this.selectSearch();
        }
    }

    inputRefs = {};
    refInput(key, ref) {
        this.inputRefs[key] = ref;
    }

    refSearch = (ref) => {
        this.searchRef = ref;
    }

    onKeyDown(key, e) {
        switch (e.keyCode) {
            case 13: //Enter
                this.onSelect(key);
                break;
            case 27: //Escape
                this.hideDropdown();
                break;
            case 37: //Left
                this.setState(state => {
                    const v = Number(state.counts[key]) || 1;
                    return {
                        counts: {
                            ...state.counts,
                            [key]: Math.max(1, v - 1)
                        }
                    };
                });
                if (this.inputRefs[key]) {
                    setTimeout(() => {
                        this.inputRefs[key].selectAll();
                    });
                }
                break;
            case 38: //Up
                this.selectPrev(key);
                break;
            case 39: //Right
                this.setState(state => {
                    const v = Number(state.counts[key]) || 1;
                    return {
                        counts: {
                            ...state.counts,
                            [key]: this.props.max ? Math.min(this.props.max, v + 1) : v + 1
                        }
                    };
                });
                if (this.inputRefs[key]) {
                    setTimeout(() => {
                        this.inputRefs[key].selectAll();
                    });
                }
                break;
            case 40: //Down
                this.selectNext(key);
                break;
            default:
            return;
        }
        if ((e.keyCode >= 48 && e.keyCode <= 57) ||
            (e.keyCode >= 96 && e.keyCode <= 105) ||
            e.keyCode == 8/*Bksp*/ || e.keyCode == 46 /*del*/
            ) {
            //continue input numbers
        } else {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    onChange(key, num) {
        const v = num || 1;
        this.setState({
            counts: {
                ...this.state.counts,
                [key]: Math.max(1, this.props.max ? Math.min(this.props.max, v) : v),
            }
        });
    }

    onSearchKeyDown = (e) => {
        switch (e.keyCode) {
            case 27: //Escape
                this.hideDropdown();
                break;
            case 38: //Up
            case 40: //Down
                this.selectNext();
                break;
            default:
                return;
        }
        e.preventDefault();
        e.stopPropagation();
    }

    onSearchChange = e => {
        this.props.onChange(e.target.value);
        this.showDropdown();
    }

    onScroll = e => {
        if (e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop < 50) {
            if (this.props.onScrollToBottom) {
                this.props.onScrollToBottom(e);
            }
        }
    }

    refMenu = ref => {
        this.menuRef = ref;
        if (ref) {
            ref.addEventListener('scroll', this.onScroll);
        }
    }

    componentWillUnmount() {
        if (this.outsideEventRegistered) {
            document.removeEventListener('click', this.handleOutsideClick, true);
            this.outsideEventRegistered = false;
        }
    }

    onSelect = key => {
        let found;
        React.Children.forEach(this.props.children, node => {
            if(node && node.props && node.key){
                if (node.props.disabled) {
                    return;
                }
                if (!found) {
                    if (node.key === key) {
                        found = node;
                    }
                }
            }
        });
        if (found && this.props.onSelect) {
            this.hideDropdown();
            this.props.onSelect(found.props.value || found.key, this.state.counts[key] || 1);
        }
    }

    handleOutsideClick = e => {
        const inside = closest(dom => dom === this.menuRef || dom === this.searchRef)(e.target);
        if (!inside) {
            this.hideDropdown();
        }
    }

    render() {

        const {
            getPopupContainer,
            dropdownMatchSelectWidth,
            dropdownStyle,
            rowKeyClassNamePrefix,
            rowIndexClassNamePrefix,
            value,
            onChange
        } = this.props;

        const overlay = <ul
        className="wh-select-with-number-dropdown ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"
        ref={this.refMenu}
        children={React.Children.map(this.props.children, (node, index) => {
                let moreClass = '';
                if (rowKeyClassNamePrefix) {
                  moreClass += `${rowKeyClassNamePrefix}${node.key} `;
                }
                if (rowIndexClassNamePrefix) {
                  moreClass += `${rowIndexClassNamePrefix}${index} `;
                }
                if(node && node.props && node.key){
                    return (
                        <li key={node.key}
                          className={moreClass ? `ant-dropdown-menu-item ${moreClass}` : 'ant-dropdown-menu-item'}
                          style={dropdownStyle}
                          onClick={() => this.onSelect(node.key)}
                        >
                        <div onMouseEnter={() => this.selectMenuItem(node.key)}>
                            { !node.props.disabled && <NumberInput 
                                className={this.props.numberClassName}
                                ref={ref => this.refInput(node.key, ref)}
                                onKeyDown={e => this.onKeyDown(node.key, e)}
                                    value={this.state.counts[node.key] || '1'}
                                    onChange={e => this.onChange(node.key, e)}
                                    maxLength={this.props.max && `${this.props.max}`.length}
                                    /> }
                                    <div className={`wh-select-with-number-item-wrapper ${node.props.disabled ? 'disabled' : ''}`}>
                                        { node.props.children }
                                    </div>
                                </div>
                    </li>
                    )
                }
            }
           )}
            >
        </ul>

        return <Dropdown overlay={overlay} trigger={[]} visible={this.state.visible}
            getPopupContainer={getPopupContainer}
            minOverlayWidthMatchTrigger={this.props.minOverlayWidthMatchTrigger === undefined ? false : this.props.minOverlayWidthMatchTrigger}
            placement={this.props.dropdownPlacement}
            align={this.props.dropdownAlign}
            disabled={this.props.disabled}
            >
            <input ref={this.refSearch}
                disabled={this.props.disabled}
                onKeyDown={this.onSearchKeyDown}
                className={this.props.inputClassName ? `ant-input wh-select-with-number ${this.props.inputClassName}` : 'ant-input wh-select-with-number'}
                onFocus={this.showDropdown}
                placeholder={this.props.placeholder}
                value={value || ''}
                onChange={this.onSearchChange}
                />
        </Dropdown>
    }

    static Option = function SelectWithNumberOption(props) {
        return null;
    }
}

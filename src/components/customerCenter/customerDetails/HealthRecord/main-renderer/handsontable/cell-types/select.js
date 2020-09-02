import React from 'react';
import propTypes from 'prop-types';
import Select from '@wanhu/antd-legacy/lib/select';
import memoize from 'memoize-one';
import Handsontable from '../lib';
import './select.css';
import AntdBaseEditor, { BaseComponent, InputKeyCodeHandlers, PopupKeyCodeHandlers } from './antd-editor';
import createAntdRenderer from './antd-renderer';


export class SelectEditor extends BaseComponent {
    static propTypes = {
        source: propTypes.arrayOf(propTypes.shape({
            id: propTypes.string.isRequired,
            name: propTypes.string.isRequired,
        })).isRequired,
        getPopupContainer: propTypes.func.isRequired,
        onSelect: propTypes.func,
    }

    static defaultProps = {
        source: [],
        onSelect: null,
        filterSource: (input, sourceItem) => {
            const name = `${sourceItem.name}`.toLowerCase();
            return name.indexOf(input.toLowerCase()) >= 0;
        },
    }

    state = {
        value: null,
        open: false,
    };

    onChange = (value) => {
        this.setState({
            value,
        }, () => {
            const { onSubmit } = this.props;
            if (onSubmit) {
                onSubmit();
            }
        });
    }

    setValue = (value) => {
        const { source } = this.props;
        const selectedItem = source.find(s => s.id === value);
        this.setState({
            value: (selectedItem && selectedItem.id) || null,
        });
    }

    open() {
        this.setState({ open: true });
        const { showSearch } = this.props;
        if (showSearch) {
            const select = this.element && this.element.rcSelect;
            if (select) {
                select.setInputValue('', true);
            }
        }
    }

    close() {
        this.setState({ open: false });
    }

    focus() {
        const { showSearch } = this.props;
        if (showSearch) {
            const input = this.element.rcSelect && this.element.rcSelect.getInputDOMNode();
            if (input) {
                input.focus();
            }
        } else {
            this.element.focus();
        }
    }

    onSearch = (key) => {
        this.searchKey = key;
    }

    getSourceAndSelectedIndex() {
        const { value } = this.state;
        const { showSearch, filterSource } = this.props;
        let { source } = this.props;
        if (showSearch) {
            source = source.filter(sourceItem => filterSource(this.searchKey || '', sourceItem));
        }
        const selectedIndex = source.findIndex(s => s.id === value);
        return { source, selectedIndex };
    }

    optionScrollIntoView = () => {
        const select = this.element.rcSelect;
        const dom = select.getPopupDOMNode();
        const { selectedIndex } = this.getSourceAndSelectedIndex();
        const elem = dom.querySelector(`li.ant-select-dropdown-menu-item:nth-child(${selectedIndex})`);
        if (elem) {
            elem.scrollIntoViewIfNeeded();
        }
    }

    selectNext() {
        const { source, selectedIndex } = this.getSourceAndSelectedIndex();
        if (selectedIndex < source.length - 1) {
            this.setState({ value: source[selectedIndex + 1].id }, this.optionScrollIntoView);
        } else {
            this.setState({ value: source[0].id }, this.optionScrollIntoView);
        }
    }

    selectPrev() {
        const { source, selectedIndex } = this.getSourceAndSelectedIndex();
        if (selectedIndex >= 1) {
            this.setState({ value: source[selectedIndex - 1].id }, this.optionScrollIntoView);
        } else {
            this.setState({ value: source[0].id }, this.optionScrollIntoView);
        }
    }

    getFilterOption = memoize((showSearch, filterSource) => {
        if (!showSearch) {
            return undefined;
        }
        return (input, option) => {
            const {
                source,
            } = this.props;
            const id = option.props.value;
            const sourceItem = source.find(s => s.id === id);
            if (sourceItem) {
                return filterSource(input, sourceItem);
            }
            return false;
        };
    });

    render() {
        const { value, open } = this.state;
        const {
            source, placeholder, getPopupContainer, showSearch, filterSource,
        } = this.props;
        const options = source.map(s => (
            <Select.Option key={s.id} value={s.id}>
                {s.name}
            </Select.Option>
        ));
        return (
            <Select
                ref={this.refElement}
                placeholder={placeholder}
                dropdownClassName="ht-antd-dropdown"
                value={value}
                onChange={this.onChange}
                open={open}
                getPopupContainer={getPopupContainer}
                dropdownMatchSelectWidth={false}
                allowClear={false}
                showSearch={showSearch}
                filterOption={this.getFilterOption(showSearch, filterSource)}
                onSearch={this.onSearch}
            >
                { options }
            </Select>
        );
    }
}

const { KEY_CODES } = Handsontable.helper;

class AntdSelectEditor extends AntdBaseEditor {
    handleSelectKeyCodes = {
        ...PopupKeyCodeHandlers,
        [KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.selectPrev();
            return false;
        },
        [KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.selectNext();
            return false;
        },
    }

    handleSearchKeyCodes = {
        ...InputKeyCodeHandlers,
        [KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.selectPrev();
            return false;
        },
        [KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.selectNext();
            return false;
        },
    }

    handleKeyDown(event) {
        const { showSearch } = this.cellProperties;
        if (showSearch) {
            super.handleKeyDown(event, this.handleSearchKeyCodes);
        } else {
            super.handleKeyDown(event, this.handleSelectKeyCodes);
        }
    }

    open() {
        super.open();
        this.reactComponent.open();
    }

    close() {
        this.reactComponent.close();
        setTimeout(() => super.close(), 300);// delay hide element for close animation
    }

    render() {
        const {
            placeholder, source = [], getPopupContainer, showSearch, filterSource,
        } = this.cellProperties;
        return (
            <SelectEditor
                placeholder={placeholder}
                source={source}
                filterSource={filterSource}
                showSearch={showSearch}
                getPopupContainer={getPopupContainer || this.getPopupContainer}
                onSubmit={this.onSubmit}
            />
        );
    }
}

function SelectRenderer(value, cellProperties) {
    const {
        source, renderSource, placeholder, validateStatus, help,
    } = cellProperties;
    let attrs = '';
    let label;

    if (value === null || value === undefined || value === '') {
        attrs = 'class="htPlaceholder"';
        label = placeholder || '';
    } else {
        const actualSource = renderSource || source;
        const selectedItem = actualSource ? actualSource.find(s => s.id === value) : null;
        label = (selectedItem && selectedItem.name) || '';
    }
    if (validateStatus === 'warning') {
        return `
            <span ${attrs}>
                ${label}
                <span class="ht-antd-cell-icon ht-antd-cell-icon">
                    <i theme="filled" class="anticon anticon-${help}"></i>
                </span>
            </span>
        `;
    }
    return `
        <span ${attrs}>
            ${label}
            <span class="ht-antd-cell-icon">
                <i class="anticon anticon-down"></i>
            </span>
        </span>
    `;
}

export default {
    editor: AntdSelectEditor,
    renderer: createAntdRenderer(SelectRenderer),
    className: 'ht-antd-cell-with-icon',
};

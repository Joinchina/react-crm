import React from 'react';
import memoize from 'memoize-one';
import Cascader from '@wanhu/antd-legacy/lib/cascader';
import AntdBaseEditor, { BaseComponent } from './antd-editor';
import Handsontable from '../lib';
import createAntdRenderer from './antd-renderer';
import './cascader.css';

function findItemAndParent(source, id) {
    if (!source) return [];

    function findImpl(source, id, index) {
        if (Array.isArray(id)) {
            if (!id.length) return null;
            const currentIndex = index || 0;
            const currentId = id[currentIndex];
            if (!currentId) return null;
            const item = source.find(item => item.id === currentId);
            if (!item) return null;
            if (currentIndex === id.length - 1) {
                return [item, source];
            }
            if (!item.children) {
                return null;
            }
            return findImpl(item.children, id, currentIndex + 1);
        }
        if (!id) return null;
        for (const item of source) {
            if (item.id === id) return [item, source];
            if (item.children) {
                const inChildren = findImpl(item.children, id);
                if (inChildren) return inChildren;
            }
        }
        return null;
    }
    const itemAndParent = findImpl(source, id, null, source);
    return itemAndParent || [];
}

function findIdPath(source, id) {
    if (!id) return null;
    for (const item of source) {
        if (item.id === id) return [id];
        if (item.children) {
            const inChildren = findIdPath(item.children, id);
            if (inChildren) return [item.id, ...inChildren];
        }
    }
    return null;
}

export class CascaderEditor extends BaseComponent {
    state = {
        value: [],
        open: false,
        index: 0,
    };

    onChange = (value) => {
        this.setState({
            value,
        }, () => {
            const { onSubmit } = this.props;
            onSubmit();
        });
    }

    setValue = (value) => {
        const { source } = this.props;
        const idPath = findIdPath(source, value) || [];
        this.setState({ value: idPath });
    }

    getValue = () => {
        const { value } = this.state;
        if (!value || !value.length) {
            return null;
        }
        const { source } = this.props;
        const [item] = findItemAndParent(source, value);
        if (item.children) {
            return null;
        }
        return value[value.length - 1];
    }

    open() {
        this.setState({ open: true });
    }

    close() {
        this.setState({ open: false });
    }

    selectNext() {
        let { value } = this.state;
        const { source } = this.props;
        const [current, parent] = findItemAndParent(source, value);
        if (current) {
            const index = parent.indexOf(current);
            if (parent[index + 1]) {
                value = value.map(id => (id === current.id ? parent[index + 1].id : id));
                this.setState({ value });
            }
        } else {
            this.setState({ value: [source[0].id] });
        }
    }

    selectPrev() {
        let { value } = this.state;
        const { source } = this.props;
        const [current, parent] = findItemAndParent(source, value);
        if (current) {
            const index = parent.indexOf(current);
            if (parent[index - 1]) {
                value = value.map(id => (id === current.id ? parent[index - 1].id : id));
                this.setState({ value });
            }
        } else {
            this.setState({ value: [source[0].id] });
        }
    }

    selectChildren() {
        let { value } = this.state;
        const { source } = this.props;
        const [current] = findItemAndParent(source, value);
        if (current.children) {
            value = [...value, current.children[0].id];
            this.setState({ value });
            return true;
        }
        return false;
    }

    selectParent() {
        const { value } = this.state;
        if (value.length > 1) {
            this.setState({ value: value.slice(0, value.length - 1) });
        }
    }

    getOptions = memoize((source) => {
        function mapSourceItem(item) {
            if (!item) return null;
            return {
                value: item.id,
                label: item.name,
                children: item.children && item.children.map(mapSourceItem),
            };
        }
        return source && source.map(mapSourceItem);
    })

    cascaderRenderer = (labels) => {
        if (!labels || !labels.length) {
            return null;
        }
        return labels[labels.length - 1];
    }

    render() {
        const { value, open } = this.state;
        const {
            source, placeholder, getPopupContainer, showSearch,
        } = this.props;
        const options = this.getOptions(source);
        return (
            <Cascader
                placeholder={placeholder}
                value={value}
                onChange={this.onChange}
                popupVisible={open}
                ref={this.refElement}
                options={options}
                getPopupContainer={getPopupContainer}
                expandTrigger="hover"
                displayRender={this.cascaderRenderer}
                allowClear={false}
                showSearch={showSearch}
            />
        );
    }
}

class AntdCascaderEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...AntdBaseEditor.PopupKeyCodeHandlers,
        [Handsontable.helper.KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.selectPrev();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.selectNext();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_RIGHT]: (editor) => {
            editor.reactComponent.selectChildren();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_LEFT]: (editor) => {
            editor.reactComponent.selectParent();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ENTER]: (editor, event) => {
            if (!editor.reactComponent.selectChildren()) {
                this.onSubmit(event.ctrlKey);
            }
            return false;
        },
    }

    open() {
        super.open();
        this.reactComponent.open();
        this.opening = true;
    }

    close() {
        super.close();
        this.reactComponent.close();
        this.opening = false;
    }

    render() {
        const {
            source = [], placeholder, getPopupContainer, showSearch,
        } = this.cellProperties;
        return (
            <CascaderEditor
                source={source}
                placeholder={placeholder}
                showSearch={showSearch}
                getPopupContainer={getPopupContainer || this.getPopupContainer}
                onSubmit={this.onSubmit}
            />
        );
    }
}

function CascaderRenderer(value, cellProperties) {
    const { source, renderSource } = cellProperties;
    const [selectedItem] = findItemAndParent(renderSource || source, value);
    return `
        <span>
            ${(selectedItem && selectedItem.name) || ''}
            <span class="ht-antd-cell-icon">
                <i class="anticon anticon-down"></i>
            </span>
        </span>
    `;
}

export default {
    editor: AntdCascaderEditor,
    renderer: createAntdRenderer(CascaderRenderer),
    className: 'ht-antd-cell-with-icon',
};

import React from 'react';
import propTypes from 'prop-types';
import Input from '@wanhu/antd-legacy/lib/input';
import Button from '@wanhu/antd-legacy/lib/button';
import 'antd/lib/input/style/css';
import 'antd/lib/button/style/css';
import Handsontable from '../lib';
import AntdBaseEditor, { BaseComponent, InputKeyCodeHandlers } from './antd-editor';
import './popup-text.css';
import makeAntdRenderer from './antd-renderer';

export class PopupTextEditor extends BaseComponent {
    static propTypes = {
        maxLength: propTypes.number,
        placeholder: propTypes.string,
        direction: propTypes.string.isRequired,
        onSubmit: propTypes.func,
        onCancel: propTypes.func,
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    onKeyDown = (e) => {
        const { onSubmit, onCancel } = this.props;
        if (e.keyCode === Handsontable.helper.KEY_CODES.ENTER
            && (e.altKey || e.ctrlKey || e.metaKey)) {
            onSubmit();
            e.preventDefault();
        }
        if (e.keyCode === Handsontable.helper.KEY_CODES.ESCAPE) {
            onCancel();
            e.preventDefault();
        }
    }

    render() {
        const { value } = this.state;
        const length = value ? value.length : 0;
        const {
            maxLength,
            placeholder,
            onSubmit,
            onCancel,
            autosize = true,
            direction,
        } = this.props;
        return (
            <div className={`ht-antd-popup-text-box ${direction}`}>
                <Input.TextArea
                    autosize={autosize}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange}
                    ref={this.refElement}
                    maxLength={maxLength}
                    onKeyDown={this.onKeyDown}
                />
                <div className="ht-antd-popup-text-footer">
                    <Button.Group size="small">
                        { maxLength ? (
                            <span>
                                {`${length} / ${maxLength}`}
                            </span>
                        ) : null }
                        <Button type="default" onClick={onCancel}>
                            取消 (Esc)
                        </Button>
                        <Button type="primary" onClick={onSubmit}>
                            确认 (Ctrl-Enter)
                        </Button>
                    </Button.Group>
                </div>
            </div>
        );
    }
}

class AntdPopupTextEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...InputKeyCodeHandlers,
        [Handsontable.helper.KEY_CODES.ENTER]: (editor, e) => {
            if (e.altKey || e.ctrlKey || e.metaKey) {
                return AntdBaseEditor.Handlers.submit(editor, e);
            }
            return AntdBaseEditor.Handlers.native(editor, e);
        },
    }

    onSelect = () => {
        this.finishEditing(false);
    }

    initValueFromEvent(e) {
        if (e.key && e.key.length === 1) {
            this.setValue('');
        }
    }

    render() {
        const {
            maxLength,
            placeholder,
            autosize = true,
            direction = 'bottomRight',
        } = this.cellProperties;
        return (
            <PopupTextEditor
                autosize={autosize}
                direction={direction}
                maxLength={maxLength}
                placeholder={placeholder}
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
            />
        );
    }
}

export default {
    editor: AntdPopupTextEditor,
    renderer: makeAntdRenderer(),
    className: 'ht-antd-popup-text',
};

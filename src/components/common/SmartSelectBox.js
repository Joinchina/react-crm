import React, { Component } from 'react';
import { Tag } from 'antd';
import { WHButton } from './WHButton';
import NotEditableField from './NotEditableField';
import PropTypes from '../../helpers/prop-types';

/*
 * 参数
 *    props.switchState       func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus        bool  当前编辑状态
 *    props.notEditableOnly   bool  是否允许编辑
 *    props.multiple           bool  是否可多选
 *    props.cancelledable      bool  是否可以取消选择（单选模式）
 *    props.value             array 值
 *      [3, ...]

 *    props.buttonOptions     array 值
 *      [
 *        {
 *          id: 3,
 *          name: 'AAA',
 *        },
 *        {
 *          id: 5,
 *          name: 'BBB',
 *        }
 *        ...
 *      ]
 */

export default class SmartSelectBox extends Component {
    static propTypes = {
        /* eslint-disable */
        value: PropTypes.array,
        buttonOptions: PropTypes.array,
        cancelledable: PropTypes.bool,
        multiple: PropTypes.bool,
        onChange: PropTypes.func,
        editStatus: PropTypes.bool,
        notEditableOnly: PropTypes.bool,
    };

    static defaultProps = {
        cancelledable: undefined,
        multiple: undefined,
        editStatus: undefined,
        notEditableOnly: undefined,
        onChange: undefined,
    };

    constructor(props) {
        super(props);
        const value = props.value ? props.value : [];
        this.state = {
            value,
        };
    }

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            this.setState({ value: nextProps.value });
        }
    }

    getNameById(id) {
        if (!id) return null;
        const { buttonOptions } = this.props;
        if (!Array.isArray(buttonOptions)) return '未知值';
        for (let i = 0; i < buttonOptions.length; i += 1) {
            if (buttonOptions[i].id === id) {
                return buttonOptions[i].name;
            }
        }
        return '未知值';
    }

    changeStatus(d) {
        const { value } = this.state;
        const oldValue = value || [];
        let newState;
        const { multiple, cancelledable } = this.props;
        if (multiple) {
            const index = oldValue.indexOf(d.id);
            if (index === -1) {
                newState = [...oldValue, d.id];
            } else {
                newState = [...oldValue.slice(0, index), ...oldValue.slice(index + 1)];
            }
        } else {
            newState = [d.id];
        }
        if (cancelledable) {
            const index = oldValue.indexOf(d.id);
            if (oldValue.indexOf(d.id) !== -1) {
                newState = [...oldValue.slice(0, index), ...oldValue.slice(index + 1)];
            }
        }
        this.setState({ value: newState });
        this.triggerChange(newState);
    }

    triggerChange(value) {
        const { onChange } = this.props;
        if (onChange) {
            const nvalue = value.length ? value : undefined;
            onChange(nvalue);
        }
    }

    ifButtonOptionInValue(id) {
        const { value } = this.state;
        if (!Array.isArray(value)) return false;
        const index = value.indexOf(`${id}`);
        return index !== -1;
    }

    render() {
        const { editStatus, notEditableOnly } = this.props;
        const { value } = this.state;
        if (!editStatus || notEditableOnly === true) {
            let tags = [];
            if (Array.isArray(value)) {
                tags = value.map((id, index) => {
                    const name = this.getNameById(id);
                    return name ? (
                        <Tag key={id || index}>
                            {name}
                        </Tag>
                    ) : null;
                });
            }
            return (
                <NotEditableField
                    {...this.props}
                >
                    {tags}
                </NotEditableField>
            );
        }
        let { buttonOptions } = this.props;
        if (!Array.isArray(buttonOptions)) buttonOptions = [];
        const options = buttonOptions.map((d, index) => {
            if(d){
                const id = `${d.id}`;
                const selected = this.ifButtonOptionInValue(id);
                return (
                    <WHButton
                        style={{
                            marginRight: 5, marginBottom: 10, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'unset',
                            height: 'unset', minHeight: '36px',  lineHeight: '23px', textAlign: 'left'
                        }}
                        key={d.id || index}
                        onClick={() => this.changeStatus(d)}
                        selected={!!selected}
                        title={d.name}
                        disabled={d.isDisabled}
                    >
                        {d.name}
                    </WHButton>
                );
            }
        });
        return (
            <div>
                {options}
            </div>
        );
    }
}

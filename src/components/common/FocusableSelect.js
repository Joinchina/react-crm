import React from 'react';
import PropTypes from 'prop-types';
import RcSelect, { Option, OptGroup } from 'rc-select';
import classNames from 'classnames';
import warning from 'antd/lib/_util/warning';

const SelectPropTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['default', 'large', 'small']),
  combobox: PropTypes.bool,
  notFoundContent: PropTypes.any,
  showSearch: PropTypes.bool,
  optionLabelProp: PropTypes.string,
  transitionName: PropTypes.string,
  choiceTransitionName: PropTypes.string,
};

// => It is needless to export the declaration of below two inner components.
// export { Option, OptGroup };
export default class Select extends React.Component {
  static Option = Option;
  static OptGroup = OptGroup;

  static defaultProps = {
    prefixCls: 'ant-select',
    showSearch: false,
    transitionName: 'slide-up',
    choiceTransitionName: 'zoom',
  };

  static propTypes = SelectPropTypes;

  static contextTypes = {
    antLocale: PropTypes.object,
  };

  getLocale() {
    const { antLocale } = this.context;
    if (antLocale && antLocale.Select) {
      return antLocale.Select;
    }
    return {
      notFoundContent: '无匹配结果',
    };
  }

  search(value) {
    this.refs.select.setOpenState(true, true);
    this.refs.select.onInputChange({
        target: { value }
    });
  }

  focus() {
    this.refs.select.setOpenState(false, false);
  }

  blur() {
    this.refs.select.setOpenState(false, false);
  }



  render() {
    const {
      prefixCls,
      className = '',
      size,
      mode,
      // @deprecated
      multiple,
      tags,
      combobox,
      ...restProps,
    } = this.props;
    warning(
      !multiple && !tags && !combobox,
      '`Select[multiple|tags|combobox]` is deprecated, please use `Select[mode]` instead.',
    );

    const cls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    }, className);

    const locale = this.getLocale();
    let { notFoundContent = locale.notFoundContent, optionLabelProp } = this.props;
    const isCombobox = mode === 'combobox' || combobox;
    if (isCombobox) {
      notFoundContent = null;
      // children 带 dom 结构时，无法填入输入框
      optionLabelProp = optionLabelProp || 'value';
    }

    const modeConfig = {
      multiple: mode === 'multiple' || multiple,
      tags: mode === 'tags' || tags,
      combobox: isCombobox,
    };

    return (
      <RcSelect
        ref="select"
        {...restProps}
        {...modeConfig}
        prefixCls={prefixCls}
        className={cls}
        optionLabelProp={optionLabelProp || 'children'}
        notFoundContent={notFoundContent}
      />
    );
  }
}
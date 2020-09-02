import React from 'react';
import propTypes from 'prop-types';
import DatePicker from '@wanhu/antd-legacy/lib/datePicker';
import moment from 'moment';
import 'moment/locale/zh-cn';
import memoize from 'memoize-one';
import locale from '@wanhu/antd-legacy/lib/datePicker/locale';
import Handsontable from '../lib';
import './date.less';
import AntdBaseEditor, { BaseComponent, PopupKeyCodeHandlers } from './antd-editor';
import createAntdRenderer from './antd-renderer';

moment.locale('zh-cn');
const defaultDateFormat = 'DD/MM/YYYY';

const colDiff = {
    date: [1, 'days'],
    month: [1, 'months'],
    year: [1, 'years'],
};

const rowDiff = {
    date: [1, 'weeks'],
    month: [3, 'months'],
    year: [3, 'years'],
};


class DateEditor extends BaseComponent {
    static propTypes = {
        minDate: propTypes.string,
        maxDate: propTypes.string,
        dateFormat: propTypes.string,
        dateFilter: propTypes.func,
        mode: propTypes.string,
        getPopupContainer: propTypes.func.isRequired,
        onSelect: propTypes.func,
    }

    static defaultProps = {
        minDate: null,
        maxDate: null,
        dateFormat: defaultDateFormat,
        dateFilter: null,
        onSelect: null,
        mode: 'date',
    }

    constructor(props) {
        super(props);

        this.state = {
            value: null,
            open: false,
        };
    }

    onChange = (value) => {
        this.setState({
            value,
        }, () => {
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(value);
            }
        });
    }

    onPanelChange = (value) => {
        this.setState({
            value,
            open: false,
        }, () => {
            const { onSelect } = this.props;
            if (onSelect) {
                onSelect(value);
            }
        });
    }

    getDisabledDateFunc = memoize((minDate, maxDate, dateFormat, dateFilter) => {
        let minDateMoment = moment(minDate, dateFormat);
        let maxDateMoment = moment(maxDate, dateFormat);
        if (!minDateMoment.isValid()) {
            minDateMoment = null;
        }
        if (!maxDateMoment.isValid()) {
            maxDateMoment = null;
        }
        return (date) => {
            if (minDateMoment && minDateMoment.isAfter(date)) {
                return true;
            }
            if (maxDateMoment && maxDateMoment.isBefore(date)) {
                return true;
            }
            if (dateFilter) {
                return !dateFilter(date);
            }
            return false;
        };
    });

    getValue() {
        const { value } = this.state;
        const { dateFormat } = this.props;
        return (value && value.format(dateFormat)) || null;
    }

    setValue = (value) => {
        const { dateFormat } = this.props;
        const m = moment(value, dateFormat);
        this.setState({
            value: m.isValid() ? m : null,
        });
    }

    getValueOrToday() {
        let { value } = this.state;
        if (!value) {
            value = moment().set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
            });
        } else {
            value = moment(value);
        }
        return value;
    }

    open() {
        this.setState({ open: true });
    }

    close() {
        this.setState({ open: false });
    }

    refreshDatePanelWithValue(value) {
        const { mode } = this.props;
        if (mode === 'year' || mode === 'month') {
            this.setState({
                value,
                tempMode: 'month',
            }, () => {
                this.setState({ tempMode: null });
            });
        } else {
            this.setState({ value });
        }
    }

    selectPrev() {
        const value = this.getValueOrToday();
        const { mode } = this.props;
        value.subtract(...colDiff[mode]);
        const {
            minDate, maxDate, dateFormat, dateFilter,
        } = this.props;
        const targetDisabled = this.getDisabledDateFunc(
            minDate, maxDate, dateFormat, dateFilter,
        )(value);
        if (!targetDisabled) {
            this.refreshDatePanelWithValue(value);
        }
    }

    selectNext() {
        const value = this.getValueOrToday();
        const { mode } = this.props;
        value.add(...colDiff[mode]);
        const { minDate, maxDate, dateFormat } = this.props;
        const targetDisabled = this.getDisabledDateFunc(minDate, maxDate, dateFormat)(value);
        if (!targetDisabled) {
            this.refreshDatePanelWithValue(value);
        }
    }

    selectPrevRow() {
        const value = this.getValueOrToday();
        const { mode } = this.props;
        value.subtract(...rowDiff[mode]);
        const { minDate, maxDate, dateFormat } = this.props;
        const targetDisabled = this.getDisabledDateFunc(minDate, maxDate, dateFormat)(value);
        if (!targetDisabled) {
            this.refreshDatePanelWithValue(value);
        }
    }

    selectNextRow() {
        const value = this.getValueOrToday();
        const { mode } = this.props;
        value.add(...rowDiff[mode]);
        const { minDate, maxDate, dateFormat } = this.props;
        const targetDisabled = this.getDisabledDateFunc(minDate, maxDate, dateFormat)(value);
        if (!targetDisabled) {
            this.refreshDatePanelWithValue(value);
        }
    }

    render() {
        const { value, open, tempMode } = this.state;
        const {
            minDate, maxDate, dateFormat, dateFilter, mode, getPopupContainer,
        } = this.props;
        return (
            <DatePicker
                ref={this.refElement}
                mode={tempMode || mode}
                format={dateFormat}
                locale={locale}
                className="ht-antd-date"
                dropdownClassName="ht-antd-datepicker"
                value={value}
                onChange={this.onChange}
                onPanelChange={this.onPanelChange}
                open={open}
                getCalendarContainer={getPopupContainer}
                disabledDate={this.getDisabledDateFunc(minDate, maxDate, dateFormat, dateFilter)}
            />
        );
    }
}

class AntdDateEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...PopupKeyCodeHandlers,
        [Handsontable.helper.KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.selectPrevRow();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.selectNextRow();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_LEFT]: (editor) => {
            editor.reactComponent.selectPrev();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_RIGHT]: (editor) => {
            editor.reactComponent.selectNext();
            return false;
        },
    }

    onSelect = () => {
        this.finishEditing(false);
    }

    getReactRootElement() {
        const elem = document.createElement('div');
        Handsontable.dom.addClass(elem, 'ht-antd-fill');
        this.element.appendChild(elem);
        return elem;
    }

    dateFilter = (date) => {
        const { dateFilter } = this.cellProperties;
        if (!dateFilter) return true;
        return dateFilter(date, this.row, this.col);
    }

    render() {
        const {
            minDate, maxDate, dateFormat, mode, getPopupContainer,
        } = this.cellProperties;
        return (
            <DateEditor
                minDate={minDate}
                maxDate={maxDate}
                dateFormat={dateFormat}
                dateFilter={this.dateFilter}
                mode={mode}
                getPopupContainer={getPopupContainer || this.getPopupContainer}
                onSelect={this.onSelect}
            />
        );
    }

    open() {
        super.open();
        this.reactComponent.open();
    }

    close() {
        this.reactComponent.close();
        setTimeout(() => super.close(), 300);// delay hide element for close animation
    }
}

function DateRenderer(value, cellProperties) {
    const {
        placeholder,
    } = cellProperties;
    let attrs;
    let label;

    if (value === null || value === undefined || value === '') {
        attrs = 'class="htPlaceholder"';
        label = placeholder || '';
    } else {
        attrs = '';
        label = value;
    }

    return `
        <span ${attrs}>
            ${label}
            <span class="ht-antd-cell-icon">
                <i class="anticon anticon-calendar"></i>
            </span>
        </span>
    `;
}

export default {
    editor: AntdDateEditor,
    renderer: createAntdRenderer(DateRenderer),
    className: 'ht-antd-cell-with-icon',
};

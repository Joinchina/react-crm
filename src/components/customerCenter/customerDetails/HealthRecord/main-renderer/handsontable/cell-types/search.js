import React from 'react';
import propTypes from 'prop-types';
import Select from '@wanhu/antd-legacy/lib/select';
import Spin from '@wanhu/antd-legacy/lib/spin';
import { Icon } from 'antd';
import Button from '@wanhu/antd-legacy/lib/button';
import Handsontable from '../lib';
import './search.less';
import AntdBaseEditor, { BaseComponent, InputKeyCodeHandlers } from './antd-editor';
import createAntdRenderer from './antd-renderer';

const DefaultPageSize = 10;

export class SearchEditor extends BaseComponent {
    static propTypes = {
        getPopupContainer: propTypes.func.isRequired,
        onSelect: propTypes.func,
        search: propTypes.func.isRequired,
        pagination: propTypes.bool.isRequired,
        renderOption: propTypes.func,
    }

    static defaultProps = {
        onSelect: null,
        renderOption: (item) => {
            if (typeof item === 'string') {
                return item;
            }
            if (typeof item === 'object' && item) {
                return item.name;
            }
            return '';
        },
    }

    searchSession = null;

    state = {
        open: false,
        searching: false,
        searchResult: [],
        selectedIndex: 0,
        searchSkip: 0,
        searchHasMore: false,
        searchError: null,
        searchKey: null,
        pageLoading: false,
        pageError: null,
    };

    setValue = () => {}

    getValue = () => ''

    open() {
        this.setState({
            open: true,
            searching: false,
            searchResult: [],
            selectedIndex: 0,
            searchSkip: 0,
            searchHasMore: false,
            searchError: null,
            searchKey: null,
            pageLoading: false,
            pageError: null,
        });
        const select = this.element && this.element.rcSelect;
        if (select) {
            select.setInputValue('', true);
        }
    }

    close() {
        this.setState({ open: false });
    }

    focus() {
        const input = this.element.rcSelect && this.element.rcSelect.getInputDOMNode();
        if (input) {
            input.focus();
        }
    }

    setStatePromise(state) {
        return new Promise(fulfill => this.setState(state, fulfill));
    }

    onSearch = async (key) => {
        const session = `${Math.random()}`;
        this.searchSession = session;
        this.pageSession = null;
        if (!key) {
            await this.setStatePromise({
                searching: false,
                searchResult: [],
                searchError: null,
                searchKey: '',
                searchHasMore: false,
                searchSkip: 0,
                pageLoading: false,
                pageError: null,
            });
            return;
        }
        await this.setStatePromise({
            searching: true,
            searchResult: [],
            searchError: null,
            searchKey: key,
            searchHasMore: false,
            searchSkip: 0,
            pageLoading: false,
            pageError: null,
        });
        await new Promise(fulfill => setTimeout(fulfill, 300)); /* debounce */
        if (this.searchSession !== session) {
            return; /* new session started, cancel current */
        }
        try {
            const { search } = this.props;
            const searchResult = await search(key, 0, DefaultPageSize);
            if (!Array.isArray(searchResult)) {
                throw new Error('search callback must return Array');
            }
            if (this.searchSession !== session) {
                return; /* new session started, cancel current */
            }
            const searchHasMore = searchResult.length === DefaultPageSize;
            this.setState({
                searching: false,
                searchResult,
                searchError: null,
                selectedIndex: 0,
                searchHasMore,
                searchSkip: searchResult.length,
            });
        } catch (e) {
            if (this.searchSession !== session) {
                return; /* new session started, cancel current */
            }
            this.setState({
                searching: false,
                searchResult: [],
                searchError: e.message || '未知错误',
                searchHasMore: false,
            });
        }
    }

    onSubmit = () => {
        const { onSubmit } = this.props;
        const { selectedIndex, searchResult } = this.state;
        if (searchResult[selectedIndex]) {
            this.onSelect(selectedIndex);
        }
        onSubmit();
    }

    onSelect = (item) => {
        const { onSelect, onSubmit } = this.props;
        const { searchResult } = this.state;
        if (onSelect) {
            onSelect(searchResult[item]);
        }
        onSubmit();
    }

    optionScrollIntoView = () => {
        const { selectedIndex } = this.state;
        const select = this.element.rcSelect;
        const dom = select.getPopupDOMNode();
        const scrollPane = dom.querySelector('ul.ant-select-dropdown-menu');
        const childIndex = (Number(selectedIndex) || 0) + 1;
        const elem = dom.querySelector(`li.ant-select-dropdown-menu-item:nth-child(${childIndex})`);
        if (elem) {
            if (scrollPane) {
                const actualTop = elem.offsetTop - scrollPane.scrollTop;
                const actualBottom = scrollPane.clientHeight - actualTop - elem.offsetHeight;
                const moveToTopOffset /* < 0 */ = actualTop < 0 ? actualTop : 0;
                const moveToBottomOffset /* > 0 */ = actualBottom < 33 ? 33 - actualBottom : 0;
                if (moveToTopOffset + moveToBottomOffset !== 0) {
                    scrollPane.scrollTo({
                        top: scrollPane.scrollTop + moveToTopOffset + moveToBottomOffset,
                        left: 0,
                    });
                }
            } else {
                /* fallback */
                elem.scrollIntoViewIfNeeded();
            }
        }
    }

    onPopupScroll = (event) => {
        const dom = event.target;
        if (dom.scrollHeight - dom.scrollTop - dom.clientHeight < 10 /* 10px tolerance */) {
            this.tryLoadNextPage();
        }
    }

    selectNext() {
        const { searchResult, selectedIndex } = this.state;
        if (selectedIndex < searchResult.length - 1) {
            this.setState({ selectedIndex: selectedIndex + 1 }, this.optionScrollIntoView);
        }
    }

    selectPrev() {
        const { selectedIndex } = this.state;
        if (selectedIndex >= 1) {
            this.setState({ selectedIndex: selectedIndex - 1 }, this.optionScrollIntoView);
        }
    }

    async tryLoadNextPage() {
        const {
            searchSkip, searchHasMore, searchKey, searchResult,
        } = this.state;
        if (!searchHasMore) return;
        if (this.pageSession) {
            const { searchSession, skip } = this.pageSession;
            if (searchSession === this.searchSession && skip === searchSkip) {
                /* if same page is loading */
                return;
            }
        }
        const session = {
            searchSession: this.searchSession,
            skip: searchSkip,
        };
        this.pageSession = session;
        await this.setStatePromise({
            pageLoading: true,
            pageError: null,
        });
        try {
            const { search } = this.props;
            const newSearchResult = await search(searchKey, searchSkip, DefaultPageSize);
            if (!Array.isArray(newSearchResult)) {
                throw new Error('search callback must return Array');
            }
            if (this.pageSession !== session) {
                return; /* new session started, cancel current */
            }
            const combinedResult = [...searchResult];
            for (let i = 0; i < newSearchResult.length; i += 1) {
                combinedResult[searchSkip + i] = newSearchResult[i];
            }
            const searchHasMore = newSearchResult.length === DefaultPageSize;
            this.setState({
                pageLoading: false,
                pageError: null,
                searchResult: combinedResult,
                searchSkip: combinedResult.length,
                searchHasMore,
            });
        } catch (e) {
            this.setState({
                pageLoading: false,
                pageError: e.message || '未知错误',
            });
        }
    }

    render() {
        const {
            open, searchResult, selectedIndex,
            searching, searchError, searchKey,
        } = this.state;
        const {
            placeholder, getPopupContainer, renderOption,
            pagination,
        } = this.props;
        const options = searchResult.map((s, index) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <Select.Option key={index} value={index}>
                {renderOption(s)}
            </Select.Option>
        ));
        let notFoundContent;
        if (searchResult.length > 0) {
            /* no notFoundContent */
        } else if (searching) {
            notFoundContent = (
                <div>
                    <Spin className="spin-loading" size="small" />
                    正在搜索
                </div>
            );
        } else if (searchError) {
            notFoundContent = (
                <div className="placeholder-error">
                    <Icon type="close-circle" />
                    {searchError}
                    <Button size="small">
                        重试
                    </Button>
                </div>
            );
        } else if (searchKey) {
            notFoundContent = (
                <div className="placeholder-warning">
                    <Icon type="info-circle" />
                    未找到匹配的项
                </div>
            );
        } else {
            notFoundContent = null;
        }
        if (pagination && searchResult.length > 0) {
            const { pageLoading, pageError, searchHasMore } = this.state;
            if (!searchHasMore) {
                options.push((
                    <Select.Option key="__more" value="__more" disabled>
                        已全部加载
                    </Select.Option>
                ));
            } else if (pageLoading) {
                options.push((
                    <Select.Option key="__more" value="__more" disabled>
                        <Spin className="spin-loading" size="small" />
                        正在加载下一页
                    </Select.Option>
                ));
            } else if (pageError) {
                options.push((
                    <Select.Option key="__more" value="__more" disabled>
                        <div className="placeholder-error">
                            <Icon type="close-circle" />
                            {searchError}
                            <Button size="small">
                                重试
                            </Button>
                        </div>
                    </Select.Option>
                ));
            } else {
                options.push((
                    <Select.Option key="__more" value="__more" disabled>
                        向下滚动加载下一页
                    </Select.Option>
                ));
            }
        }
        return (
            <Select
                ref={this.refElement}
                placeholder={placeholder}
                dropdownClassName="ht-antd-search-dropdown"
                value={searchResult[selectedIndex] ? selectedIndex : null}
                open={open}
                getPopupContainer={getPopupContainer}
                dropdownMatchSelectWidth={false}
                allowClear={false}
                showSearch
                onSearch={this.onSearch}
                onSelect={this.onSelect}
                filterOption={false}
                notFoundContent={notFoundContent}
                onPopupScroll={pagination ? this.onPopupScroll : undefined}
                defaultActiveFirstOption={false}
            >
                { options }
            </Select>
        );
    }
}

const { KEY_CODES } = Handsontable.helper;

class AntdSelectEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...InputKeyCodeHandlers,
        [KEY_CODES.ENTER]: (editor) => {
            editor.reactComponent.onSubmit();
            return false;
        },
        [KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.selectPrev();
            return false;
        },
        [KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.selectNext();
            return false;
        },
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
            placeholder, getPopupContainer, search, renderOption, pagination, onSelect,
        } = this.cellProperties;
        return (
            <SearchEditor
                placeholder={placeholder}
                getPopupContainer={getPopupContainer || this.getPopupContainer}
                onSubmit={this.onSubmit}
                search={search}
                onSelect={onSelect}
                renderOption={renderOption}
                pagination={Boolean(pagination)}
            />
        );
    }
}

function SearchRenderer(value, cellProperties) {
    const { placeholder } = cellProperties;
    return `
        <span class="htPlaceholder">
            ${placeholder}
            <span class="ht-antd-cell-icon">
                <i class="anticon anticon-search"></i>
            </span>
        </span>
    `;
}

export default {
    editor: AntdSelectEditor,
    renderer: createAntdRenderer(SearchRenderer),
    className: 'ht-antd-cell-with-icon',
};

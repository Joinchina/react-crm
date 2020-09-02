import React, { Component } from 'react'
import { Table} from 'antd'
import { Form, fieldBuilder } from '../form';
import AlertError from '../AlertError';
import ScrollIntoView from '../ScrollIntoView';
import TableWithFooterAndPagination from '../TableWithFooterAndPagination';
import TablePlaceholder from '../TablePlaceholder';
import { connectRouter } from '../../../mixins/router';
import _ from 'underscore';
import propTypes from 'prop-types';
import { createReducer, apiActionCreator } from './reducers';

export { createReducer, apiActionCreator };

function def(fields, formDef) {
    _.keys(fields).forEach(key => {
        if (key === 'p') {
            throw new Error('Cannot use "p" as table query field because it is reserved as "pageIndex"');
        }
        if (key === 'ps') {
            throw new Error('Cannot use "ps" as table query field because it is reserved as "pageSize"');
        }
        if (key === 'q') {
            throw new Error('Cannot use "q" as table query field because it is reserved as "query"');
        }
    });
    return {
        keys: _.keys(fields),
        formDef: Form.def(_.mapObject(fields, () => fields.fieldDef || fieldBuilder()), formDef),
        queryToValues: _.mapObject(fields, def => def.parse ? def.parse.bind(def) : (val => val || undefined)),
        valuesToQuery: _.mapObject(fields, def => def.stringify? def.stringify.bind(def) : (val => val || undefined)),
    };
}

class TablePage extends Component {

    static propTypes = {
        def: propTypes.object.isRequired,
        data: propTypes.object.isRequired,
        onLoadData: propTypes.func.isRequired,
        renderFormFields: propTypes.func.isRequired,
        renderFooter: propTypes.func
    }

    constructor(props) {
        super(props);
        this.keys = props.def.keys;
        this.formDef = props.def.formDef;
        this.queryToValues = props.def.queryToValues;
        this.valuesToQuery = props.def.valuesToQuery;
        this.state = {
            formData: _.mapObject(this.mapQueryToValues(props.router.query, true), val => ({ value: val }))
        };
        if (props.tableRef) {
            props.tableRef(this.tableRef);
        }
    }

    get tableRef(){
        if (!this._tableRef) {
            this._tableRef = {
                reload: this.reload,
                scrollToTop: this.scrollToTop,
            };
        }
        return this._tableRef;
    }

    componentWillMount(){
        this.search(this.props);
    }

    componentWillReceiveProps(props) {
        if (process.env.NODE_ENV === 'development') {
            if (props.def !== this.props.def) {
                throw new Error('"def" property of TablePage cannot change after create');
            }
        }
        if (props.tableRef) {
            props.tableRef(this.tableRef);
        }
        const oldQuery = _.pick(this.props.router.query, 'p', 'ps', 'q', ...this.keys);
        const newQuery = _.pick(props.router.query, 'p', 'ps', 'q', ...this.keys);
        if (!_.isEqual(oldQuery, newQuery)) {
            const diff = {};
            _.each(oldQuery, (value, key) => {
                if (newQuery[key] !== value) {
                    diff[key] = newQuery[key];
                }
            });
            _.each(newQuery, (value, key) => {
                if (oldQuery[key] !== value) {
                    diff[key] = value;
                }
            });
            this.setFieldsValue(this.mapQueryToValues(diff));
            this.search(props);
        }
    }

    mapQueryToValues(q, allValues) {
        if (!allValues) {
            return _.mapObject(
                _.pick(q, (val, key) => this.queryToValues[key]),
                (val, key) => this.queryToValues[key](val)
            );
        } else {
            return _.mapObject(
                this.queryToValues,
                (func, key) => func(q[key]),
            );
        }
    }

    mapValuesToQuery(values) {
        return _.mapObject(
            values,
            (val, key) => {
                const r = this.valuesToQuery[key](val);
                if (r === undefined || r === null) {
                    return null;
                }
                return r;
            }
        );
    }

    query = () => {
        const query = this.mapValuesToQuery(this.getFieldsValue());
        const autoLoad = this.props.autoLoad === undefined ? true : this.props.autoLoad;
        if (!autoLoad) {
            query.q = "1";
        }
        const oldQuery = this.props.router.query;
        if (_.some(query, (value, key) => (value !== null && oldQuery[key] !== value) || (value === null && oldQuery[key]) )){
            this.props.router.setQuery({
                    ...query,
                    p: null,
                },
                { replace: true });
        } else {
            this.reload();
        }
    }

    reload = (opts) => {
        console.log('reload',opts);
        this.search(null, opts);
    }

    search(props, { scrollToTop } = {}) {
        if (!props) props = this.props;
        const q = props.router.query;
        const autoLoad = props.autoLoad === undefined ? true : props.autoLoad;
        if (!autoLoad && !q.q) {
            if (props.data.list) {
                props.onResetData();
            }
            return;
        }
        const values = this.mapQueryToValues(q, true);
        this.props.onLoadData({
            values: values,
            pageIndex: Number(q.p) || 1,
            pageSize: Number(q.ps) || 10,
        });
        if (!this.props.disableAutoScroll && this.scrollToTop && (scrollToTop || scrollToTop === undefined)) {
            this.scrollToTop();
        }
    }

    updatePagination = pagination => {
        const pageSize = pagination.pageSize;
        const pageIndex = pagination.current;
        this.props.router.setQuery({
            p: pageIndex === 1 ? null : pageIndex,
            ps: pageSize === 10 ? null : pageSize,
        }, { replace: true });
    }

    onFieldsChange = (fields) => {
        this.setState(state => ({
            formData: {
                ...state.formData,
                ...fields,
            },
        }));
    }

    getFieldValue(name) {
        return this.state.formData[name] && this.state.formData[name].value;
    }

    getFieldsValue(){
        return _.mapObject(this.state.formData, field => field && field.value);
    }

    setFieldsValue = (values) => {
        this.setState(state => ({
            formData: {
                ...state.formData,
                ..._.mapObject(values, val => ({ value: val })),
            }
        }));
    }

    getErrorTip = payload => {
      let errorTip
      if(payload && payload.status == '403'){
        errorTip = '权限不足，请联系管理员'
      }else{
        errorTip = null
      }
      return errorTip
    }

    render() {
        const { def, data, onLoadData, onResetData, renderFormFields, renderFooter, tip, showSizeChanger = true, ...props} = this.props;
        props.children = this.DecorateTableColumns(this.props.children);
        const values = this.getFieldsValue();
        const setValues = this.setFieldsValue;
        const loadData = this.query;
        const TableComponent = renderFooter ? TableWithFooterAndPagination : Table;
        const autoLoad = props.autoLoad === undefined ? true : props.autoLoad;
        const noQuery = !autoLoad && !this.props.router.query.q;
        const errorTip = this.getErrorTip(data.rejected);
        const dataList = data.status === 'fulfilled' ? data.list : [];
        return (
            <div>
                <ScrollIntoView offset={72} refScrollIntoView={func => this.scrollToTop = func}/>
                <AlertError status={data.status} payload={data.rejected} />
                <Form
                    def={this.formDef}
                    data={this.state.formData}
                    onFieldsChange={this.onFieldsChange}
                    >
                    {renderFormFields(values, loadData, setValues)}
                </Form>
                <div className='table-box block'>
                    <TableComponent
                        loading={data.status === 'pending' ? {delay: 200} : false}
                        dataSource={dataList}
                        onChange={this.updatePagination}
                        pagination={{
                            showSizeChanger,
                            total: data.pageIndex !== 1 && data.count === data.pageSize ? data.count + 1 : data.count,
                            showTotal: () => `第 ${data.pageIndex} 页`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            current: data.pageIndex,
                            pageSize: data.pageSize,
                        }}
                        footer={ renderFooter ? () => renderFooter(values) : (tip ? () => tip: null) }
                        locale={ {emptyText: <TablePlaceholder noQuery={noQuery} status={data.status} errorTip={errorTip} onReload={this.reload}/> }}
                        {...props}
                    />
                </div>
            </div>
        )
    }

    DecorateTableColumns(children){
        if (Array.isArray(children)) {
            return children.filter(a => a).map(DecorateTableColumn);
        } else if (children) {
            return DecorateTableColumn(children);
        } else {
            return children;
        }
    }
}

export function DecorateTableColumn(colElement) {
    const { render, renderTip } = colElement.props;
    const newRender = (text, record, index) => {
        const rendered = render ? render(text, record, index) : text;
        let tipProps;
        if (renderTip) {
            tipProps = { title: renderTip(text, record, index) };
        } else if (typeof rendered !== 'function' && typeof rendered !== 'object') {
            //tipProps = { title: (rendered === null || rendered === undefined) ? '' : `${rendered}`};
            tipProps = {
                ref: td => {
                    if(td) {
                        const title = td.innerText;
                        const text = document.createTextNode(title);
                        const span = document.createElement("span");
                        span.setAttribute('title', title);
                        span.appendChild(text);
                        const nodes = td.childNodes;
                        for(let i = 0; i < nodes.length; i++) {
                            if(nodes[i].nodeType === 3) {
                                td.replaceChild(span, nodes[i])
                            }
                        }
                    }
                }
            }
        } else {
            tipProps = {
                ref: td => {
                    if (td) {
                        const childNodes = td.childNodes
                        const title = td.innerText;
                        const span = document.createElement("span");
                        for(let i = 0; i < childNodes.length ; i++) {
                            span.appendChild(childNodes[i]);
                        }
                        td.appendChild(span);
                        span.setAttribute('title', title);
                    }
                    //WARN: setAttribute directly may be anti pattern, but
                    //      there is no better way to get rendered innerText of an element
                }
            };
        }
        if (rendered === null || (typeof rendered !== 'function' && typeof rendered !== 'object') || React.isValidElement(rendered)) {
            return {
                children: rendered,
                props: tipProps,
            };
        } else if (typeof rendered === 'object') {
            return {
                ...rendered,
                props: rendered.props ? {
                    ...tipProps,
                    ...rendered.props,
                } : tipProps
            };
        } else {
            return rendered;
        }
    }
    return React.cloneElement(colElement, { render: newRender });
}

const ConnectedTablePage = connectRouter(TablePage);
ConnectedTablePage.Column = Table.Column;
ConnectedTablePage.def = def;
export default ConnectedTablePage;
export { ConnectedTablePage as TablePage };

import React from 'react';
import { Table, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import blacklist from 'blacklist';
import './index.scss';

export default function TableWithFooterAndPagination(oprops) {
    const props = blacklist(oprops, 'footer', 'footerHeight');
    props.className = props.className ? `wh-table-footer-pagination ${props.className}` : 'wh-table-footer-pagination';
    if (props.dataSource && props.dataSource.length) {
        const renderFooter = oprops.footer;
        const opag = props.pagination;
        const style = oprops.footerHeight ? {
            marginTop: (29 - oprops.footerHeight) / 2,
            height: oprops.footerHeight,
        } : undefined;
        props.pagination = {
            ...opag,
            showTotal: () => <span>
                <div className="wh-table-footer-pagination-footer" style={style}>
                    { renderFooter() }
                </div>
                { opag.showTotal ? opag.showTotal() : null }
            </span>
        };
        if (props.customFooter) {
            props.footer = props.customFooter;
        }
        return <Table {...props}/>;
    } else {
        const style = oprops.footerHeight ? {
            marginTop: (29 - oprops.footerHeight) / 2,
            height: oprops.footerHeight,
        } : undefined;
        const styleOuter = oprops.footerHeight ? {
            height: 29 + (oprops.footerHeight - 29) / 2,
            paddingTop: (oprops.footerHeight - 29) / 2,
            marginTop: (29 - oprops.footerHeight) / 2,
        } : undefined;
        const renderFooter = oprops.footer;
        props.footer = style ? () => <div style={styleOuter}><div style={style}>{ renderFooter() }</div></div> : renderFooter;
        return <Table {...props}/>;
    }    
}

TableWithFooterAndPagination.propTypes = {
    footer: PropTypes.func.isRequired,
    pagination: PropTypes.object.isRequired,
    footerHeight: PropTypes.number,
};

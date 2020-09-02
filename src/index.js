import moment from 'moment';
import 'moment/locale/zh-cn';

import React from 'react';
import ReactDOM from 'react-dom';

import './tracker';
import './baidu-statistics';

import Root from './components/Root';

moment.locale('zh-cn');

ReactDOM.render(
    <Root />,
    document.getElementById('root'),
);

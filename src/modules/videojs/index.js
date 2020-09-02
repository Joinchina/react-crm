import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import zhCN from './zhCN.json';

window.videojs = videojs; /* fix videojs-resolution-switcher module require bug */

require('./resolution-switcher');

videojs.addLanguage('zh-CN', zhCN);

export default videojs;

import $ from 'jquery';
import ajax from '../../lib/ajax';
import { isArray } from '../../util/baseUtil';
// 初始化登录状态

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // eslint-disable-next-line
  const Vconsole = require('vconsole');
  // eslint-disable-next-line
  new Vconsole();
}

let logFlag = false;
let user = {};
const initUser = () => {
  $('.page-header').find('.user a').attr('href', '/user/center.html');
  // todo 头像
  if (user.image_url) {
    const $portrait = `<img src= ${user.image_url}>`;
    $('.page-header .user a span').remove();
    $('.page-header .user a').prepend($portrait);
  }
};
ajax.GET_USER_INFO({
  success: (res) => {
    if (!isArray(res.data)) {
      logFlag = true;
      user = res.data;
      initUser();
    }
  },
});
const isLogin = logFlag;
const userInfo = user;
const outers = $('.outer');
for (let i = 0; i < outers.length; i += 1) {
  $(outers[i]).attr('href', $(outers[i]).data('href'));
}
export {
  isLogin,
  userInfo,
  // init,
};

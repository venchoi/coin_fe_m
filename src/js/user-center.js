import $ from 'jquery';
import '../sass/views/user-center.scss';
import ajax from '../lib/ajax';

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
    if (res.data.uuid) {
      const userInfo = res.data;
      user = res.data;
      initUser();
      $('.nickname').html(userInfo.nickname);
      $('.id').html(userInfo.uuid);
      if (userInfo.image_url) {
        $('.portrait').empty().append(`<img src="${userInfo.image_url}">`);
      }
    }
  },
});
$('.log-out').on('click', () => {
  ajax.LOGOUT({
    success: (res) => {
      if (res.error_code === '0') {
        window.location.replace('/index.html');
      }
    },
  });
});


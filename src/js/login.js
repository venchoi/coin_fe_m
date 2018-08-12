import $ from 'jquery';
import mustache from 'mustache';
import '../sass/views/login.scss';
import hexMd5 from '../vendor/md5';
import tab from '../component/tab';
import ajax from '../lib/ajax';
import hintTemplete from '../template/layer/hint.html';
import hint from '../component/layer/hint';
import {
  countDown,
  verifyPhone,
  verifyPassWord,
  // cofirmPassWord,
  verifyCheckCode,
  autoVerify,
} from '../component/form/form-validate';
import './common';

tab('.login-page');
const hintTpl = mustache.render(hintTemplete);
$('body').append(hintTpl);
// 获取短信验证码 —— 短信登录、找回密码、注册
const verificationOptions = {
  area_code: '+86',
  phone: '',
  verify_code: '', // 图片验证码
  type: '', // log find reg
};
autoVerify();
$('.phone-verification').on('click', () => {
  $('.use-password').addClass('hidden').siblings('.use-verification').removeClass('hidden');
});
$('.phone-password').on('click', () => {
  $('.use-verification').addClass('hidden').siblings('.use-password').removeClass('hidden');
});
$('.request-button').on('click', function () {
  const $this = $(this);
  const $phoneDom = $this.parent().siblings('.phone').find('.phone-number');
  const $checkCodeDom = $this.parent().siblings('.check-code').find('input');
  verificationOptions.type = $this.data('msg-type');
  verificationOptions.verify_code = $this.parent().siblings('.check-code').find('input').val();
  if (verifyPhone($phoneDom) && verifyCheckCode($checkCodeDom) && !$this.hasClass('disabled')) {
    verificationOptions.phone = $phoneDom.val();
    ajax.GET_SMS_CODE({
      param: verificationOptions,
      success: (res) => {
        if (res.error_code === '0') {
          countDown($this);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
const logOptions = {
  area_code: '+86',
  account: '',
  password: '',
  type: '', // 1密码登录2短信登录
};
const registerOptions = {
  area_code: '+86',
  phone: '',
  sms_code: '',
  password: '',
};
// 登录——密码登录/短信验证码登录
$('.log-modal .sign-in').on('click', () => {
  const $logWayDom = $('.log-modal [data-tab-1]').children('div:not(.hidden):not(.button)');
  const logType = $logWayDom.data('type');
  const $accountDom = $logWayDom.find('.phone .phone-number');
  let $passwordDom;
  let flag = false;
  if (logType === 'password') {
    logOptions.type = 1;
    $passwordDom = $logWayDom.find('.password input');
    flag = verifyPassWord($passwordDom);
    logOptions.password = hexMd5($passwordDom.val());
  } else if (logType === 'verification') {
    logOptions.type = 2;
    $passwordDom = $logWayDom.find('.verification input');
    flag = true;
    logOptions.password = $passwordDom.val();
  }
  if (verifyPhone($accountDom) && flag) {
    logOptions.account = $accountDom.val();
    ajax.LOGIN({
      param: logOptions,
      success: (res) => {
        if (res.error_code === '0') {
          $('.login').addClass('hidden');
          hint('success', 'green', res.msg, 1500);
          setTimeout(() => {
            window.history.back(-1);
          }, 1500);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
// 注册
$('.log-modal .sign-up').on('click', () => {
  const $signUpDom = $('.content-item[data-tab-2]');
  const $phoneDom = $signUpDom.find('.phone .phone-number');
  const $verificationDom = $signUpDom.find('.verification input');
  const $passwordDom = $signUpDom.find('.create-password input');
  if (verifyPhone($phoneDom) && verifyPassWord($passwordDom)) {
    registerOptions.phone = $phoneDom.val();
    registerOptions.sms_code = $verificationDom.val();
    registerOptions.password = hexMd5($passwordDom.val());
    ajax.REGISTER({
      param: registerOptions,
      success: (res) => {
        if (res.error_code === '0') {
          $('.login').addClass('hidden');
          hint('success', 'green', res.msg, 1500);
          setTimeout(() => {
            window.history.back('-1');
          }, 1500);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});

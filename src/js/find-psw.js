import $ from 'jquery';
import mustache from 'mustache';
import '../sass/views/find-psw.scss';
import hexMd5 from '../vendor/md5';
import ajax from '../lib/ajax';
import hintTemplete from '../template/layer/hint.html';
import hint from '../component/layer/hint';
import {
  countDown,
  verifyPhone,
  cofirmPassWord,
  verifyCheckCode,
  autoVerify,
} from '../component/form/form-validate';
import './common';

let phone;
let smsCode;
const hintTpl = mustache.render(hintTemplete);
$('body').append(hintTpl);
const smsOptions = {
  area_code: '+86',
  phone: '',
  sms_code: '',
  type: '', // log find reg
};
// 获取短信验证码 —— 短信登录、找回密码、注册
const verificationOptions = {
  area_code: '+86',
  phone: '',
  verify_code: '', // 图片验证码
  type: '', // log find reg
};
autoVerify();
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
$('.next').on('click', () => {
  const $phone = $('[data-tab-1]').find('.phone .phone-number');
  const $verification = $('[data-tab-1]').find('.verification-code');
  if (verifyPhone($phone)) {
    smsOptions.phone = $phone.val();
    smsOptions.sms_code = $verification.val();
    smsOptions.type = 'find';
    ajax.CHECK_SMS_CODE({
      param: smsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          phone = $phone.val();
          smsCode = $verification.val();
          $('[data-tab-1]').removeClass('active').siblings('[data-tab-2]').addClass('active');
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
const resetOption = {
  area_code: '+86',
  phone: '',
  sms_code: '',
  password: '',
  repassword: '',
};
// 重设密码
$('.finish').on('click', () => {
  const $signUpDom = $('.content-item[data-tab-2]');
  const $srcPswDom = $signUpDom.find('.enter-password input');
  const $checkPswDom = $signUpDom.find('.check-password input');
  if (cofirmPassWord($srcPswDom, $checkPswDom)) {
    resetOption.phone = phone;
    resetOption.sms_code = smsCode;
    resetOption.password = hexMd5($srcPswDom.val());
    resetOption.repassword = hexMd5($checkPswDom.val());
    ajax.RESET_PASSWORD({
      param: resetOption,
      success: (res) => {
        if (res.error_code === '0') {
          $('.login').addClass('hidden');
          hint('success', 'green', res.msg, 1500);
          setTimeout(() => {
            window.location.replace('/login.html');
          }, 1500);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});

import $ from 'jquery';
import mustache from 'mustache';
import coinTpl from '../../template/card/coin-card.html';

const coinSubject = mustache.render(coinTpl);

const renderCoinSubject = (coin) => {
  const $coinSubject = $(coinSubject);
  const ratioClass = parseFloat(coin.ratio) > 0 ? 'good' : 'bad';
  // const collect = coin.is_collect ? '已关注' : '关注';
  // const collectClass = coin.is_collect ? 'active' : '';
  let $img;
  if (coin.small_logo_url) {
    $img = `<img src="${coin.small_logo_url}" alt="" class="logo">`;
  } else if (coin.big_logo_url) {
    $img = `<img src="${coin.big_logo_url}" alt="" class="logo">`;
  } else {
    $img = '<span><i class="iconfont icon-coin-logo logo"></i></span>';
  }
  const coinCode = coin.code.toLowerCase();
  const href = `/coin/code_${coinCode}.html`;
  const $button = $coinSubject.find('.action .button');
  $coinSubject.attr('data-code', coinCode);
  $coinSubject.find('.logo').html($img);
  $coinSubject.attr('data-source-id', coin.coin_id);
  $coinSubject.find('a').attr('href', href);
  $coinSubject.find('.name').html(`${coin.en_short_name} ${coin.ch_name}`);
  $coinSubject.find('.price').html(coin.price);
  $coinSubject.find('.ratio').addClass(ratioClass).html(coin.ratio);
  $coinSubject.find('.data-source').html(`数据来源于${coin.source_name}`);
  // $coinSubject.find('.action .button').addClass(collectClass).html(collect).attr('data-type', );
  if (coin.is_collect) {
    $button.addClass('active').attr('data-type', '0');
  }
  return $coinSubject;
};
export default renderCoinSubject;

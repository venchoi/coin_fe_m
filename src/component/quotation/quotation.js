import $ from 'jquery';
import ajax from '../../lib/ajax';
import coinButtonClick from '../../component/action/coinButtonClick';
import renderCoinSubject from '../../component/card/search-coin-card';
import { each, merge } from '../../util/baseUtil';
import updateCoins from '../../js/common/updateCoin';

let isLogin = false;
ajax.GET_USER_INFO({
  success: (res) => {
    if (res.data.uuid) {
      isLogin = true;
    }
  },
});
// ==================== 行情
let hasData = true;
const coinInterestOptions = {
  type: 'coin',
  favorite_types: ['collect'],
  source_ids: [],
};
const requestCoinList = (param) => {
  $('.coins-container').siblings('.loading-page').removeClass('hidden');
  $('.coins-container').siblings('.more').addClass('hidden');
  ajax.GET_QUOTATIONS_LIST({
    param,
    success: (res) => {
      let $coinList = $('.coins-container .panel');
      if (!$coinList.length) {
        $coinList = $('<div class="panel"></div>');
        $('.coins-container').append($coinList);
      }
      if (res.data && res.data.dataList && res.data.dataList.length > 0) {
        coinInterestOptions.source_ids = res.data.coinIds;
        ajax.GET_USER_FAVORITE({
          param: coinInterestOptions,
          success: (response) => {
            each(res.data.dataList, (coin) => {
              each(response.data, (value) => {
                if (coin.coin_id === value.coin_id) {
                  merge(coin, value, true);
                }
              });
            });
            each(res.data.dataList, (coin) => {
              const $coin = renderCoinSubject(coin);
              $coinList.append($coin);
            });
            $('.coins-container').siblings('.loading-page').addClass('hidden');
            $('.coins-container').siblings('.more').removeClass('hidden');
            coinButtonClick(isLogin);
          },
        });
        updateCoins();
      } else {
        $('.coins-container').siblings('.loading-page').addClass('hidden');
        $('.coins-container').siblings('.more').removeClass('hidden');
        hasData = false;
        const $more = $('.coins-container').siblings('.more');
        if ($more.length > 0) {
          $more.find('.button').addClass('disabled').html('已无更多');
        }
      }
    },
  });
  return hasData;
};
export default requestCoinList;

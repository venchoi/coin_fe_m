import $ from 'jquery';
import '../sass/views/user-concern.scss';
import ajax from '../lib/ajax';
import { each, merge } from '../util/baseUtil';
import coinButtonClick from '../component/action/coinButtonClick';
import renderCoinSubject from '../component/card/search-coin-card';
import './common';
import updateCoins from './common/updateCoin';

let isInit = true;
let isLogin = false;
ajax.GET_USER_INFO({
  success: (res) => {
    if (res.data.uuid) {
      isLogin = true;
    }
  },
});
// todo add more button
const coinOptions = {
  type: 'coin',
  min_time: '',
};
const coinInterestOptions = {
  type: 'coin',
  favorite_types: ['collect'],
  source_ids: [],
};
const quotationRequest = () => {
  ajax.GET_USER_COLLECT({
    param: coinOptions,
    success: (res) => {
      const $coinList = $('<div class="panel"></div>');
      if (res.data.dataList && res.data.dataList.length > 0) {
        if (isInit) {
          isInit = false;
        }
        coinOptions.min_time = res.data.min_time;
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
            $('.coins-container').append($coinList);
            coinButtonClick(isLogin);
            updateCoins();
          },
        });
      } else if (isInit) {
        isInit = false;
        $('.user-concern-page .collect-none').removeClass('hidden');
      } else {
        const $more = $('.coins-container').siblings('.more');
        $more.find('.button').addClass('disabled').html('已无更多');
      }
    },
  });
};
quotationRequest();
$('.coins-container').siblings('.more').on('click', () => {
  quotationRequest();
});
setTimeout(() => {
  updateCoins();
}, 30000);

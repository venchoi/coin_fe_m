import $ from 'jquery';
import { each } from '../../util/baseUtil';
import ajax from '../../lib/ajax';

const updateCoinsOptions = {
  type: '1',
  code: [],
};
const updateCoins = () => {
  const $coins = $('.market-realtime');
  const codes = new Set();
  const coinsLenght = $coins.length;
  for (let i = 0; i < coinsLenght; i += 1) {
    const code = $($coins[i]).data('code');
    codes.add(code);
  }
  updateCoinsOptions.code = Array.from(codes);
  if (codes.size) {
    ajax.GET_REALTIME_QUOTATIONS({
      param: updateCoinsOptions,
      success: (res) => {
        const coinsData = res;
        if (coinsData.error_code === '0' && coinsData.data && coinsData.data.length > 0) {
          each(coinsData.data, (coinData) => {
            const $targetDom = $(`[data-code=${coinData.code}]`);
            const targetDomLength = $targetDom.length;
            for (let i = 0; i < targetDomLength; i += 1) {
              const $ratioDom = $($targetDom[i]).find('.ratio');
              const $priceDom = $($targetDom[i]).find('.price');
              if (parseFloat(coinData.ratio) > 0) {
                $ratioDom.addClass('good');
              } else if (parseFloat(coinData.ratio) < 0) {
                $ratioDom.addClass('bad').removeClass('good');
              } else {
                $ratioDom.removeClass('bad').removeClass('good');
              }
              $ratioDom.html(coinData.ratio);
              if ($priceDom.length) {
                $priceDom.html(coinData.price);
              }
            }
          });
        }
      },
    });
  }
};
export default updateCoins;

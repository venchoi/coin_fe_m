import $ from 'jquery';
import mustache from 'mustache';
import '../sass/views/search.scss';
import updateCoins from './common/updateCoin';
import tab from '../component/tab';
import ajax from '../lib/ajax';
import renderNews from '../component/card/news';
import renderDeepNews from '../component/card/deep-news-card';
import renderCoinSubject from '../component/card/search-coin-card';
import { each, merge } from '../util/baseUtil';
import { bindClick, imgZoom } from '../component/action/newsButtonClick';
import coinButtonClick from '../component/action/coinButtonClick';
import searchItemTpl from '../template/card/searchItem.html';
import './common';

tab('.search-page');
let keyword = $('.search-page').data('keyword');
let hasData = true;
let isInit = true;
let page = 1;
let isLogin = false;
ajax.GET_USER_INFO({
  success: (res) => {
    if (res.data.uuid) {
      isLogin = true;
    }
  },
});
const searchOptions = {
  keyword: '',
};
$('.search-button').on('click', () => {
  const val = $('.search-input').val();
  $('#keyword').val(val);
  $('#search-form').submit();
});
$('.search-input').on('keydown', function (e) {
  setTimeout(() => {
    const $this = $(this);
    const val = $this.val();
    searchOptions.keyword = val;
    if (e.keyCode === 13) {
      $('#keyword').val(val);
      $('#search-form').submit();
    }
    ajax.SEARCH_KEYWORD({
      param: searchOptions,
      success: (res) => {
        if (res.data.length > 0) {
          const $keywordList = mustache.render(searchItemTpl, { keywordList: res.data });
          $('.search .search-list').html($keywordList).removeClass('hidden');
          $('.search-list .keyword-item').on('click', function () {
            const $thisDom = $(this);
            keyword = $thisDom.data('keyword').split(' ')[0].toLowerCase();
            window.open(`/coin/code_${keyword}.html`);
          });
        } else {
          $('.search .search-list').empty().removeClass('hidden');
        }
      },
    });
  }, 300);
});
$('.search-input').on('blur', () => {
  setTimeout(() => {
    $('.search .search-list').addClass('hidden');
  }, 500);
});
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: [],
};
const coinInterestOptions = {
  type: 'coin',
  favorite_types: ['collect'],
  source_ids: [],
};
const searchNewsOptions = {
  keyword,
  page,
};
const panelTemplete = '<div class="panel"><time><div class="date"></div><div class="details"></div></time></div>';
const requestSearch = () => {
  if (hasData) {
    $('.press-container .loading-page').removeClass('hidden');
    $('.press-container > .more').addClass('hidden');
    searchNewsOptions.keyword = keyword;
    ajax.SEARCH({
      param: searchNewsOptions,
      success: (res) => {
        const resData = res;
        if (resData.data.dataList) {
          page += 1;
          searchNewsOptions.page = page;
          userNewsListOptions.source_ids = resData.data.newsIds;
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              each(resData.data.dataList, (list) => {
                each(list.news_list, (news) => {
                  each(response.data, (value) => {
                    if (news.news_id === value.news_id) {
                      merge(news, value, true);
                    }
                  });
                });
              });
            },
          });
          // todo 判断当前日期是否已存在
          each(resData.data.dataList, (list) => {
            const date = list.date;
            let $panel = $(`.panel[data-date="${date}"]`);
            if ($panel.length <= 0) {
              $panel = $(panelTemplete);
              $panel.attr('data-date', date);
              $('.press-container > .loading-page').before($panel);
            }
            $panel.find('time > .date').html(list.lang_date);
            $panel.find('time > .details').html(list.date_week);
            each((list.news_list), (news) => {
              let $news;
              if (news.catalog_id === '200') {
                $news = renderDeepNews(news);
              } else {
                $news = renderNews(news);
              }
              $panel.append($news);
            });
          });
          $('.press-container .loading-page').addClass('hidden');
          $('.press-container > .more').removeClass('hidden');
          bindClick(isLogin);
          imgZoom($('.my-gallery img'), '.my-gallery');
        } else if (!isInit) {
          hasData = !hasData;
          $('.press-container .loading-page').addClass('hidden');
          $('.press-container > .more').removeClass('hidden');
          $('.press-container > .more .button').addClass('disabled').html('已无更多');
        } else if (isInit) {
          $('.press-container .loading-page').remove();
          $('.press-container .more').remove();
          $('.press-container').append(`<div class="no-single-result"><div class="text">没有找到关于“${keyword}”的相关快讯</div></div>`);
        }
        if (resData.data.coins && resData.data.coins.length > 0) {
          const $coinList = $('<div class="panel"></div>');
          coinInterestOptions.source_ids = resData.data.coinIds;
          ajax.GET_USER_FAVORITE({
            param: coinInterestOptions,
            success: (response) => {
              each(resData.data.coins, (coin) => {
                each(response.data, (value) => {
                  if (coin.coin_id === value.coin_id) {
                    merge(coin, value, true);
                  }
                });
              });
              each(resData.data.coins, (coin) => {
                const $coin = renderCoinSubject(coin);
                $coinList.append($coin);
              });
              $('.coins-container').html($coinList);
              coinButtonClick(isLogin);
            },
          });
        }
        // $('.coins-container > .more .button').addClass('disabled').html('已无更多');
        if (resData.data.coins.length === 0 && resData.data.dataList.length === 0) {
          $('.coins-container .loading-page').addClass('hidden');
          $('.result-press').addClass('hidden').siblings('.no-result').removeClass('hidden');
        }
        isInit = false;
      },
    });
  }
};
if (keyword) {
  requestSearch();
}
$('.press-container .more').on('click', () => {
  requestSearch();
});
updateCoins();
setInterval(() => {
  updateCoins();
}, 30000);

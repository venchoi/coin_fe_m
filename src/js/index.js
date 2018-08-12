import $ from 'jquery';
import '../sass/views/index.scss';
import ajax from '../lib/ajax';
import { each, merge } from '../util/baseUtil';
import updateCoins from './common/updateCoin';
import { bindClick, imgZoom, adjustImg, adjustDeepImg } from '../component/action/newsButtonClick';
import renderNews from '../component/card/news';
import renderDeepNews from '../component/card/deep-news-card';
import requestCoinList from '../component/quotation/quotation';
import './common';

// 变量pressIds 来自模板
let hasData = true;
const tab = $('.press-page').data('tab');
const pressMinId = $('.press-container').data('min-id');
let pressMaxTime = $('.press-container').data('max-time');
let isLogin = false;
ajax.GET_USER_INFO({
  success: (res) => {
    if (res.data.uuid) {
      isLogin = true;
    }
  },
});
// ============ 快讯
// 请求无状态快讯列表
const options = {
  type: 'fast',
  min_id: pressMinId,
};
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: pressIds,
};
const panelTemplete = '<div class="panel"><time><div class="date"></div><div class="details"></div></time></div>';
const request = () => {
  if (hasData) {
    $('.press-container .loading-page').removeClass('hidden');
    $('.press-container > .more').addClass('hidden');
    // 获取无状态新闻列表
    ajax.GET_NEWS_LIST({
      param: options,
      success: (res) => {
        // newData是最终渲染需要的数据
        const newsData = res.data;
        // todo 数据处理
        userNewsListOptions.source_ids = newsData.newsIds;
        if (newsData.dataList && newsData.dataList.length > 0) {
          // 获取列表对应用户状态
          options.min_id = newsData.min_id;
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              each(newsData.dataList, (list) => {
                each(list.news_list, (news) => {
                  each(response.data, (value) => {
                    if (news.news_id === value.news_id) {
                      merge(news, value, true);
                    }
                  });
                });
              });
              // todo 判断当前日期是否已存在
              each(newsData.dataList, (list) => {
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
            },
          });
        } else {
          $('.press-container .loading-page').addClass('hidden');
          $('.press-container > .more').removeClass('hidden');
          hasData = !hasData;
          $('.press-container > .more .button').addClass('disabled').html('已无更多');
        }
      },
    });
  }
};
const mergePressInterest = () => {
  ajax.GET_USER_FAVORITE({
    param: userNewsListOptions,
    success: (response) => {
      each(response.data, (news) => {
        const $news = $('.press-container').find(`[data-source-id="${news.news_id}"]`);
        const $buttonContainer = $news.find('.article-container .button-container');
        $buttonContainer.find('.good span').html(news.attitude_up);
        $buttonContainer.find('.bad span').html(news.attitude_down);
        const map = {
          up: '.good',
          down: '.bad',
        };
        const activeButton = map[news.user_attitude];
        if (activeButton) {
          $buttonContainer.find(activeButton).addClass('active').attr('data-type', '0');
        }
        if (news.is_collect) {
          $buttonContainer.find('.collect').addClass('active').attr('data-type', '0');
        }
      });
      bindClick(isLogin);
      imgZoom($('.my-gallery img'), '.my-gallery');
    },
  });
};
// ======================== 请求最新数据
const lastesNewsOptions = {
  type: 'fast',
  max_time: pressMaxTime,
};
const requestLastestNews = () => {
  lastesNewsOptions.max_time = pressMaxTime;
  ajax.GET_LASTEST_NEWS({
    param: lastesNewsOptions,
    success: (res) => {
      const data = res.data;
      if (data.dataList && data.dataList.length > 0) {
        pressMaxTime = data.dataList[0].news_list[0].update_time;
        lastesNewsOptions.max_time = data.dataList[0].news_list[0].update_time;
        userNewsListOptions.source_ids = data.newsIds;
        ajax.GET_USER_FAVORITE({
          param: userNewsListOptions,
          success: (response) => {
            each(data.dataList, (list) => {
              each(list.news_list, (news) => {
                each(response.data, (value) => {
                  if (news.news_id === value.news_id) {
                    merge(news, value, true);
                  }
                });
              });
            });
            const renderDateList = data.dataList.reverse();
            each(renderDateList, (list) => {
              const date = list.date;
              let $panel = $(`.panel[data-date="${date}"]`);
              if ($panel.length <= 0) {
                $panel = $(panelTemplete);
                $panel.attr('data-date', date);
                $('.press-container ').prepend($panel);
              }
              $panel.find('time > .date').html(list.lang_date);
              $panel.find('time > .details').html(list.date_week);
              const renderList = list.news_list.reverse();
              each(renderList, (news) => {
                let $news;
                if (news.catalog_id === '200') {
                  $news = renderDeepNews(news);
                } else {
                  $news = renderNews(news);
                }
                $panel.children('time').after($news);
              });
              // todo different between request more
            });
            bindClick(isLogin);
            imgZoom($('.my-gallery img'), '.my-gallery');
          },
        });
      }
    },
  });
};
const coinParam = {
  page: 1,
};

updateCoins();

let hasCoinsData = true;

setInterval(() => {
  updateCoins();
}, 30000);

if (tab === 'index') {
  mergePressInterest();
  requestLastestNews();
  const $imgGalleryDoms = $('.fast-card').find('.my-gallery');
  if ($imgGalleryDoms.length) {
    adjustImg($imgGalleryDoms);
  }
  const $imgConDoms = $('.deep-card ').find('.img');
  if ($imgConDoms.length) {
    adjustDeepImg($imgConDoms);
  }
  $('.press-container .more').on('click', () => {
    request();
  });
  setInterval(() => {
    requestLastestNews();
  }, 30000);
}
if (tab === 'quotations') {
  requestCoinList(coinParam);
  $('.coins-container').siblings('.more').on('click', () => {
    if (hasCoinsData) {
      coinParam.page += 1;
      hasCoinsData = requestCoinList(coinParam);
    }
  });
}

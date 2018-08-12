import $ from 'jquery';
import '../sass/views/user-collect.scss';
import ajax from '../lib/ajax';
import { each, merge } from '../util/baseUtil';
import renderNews from '../component/card/news';
import renderDeepNews from '../component/card/deep-news-card';
import { bindClick, imgZoom } from '../component/action/newsButtonClick';
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
const options = {
  type: 'news',
  min_time: '',
};
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: [],
};
let hasData = true;
const request = () => {
  if (hasData) {
    // 获取无状态新闻列表
    ajax.GET_USER_COLLECT({
      param: options,
      success: (res) => {
        // newData是最终渲染需要的数据
        const newsData = res.data;
        // todo 数据处理
        userNewsListOptions.source_ids = newsData.newsIds;
        if (newsData.dataList && newsData.dataList.length > 0) {
          if (isInit) {
            isInit = false;
          }
          // 获取列表对应用户状态
          options.min_time = newsData.min_time;
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              each(newsData.dataList, (news) => {
                each(response.data, (value) => {
                  if (news.news_id === value.news_id) {
                    merge(news, value, true);
                  }
                });
              });
              each((newsData.dataList), (news) => {
                let $news;
                if (news.catalog_id === '200') {
                  $news = renderDeepNews(news, 'timeDate');
                } else {
                  $news = renderNews(news, 'timeDate');
                }
                $('.press-container .panel').append($news);
              });
              bindClick(isLogin);
              imgZoom($('.my-gallery img'), '.my-gallery');
            },
          });
        } else if (isInit) {
          isInit = false;
          $('.user-collect-page .collect-none').removeClass('hidden');
        } else {
          hasData = !hasData;
          $('.press-container > .more .button').addClass('disabled').html('已无更多');
        }
      },
    });
  }
};
request();
$('.press-container .more').on('click', () => {
  request();
});
updateCoins();
setTimeout(() => {
  updateCoins();
}, 30000);

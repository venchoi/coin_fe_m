// 首页深度卡片
import $ from 'jquery';
import mustache from 'mustache';
import deepNewsTpl from '../../template/card/deepNewsCard.html';
import coinTagTpl from '../../template/tags/coin-tag.html';
import { each, merge } from '../../util/baseUtil';
import dateUtil from '../../util/dateUtil';
import { adjustDeepImg } from '../../component/action/newsButtonClick';

const $deepNewsTpl = mustache.render(deepNewsTpl);
const renderNewsList = (news, timeDate = 'time') => {
  const $news = $($deepNewsTpl);
  const $buttonContainer = $news.find('.article-container .button-container');
  const time = dateUtil.format((new Date(Number(news.update_time) * 1000)), 'hh:mm');
  const date = dateUtil.format((new Date(Number(news.update_time) * 1000)), 'MM-dd');
  const year = dateUtil.format((new Date(Number(news.update_time) * 1000)), 'yyyy');
  const map = {
    up: '.good',
    down: '.bad',
  };
  const activeButton = map[news.user_attitude];
  let timeDom = '';
  if (timeDate === 'timeDate') {
    if (String((new Date()).getFullYear()) === year) {
      timeDom = `<span>${time}</span><span>${date}</span>`;
    } else {
      timeDom = `<span>${time}</span><span>${date}</span><span>${year}</span>`;
    }
  } else {
    timeDom = `<span>${time}</span>`;
  }
  if (news.recommend_level === '10' || news.recommend_level === 10) {
    $news.addClass('picked');
  }
  $news.attr('data-source-id', news.news_id);
  $news.find('time').html(timeDom);
  $news.find('.article-container h2').html(news.title);
  $buttonContainer.find('.good span').html(news.attitude_up);
  $buttonContainer.find('.bad span').html(news.attitude_down);
  $news.find('.article-container a').attr('href', `/news/id_${news.news_uuid}.html`);
  if (news.thumb_url !== '' && typeof news.thumb_url !== 'undefined') {
    const $img = (news.thumb_url === '' || typeof news.thumb_url === 'undefined') ? '' : `<div class="img"><img src='${news.thumb_url}' alt='${news.title}'></div>`;
    $news.find('.article-container .main-content').after($img);
    if ($news.find('.article-container .img').length) {
      const $imgDom = $news.find('.article-container img');
      $imgDom[0].onload = () => {
        adjustDeepImg($news.find('.article-container .img'));
      };
    }
  }
  each(news.coins, (coin) => {
    const coinCp = coin;
    if (parseFloat(coin.ratio) > 0) {
      coinCp.class = 'good';
    } else if (parseFloat(coin.ratio) < 0) {
      coinCp.class = 'bad';
    }
    merge(coin, coinCp, true);
  });
  if (news.video_url) {
    const viewTpl = `<video height="240" controls><source src="${news.video_url}" type="video/mp4">您的浏览器不支持 HTML5 video 标签。</video>`;
    $news.find('.article-container a').after(viewTpl);
  }
  if (news.coins.length > 0) {
    each(news.coins, (coin) => {
      const copyCoin = coin;
      const code = coin.code.toLowerCase();
      copyCoin.lowerCode = code;
      merge(coin, copyCoin, true);
    });
    const $coinTags = mustache.render(coinTagTpl, { coinTags: news.coins });
    $news.find('.article-container a').after($coinTags);
  }
  if (activeButton) {
    $buttonContainer.find(activeButton).addClass('active').attr('data-type', '0');
  }
  if (news.is_collect) {
    $buttonContainer.find('.collect').addClass('active').attr('data-type', '0');
  }
  return $news;
};
export default renderNewsList;

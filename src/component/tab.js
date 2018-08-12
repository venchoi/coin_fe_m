import $ from 'jquery';

const tab = (selector) => {
  const $root = $(selector);
  const $hoverLine = $root.find('.hover-line');
  const $activeItem = $root.find('.tab-item.active');

  $hoverLine.css('width', $activeItem.width());
  if ($activeItem.length) {
    $hoverLine.css('left', $activeItem[0].offsetLeft);
  }

  $root.find('li.tab-item').on('touchend', function (e) {
    const target = e.currentTarget;
    const $target = $(target);
    if (!$target.hasClass('disabled') && !$target.hasClass('active')) {
      $hoverLine.css('width', $target.width());
      $hoverLine.css('left', target.offsetLeft);
      $target.addClass('active').siblings().removeClass('active')
        .parents()
        .find('.tabs-content')
        .find($(this).attr('data-tab'))
        .addClass('active')
        .siblings()
        .removeClass('active');
    }
  });
};

export default tab;

(function($){
    var $window = $(window);
    var $HB;
    var windowResizeTimer;
    var $targets = $();
    var $togglers = $();
    var defaults = {
        scrollInView: 'close'
    };

    $window.on('resize', function (e) {
        clearTimeout(windowResizeTimer);
        windowResizeTimer = setTimeout(function () {
            $window.trigger('togglerThresholdResize');
        }, 300);
    });

    $.fn.toggler = function (options) {
        var settings = $.extend({}, defaults, options);
        $targets = $targets.add($('[js-toggler-target]'));
        $togglers = $togglers.add($(this));

        return this.each(function (i, toggler) {
            var $toggler = $(toggler).off('.toggler');
            var dataset = toggler.dataset || {};
            var $togglersOther = $togglers.filter('[data-toggler="'+ dataset.toggler +'"]').not($toggler);
            var single = dataset.togglerSingle || false;
            var close = dataset.togglerClose || false;
            var animate = dataset.togglerAnimate || false; // data-toggler-animate="true"
            var threshold = dataset.togglerThreshold || false;
            var $target = $targets.filter('[data-toggler="'+ dataset.toggler +'"]').addClass('toggler-target').off('.toggler');
            var maxHeight = 'none';

            if ( single ) {
                close = false;
            }
            if ( close ) {
                close = JSON.parse(close);
                close.$target = close.target ? $toggler.find(close.target) : $toggler;
                close.textOrigin = close.$target.text();
            }
            if ( animate ) {
                var heightFrom;
                var heightTo;
            }
            if ( threshold ) {
                threshold = JSON.parse(threshold) || {};
                var targetHeight = 0;
                var thresholdHeight = threshold.height;
                var thresholdFrom = threshold.from;

                $target.addClass('mod-threshold is-threshold');
                $toggler.addClass('mod-threshold');
                if ( !threshold.height ) {
                    thresholdHeight = parseInt($target.css('max-height'));
                }
                $target.removeClass('is-threshold');
                $window.on('togglerThresholdResize', function () {
                    togglerThresholdResize();
                });
                togglerThresholdResize();
                $toggler.on('updateToggler.toggler', function (e) {
                    e.stopPropagation();
                    togglerThresholdResize();
                });

                function togglerThresholdResize () {
                    thresholdHeight = parseInt($target.css('max-height'));
                    targetHeight = $target.removeClass('mod-threshold').outerHeight();
                    if ( !$target.hasClass('is-open') ) {
                        $target.addClass('mod-threshold');
                    }
                    if ( !$target.hasClass('is-threshold') && (!thresholdFrom || $window.width() <= thresholdFrom) && (!isNaN(thresholdHeight) && targetHeight > thresholdHeight) ) {
                        $target.addClass('is-threshold');
                        $toggler.addClass('is-threshold');
                    }
                    else if ( ($target.hasClass('is-threshold') && (isNaN(thresholdHeight) || targetHeight <= thresholdHeight)) && (!thresholdFrom || $window.width() <= thresholdFrom)) {
                        $target.removeClass('is-threshold');
                        $toggler.removeClass('is-threshold');
                        if ( $toggler.hasClass('is-open') ) {
                            $toggler.trigger('toggle', [true]);
                        }
                    }
                }
            }

            $toggler.on({
                'click.toggler toggle.toggler': function (e, simple) {
                    !dataset.togglerPrevent && e.preventDefault();
                    if ( $target.hasClass('is-animate') ) return;

                    if ( !single && $toggler.hasClass('is-open') ) {
                        $toggler.removeClass('is-open');
                        $togglersOther.removeClass('is-open');
                        if ( close ) {
                            close.$target.text(close.textOrigin);
                        }
                        if ( animate && !simple ) {
                            heightFrom = $target.removeClass('is-animate').outerHeight(true);
                            $target.removeClass('is-open');
                            if ( threshold ) {
                                $target.addClass('mod-threshold');
                            }
                            heightTo = $target.outerHeight(true);
                            $target.removeClass('mod-threshold').css('max-height', heightFrom).css('height', heightFrom).outerHeight(true);
                            $target.addClass('is-animate is-open').css('max-height', heightTo).off('.toggler-animate').on('transitionend.toggler-animate', function (e) {
                                if ( e.originalEvent.propertyName == 'max-height' ) {
                                    $target.removeClass('is-animate is-open').css('max-height', '').css('height', '').off('.toggler-animate').trigger('togglerClosed');
                                    if ( threshold ) {
                                        $target.addClass('mod-threshold');
                                    }
                                }
                            });

                            if ( settings.scrollInView || settings.scrollInView == 'close' ) {
                                var scrollTargetOffset = dataset.togglerScrollTarget && dataset.togglerScrollTarget == 'parent' ? $toggler.closest('[js-toggler-scroll-target]').offset() : dataset.togglerScrollTarget && dataset.togglerScrollTarget == 'target' ? $target.offset() : $toggler.offset();
                                var scrollTop = $window.scrollTop();
                                if ( scrollTargetOffset.top < scrollTop || scrollTargetOffset.top > scrollTop + $window.height() ) {
                                    $HB.not(':animated').stop().animate({
                                        scrollTop: scrollTargetOffset.top
                                    }, 500);
                                }
                            }
                        }
                        else {
                            $target.removeClass('is-open');
                        }
                    }
                    else {
                        $toggler.addClass('is-open');
                        $togglersOther.addClass('is-open');
                        if ( close ) {
                            close.$target.text(close.text);
                        }
                        else if ( single == 'remove' ) {
                            $toggler.remove();
                            $togglersOther.remove();
                        }
                        if ( animate && !simple ) {
                            heightFrom = $target.removeClass('is-animate').outerHeight(true);
                            $target.addClass('is-open').removeClass('mod-threshold');
                            heightTo = $target.outerHeight(true);
                            $target.css('max-height', heightFrom).outerHeight(true);
                            $target.addClass('is-animate').css('max-height', heightTo).off('.toggler-animate').on('transitionend.toggler-animate', function (e) {
                                if ( e.originalEvent.propertyName == 'max-height' ) {
                                    $target.removeClass('is-animate').css('max-height', '').off('.toggler-animate').trigger('togglerOpened');
                                }
                            });
                        }
                        else {
                            $target.addClass('is-open');
                        }
                    }
                }
            });
        });
    };


    $(function(){
        $HB = $('html, body');
    });
})(jQuery);

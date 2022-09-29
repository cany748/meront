(function($){
    var $HB;
    var $panels = $();

    $.fn.tabby = function (options) {
        var settings = $.extend({}, {
            panels: '[js-tabby-panel]',
            openFirst: true
        }, options);
        var $tabs = $(this);
        $panels = $panels.add( $(settings.panels) );

        return $tabs.each(function (i, tab) {
            var $tab = $(tab);
            var data = $tab.data('tabby') ? $tab.data('tabby').split(':') : undefined;
            var rel = $tab.data('tabby-rel') || undefined;
            var isLabel = $tab.is('label');
            var isSelect = $tab.is('select');
            var scroll = $tab.data('tabby-scroll');
            var $scroll = scroll ? ( scroll == 'self' || scroll == true ? $tab : scroll == 'parent' ? $tab.parent() : scroll.length ? $(scroll) : $() ) : $();
            scroll = $scroll.length;

            $tab.off('.tabby').on({
                'click.tabby openTab.tabby': function (e, eData) {
                    (!isLabel || !isSelect) && e.preventDefault();

                    if ( e.type == 'click' ) {
                        if ( $tab.hasClass('is-active') ) {
                            if ( $tab.data('tabby-selfclose') ) {
                                $tab.removeClass('is-active');
                                getPanels($panels, data)[1].removeClass('is-active');
                            }
                            return;
                        }
                        if ( rel ) {
                            rel.forEach(function (_rel) {
                                getTabs($tabs, _rel.split(':'))[1].trigger('openTab');
                            });
                        }
                    }
                    else {
                        e.stopPropagation();
                    }

                    if ( !data && !isSelect ) {
                        $tab.addClass('is-broken');
                        return;
                    }
                    else {
                        var $tabs_filtered = getTabs($tabs, data);
                        $tabs_filtered[0].removeClass('is-active');
                        $tabs_filtered[1].addClass('is-active');

                        var $tab_panels = getPanels($panels, data);
                        $tab_panels[0].removeClass('is-active');
                        $tab_panels[1].addClass('is-active');

                        $tab.trigger('tabChanged', {
                            panel: $tab_panels[1].trigger('tabChanged', {
                                tab: $tab,
                                otherPanels: $tab_panels[0].not($tab_panels[1])
                            })
                        });

                        if ( scroll && $HB && !(eData && eData.scroll == false) ) {
                            $HB.not(':animated').animate({scrollTop: $scroll.offset().top}, 300);
                        }
                    }
                },
                'closeTab.tabby': function (e, eData) {
                    e.stopPropagation();
                    var $tab_panels = getPanels($panels, data);
                    $tab.removeClass('is-active');
                    $tab_panels[1].removeClass('is-active');
                    $tab.trigger('tabClosed', {
                        panel: $tab_panels[1].trigger('tabClosed', {
                            tab: $tab,
                            otherPanels: $tab_panels[0].not($tab_panels[1])
                        })
                    });
                }
            });

            if ( isLabel ) {
                var $input = $tab.attr('for') ? $('input#'+ $tab.attr('for')) : $tab.find('input');
                if ( $input.length ) {
                    $tab.off('click.tabby');
                    $input.off('.tabby').on({
                        'change.tabby': function (e) {
                            if ( $input.prop('checked') ) {
                                $tab.trigger('openTab');
                            }
                            else {
                                $tab.trigger('closeTab');
                            }
                        }
                    });
                }
            }

            if ( isSelect ) {
                $tab.off('click.tabby').on({
                    'change.tabby changeTabby.tabby': function (e, eData) {
                        e.stopPropagation();
                        data = $tab.find(':selected').data('tabby');
                        if ( !data ) {
                            data = $tab.data('tabby');
                            if ( !data ) return;

                            data = data.split(':');
                            $tab.trigger('closeTab');
                            return;
                        }

                        data = $tab.find(':selected').data('tabby');
                        $tab.data('tabby', data);
                        data = data.split(':');
                        $tab.trigger('openTab');
                    },
                    'openTab.tabby': function (e, eData) {
                        e.stopPropagation();
                        $tab.trigger('updateSelect');
                    },
                    'updateSelect.tabby': function (e, eData) {
                        e.stopPropagation();
                    }
                });

                if ( $tab.hasClass('is-active') ) {
                    $tab.trigger('changeTabby');
                }
            }

            if ( $tab.hasClass('is-active') ) {
                $tab.trigger('openTab', {scroll: false});
            }

        });
    };

    function getTabs ($tabs, data) {
        var $tabs_filtered = $tabs.filter(function (i, panel) {
            return $tabs.eq(i).data('tabby') && $tabs.eq(i).data('tabby').split(':')[0] == data[0];
        });
        return [$tabs_filtered, $tabs_filtered.filter(function (i, panel) {
            return $tabs_filtered.eq(i).data('tabby').split(':')[1] == data[1];
        })];
    }
    function getPanels ($panels, data) {
        var $panels_filtered = $panels.filter(function (i, panel) {
            return $panels.eq(i).data('tabby') && $panels.eq(i).data('tabby').split(':')[0] == data[0];
        });
        return [$panels_filtered, $panels_filtered.filter(function (i, panel) {
            return $panels_filtered.eq(i).data('tabby').split(':')[1] == data[1];
        })];
    }


    $(function(){
        $HB = $('html, body');
    });
})(jQuery);

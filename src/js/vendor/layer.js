(function(){

    'use strict';

    var Layer;
    var $document,
        $window,
        $body,
        $bodyWrapper,
        $overlay,
        overlayAllowed;

    var initialized,
        opened = [],
        bodyScroll,
        storage = {};

    function initialize(){
        if(initialized) return;
        initialized = true;

        $document = $(document);
        $window = $(window);
        $body = $('body');
        $bodyWrapper = $('.body__wrapper');

        overlayAllowed = true;

        if(overlayAllowed){
            $overlay = $('<div class="body__overlay"></div>').appendTo($body);

            $overlay.on('click', function(e){
                e.preventDefault();
                if(opened){
                    opened[opened.length-1].close();
                }
            });
        }




        $document.on('click', '[js-open-layer]', function(e){
            e.preventDefault();
            e.stopPropagation();
            open($(this).attr('js-open-layer'));
        });

        $document.on('click', '[js-toggle-layer]', function(e){
            e.preventDefault();
            e.stopPropagation();
            toggle($(this).attr('js-toggle-layer'));
        });
    }

    function findLayer(id){
        var layer = storage[id];
        if(!layer){
            layer = new Layer($('.layer[data-id="'+id+'"]'));
            storage[layer.id] = layer;
        }
        return layer;
    }

    function open(id, data){
        findLayer(id).open(data)
    }


    function toggle(id){
        var layer = findLayer(id);
        if(layer.opened){
            layer.close()
        }else{
            layer.open();
        }
    }

    function close(id, data, delay){
        findLayer(!id ? opened[opened.length-1].id : id).close(delay, data)
    }

    function showOverlay(){
        if(overlayAllowed){
            $overlay.addClass('is-opened');
        }
    }

    function hideOverlay(){
        if(overlayAllowed){
            $overlay.removeClass('is-opened');
        }
    }

    function lockBody(){
        $bodyWrapper.css('top', -(bodyScroll = $document.scrollTop())).addClass('is-locked');
    }

    function unlockBody(){
        $bodyWrapper.css('top', 'auto').removeClass('is-locked');
        $document.scrollTop(bodyScroll);
    }

    function hideBody(isOverlayer){
        $bodyWrapper.addClass(isOverlayer ? 'is-overlay' : 'is-hide').removeClass(isOverlayer ? 'is-hide' : '');
    }

    function showBody(isOverlayer){
        $bodyWrapper.removeClass(isOverlayer ? 'is-overlay is-hide' : 'is-hide');
    }

    Layer = function($layer, options){
        options = $.extend(
            {},
            options || {}
        );

        $.extend(this, {
            options: options,
            id: null,
            initialized: false,
            opened: false,
            $origin: null,
            $layer: null
        });

        this.initialize($layer);
    };


    $.extend(Layer.prototype, {
        initialize: function($layer){
            if(this.initialized) return;

            this.initialized = true;
            $layer = $($layer);
            if(!$layer.length){
                throw new Error('Layer not found');
            }

            this.$origin = this.$layer = $layer.detach();
            this.id = $layer.data('id');

            $layer.addClass('is-initialized');

            this.options.isOverlayer = $layer.data("overlayer");

            if ( this.options.overlayClose ) {
                $layer.on('click', function(e){
                    if ( !$(e.target).closest('.layer__inside').length ) {
                        this.close(0);
                    }
                }.bind(this));
            }

            $layer.on('click', '.layer-close, .layer-back, [js-close-layer]', function(e){
                if(!$(e.currentTarget).attr('href') || $(e.currentTarget).attr('href') == '#'){
                    e.preventDefault();
                    this.close($(e.currentTarget).data('close-delay') || 0);
                }
            }.bind(this));
        },
        open: function(data){

            if(this.options.clone){
                this.$layer = this.$origin.clone(true, true);
            }

            var $layer = this.$layer,
                $header = $layer.find('.layer-header'),
                top = opened[opened.length-1];
            $layer.css('top', 0);

            if(this.options.beforeOpen) {
                this.options.beforeOpen.call(this, this.$layer, data);
            }

            if(data && data.beforeOpen) {
                data.beforeOpen.call(this, this.$layer, data);
            }

            if(opened.length){
                top.scrollTop = $window.scrollTop();
                // top.scrollTop = Math.abs(top.$layer.offset().top);
                top.$layer.css('top', -top.scrollTop);
                opened.forEach(function(layer){
                    layer.$layer.addClass('is-faded');
                });
            }
            else {
                lockBody();
            }

            opened.push(this);
            this.opened = true;


            if(this.options.isOverlayer){
                showOverlay();
                $overlay.removeClass('is-complete');
            }else{
                hideOverlay();
                hideBody();
            }

            setTimeout(function(){
                $body.append($layer.addClass('is-animating'));

                if(this.options.aside){
                    $layer.addClass('is-aside');
                }

                $layer[0].offsetHeight;
                $layer.addClass('is-opened');

                $layer.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $layer.removeClass('is-animating');

                    if(this.options.isOverlayer){
                        $overlay.addClass('is-complete');
                    }
                }.bind(this));

                if($header.length){
                    $layer.css('padding-top', $header.outerHeight());
                }

                $document.scrollTop(0);

                // if ( $.fn.inputmask ) {
                //     $layer.find('[data-inputmask]').inputmask();
                // }

                if(this.options.afterOpen) {
                    this.options.afterOpen.call(this, this.$layer, data);
                }

                if(data && data.afterOpen) {
                    data.afterOpen.call(this, this.$layer, data);
                }

                $window.trigger('layerOpened', [this.$layer, this.id]);

            }.bind(this), 10);

        },

        close: function(delay, data){
            opened = opened.filter(function(layer){
                return layer !== this;
            }, this);
            var $layer = this.$layer;
            $layer.css('top', -$window.scrollTop());
            $layer.addClass('is-closing');

            setTimeout(function(){
                var top = opened[opened.length - 1];
                if(this.options.beforeClose){
                    this.options.beforeClose.call(this, $layer, data, top);
                }

                if(top && top.$layer.hasClass('is-faded')){
                    top.$layer.css('top', 0).removeClass('is-faded');
                    $window.scrollTop(top.scrollTop);
                }

                $layer.addClass('is-animating').removeClass('is-opened');

                if(!opened.length || this.options.isOverlayer){
                    showBody();
                }

                if(top && this.options.isOverlayer){
                    showOverlay();
                }else if(this.options.isOverlayer){
                    hideOverlay();
                }

                setTimeout(function(){
                    $layer.removeClass('is-animating').removeClass('is-closing').detach();
                    this.opened = false;

                    if(!opened.length){
                        unlockBody();
                    }

                    if(this.options.afterClose){
                        this.options.afterClose.call(this, $layer, data, top);
                    }

                    $window.trigger('layerClosed', [this.$layer, this.id]);
                }.bind(this), 300);

            }.bind(this), delay || 0);

        }
    });

    $.extend(Layer, {
        open: open,
        close: close,
        toggle: toggle,
        closeAll: function () {
            opened.forEach(function(open) {
                open.close();
            });
        }
    });


    $(function(){
        initialize();
    });

    window.Layer = Layer;

    $.fn.layer = function(options){
        setTimeout(function(){
            this.each(function(){
                var layer = new Layer(this, options);
                storage[layer.id] = layer;
            });
        }.bind(this), 10);
    };
}());

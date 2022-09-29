app.bind("default", function () {
    $(".promotions__slider").slick({
        variableWidth: true,
        centerMode: true,
        centerPadding: "0",
        infinite: true,
        appendArrows: $(".promotions__buttons"),
        prevArrow: '<a href="" class="promotions__button promotions__button_left" role="button"></a>',
        nextArrow: '<a href="" class="promotions__button promotions__button_right" role="button"></a>'
    });
    $(".videos__list").slick({
        variableWidth: true,
        // slidesToShow: 4,
        infinite: false,
        arrows: false
    });
    $("[js-scrolltop]").on("click", function (e) {
        $('html, body').animate({scrollTop: 0}, 500);
        e.preventDefault();
        e.stopPropagation();
    });
    $("[js-toggler]").toggler();
    $("[js-tabby-tab]").tabby();
    $("[js-contacts-image-item]").on("click", function () {
        $("[js-contacts-image][data-id = " + $(this).data('target') + "]").children("img").attr("src", $(this).data("full-img"))
    });
})

app.bind("default", function () {
    // $("input[name=tel]").inputmask({
    //     mask: "+7 (999) 999-99-99",
    //     jitMasking: 4,
    //     showMaskOnHover: false,
    //     showMaskOnFocus: false,
    //     undoOnEscape: false,
    //     oncomplete: function() {
    //         $(this).parent().removeClass("is-error");
    //         $(this).parent().siblings("[type=submit]").prop("disabled", false)
    //     },
    //     onincomplete: function() {
    //         $(this).parent().addClass("is-error");
    //         $(this).parent().siblings("[type=submit]").prop("disabled", true)
    //     }
    // });
    //
    $(document).on("submit", "[js-callback-form]", function (e) {
        let $this = $(this);
        let data = {};

        $("input[name=price]", $this).val(function () {
            let text = "";
            $(".catalog-item.is-active").not(".catalog-item_static").each(function () {
                if ($(".catalog-item__description", this).text()) {
                    text += $(".catalog-item__description", this).text() + "; ";
                }
                else {
                    text += $(".catalog-item__name", this)[0].innerText + "; ";
                }
            })
            return text;
        });

        $($this.serializeArray()).each(function (i, o) {
            data[o.name] = o.value
        });

        if (data["district"]) {
            data["district"] = data["district"].split(";")[2]
        }

        if ($this.hasClass("trade-in-form")) {
            let text = "";
            $.ajax({
                type: "POST",
                timeout: 1000,
                cache: false,
                data: {callback: data},
                dataType: "json",
                success: function(response) {
                    if (response.success) {
                        text ="Мы свяжемся с Вами в ближайшее время!";
                    }
                    else {
                        text = "Произошла ошибка, повторите попытку позже.";
                    }
                },
                error: function() {
                    text = "Произошла ошибка, повторите попытку позже.";
                },
                complete: function() {
                    Layer.open("main/callback", { afterOpen: function() {
                        $(".callback__title", this.$layer).text(text);
                        $(".layer__inside", this.$layer).addClass("is-completed");
                    }})
                }
            });
        }
        else {
            $.ajax({
                type: "POST",
                timeout: 1000,
                cache: false,
                data: {callback: data},
                dataType: "json",
                success: function(response) {
                    if (response.success) {
                        $(".callback__title", $this.parent()).text("Мы свяжемся с Вами в ближайшее время!");
                    }
                    else {
                        $(".callback__title", $this.parent()).text("Произошла ошибка, повторите попытку позже.");
                    }
                    $this.parent().addClass("is-completed");
                },
                error: function() {
                    $(".callback__title", $this.parent()).text("Произошла ошибка, повторите попытку позже.");
                    $this.parent().addClass("is-completed");
                }
            });
        }

        e.preventDefault();
        e.stopPropagation();
    })
})

app.bind("default", function () {
    $("[js-selectize]").each(function () {
        let $this = $(this);
        let selectize = $("select", $this).selectize()[0].selectize;
        let selectizeButton = $(".selectize__button", $this);
        selectizeButton.on("click", function () {
            selectize.clear();
            selectizeButton.removeClass("selectize__button_active")
        })
        selectize.on("change", function () {
            let value = this.getValue();
            if (value) {
                if ($(window).width() > 850) {
                    $.ajax({
                        type: "POST",
                        timeout: 1000,
                        cache: false,
                        data: {model: value},
                        dataType: "json",
                        success: function(response) {
                            if (response.success) {
                                selectizeButton.addClass("selectize__button_active");
                                if (response.img) {
                                    $(".base-product-card__img img").attr("src", response.img)
                                }
                                else {
                                    $(".base-product-card__img img").attr("src", "")
                                }
                                $(".base-review-card__footer-button").attr("href", value);
                                $(".base-product-card__name span").text(response.name);

                                $(".base-review-card__items").empty();
                                if (Array.isArray(response.items)) {
                                    for (let i = 0; i < response.items.length; i++) {
                                        let $i = $('<div class="base-review-card__item base-review-card-item"></div>');
                                        $i.append('<span class="base-review-card-item__name">' + response.items[i].name + '</span>');
                                        if (response.items[i].time) {
                                            $i.append('<span class="base-review-card-item__time">' + response.items[i].time + ' мин.</span>')
                                        }
                                        else {
                                            $i.append('<span class="base-review-card-item__time">уточняйте</span>')
                                        }
                                        let $p = $('<div class="base-review-card-item__price"></div>');
                                        if (response.items[i].price) {
                                            $p.append('<span class="base-review-card-item__current-price">' + response.items[i].price + ' ₽</span>')
                                        }
                                        else {
                                            $p.append('<span class="base-review-card-item__current-price">уточняйте</span>')
                                        }
                                        if (response.items[i].price_old) {
                                            $p.append('<span class="base-review-card-item__old-price">' + response.items[i].price_old + ' ₽</span>')
                                        }
                                        $i.append($p);
                                        $(".base-review-card__items").append($i);
                                    }
                                }
                                $(".base__side").addClass("is-active");
                                $(".base-product-card__name").textfill();
                                $(".base-product-card__name").textfill();
                                $(".base-product-card__name").textfill();
                                $(".base-product-card__name").textfill();
                                $(".base-product-card__name").textfill();
                                $(".base-product-card__name").textfill()
                            }
                            else {
                                selectize.clear();
                                selectizeButton.removeClass("selectize__button_active");
                                $(".base__side").removeClass("is-active")
                            }
                        },
                        error: function() {
                            selectize.clear();
                            selectizeButton.removeClass("selectize__button_active");
                            $(".base__side").removeClass("is-active")
                        }
                    })
                }
                else {
                    selectizeButton.addClass("selectize__button_active");
                    document.location.pathname = "/" + value
                }
            }
            else {
                selectize.clear();
                selectizeButton.removeClass("selectize__button_active");
                $(".base__side").removeClass("is-active")
            }
            selectize.blur();
        });
        // $(".selectize-input input").width(280);
        new SimpleBar($(".selectize-dropdown", $this)[0]);
    })
})

app.bind("default", function () {
    $("[js-district]").each(function () {
        let $this = $(this);
        let selectize = $("select", $this).selectize()[0].selectize;
        let selectizeButton = $(".selectize__button", $this);
        let price = $(".callback__price span");
        price.data("originalValue", price.text());
        selectizeButton.on("click", function () {
            selectize.clear();
            selectizeButton.removeClass("selectize__button_active")
        })
        selectize.on("change", function () {
            let value = this.getValue().split(";")[1];
            if (value) {
                selectizeButton.addClass("selectize__button_active");
                price.text(value + "₽");
            }
            else {
                selectize.clear();
                selectizeButton.removeClass("selectize__button_active");
                price.text(price.data("originalValue"));
            }
            selectize.blur()
        })
    })
})

app.bind("default", function () {
    $("[js-catalog-item-input]").on("change", function () {
        let $this = $(this);
        let $parent = $this.parents("[js-catalog-item]");
        if (this.checked) {
            $(".catalog-selected__items").append($('<div class="catalog-selected__item catalog-selected-item" data-id="' + $parent.data("id") + '"><div class="catalog-selected-item__name">' + $.trim($(".catalog-item__name", $parent)[0].innerText) + '</div><div class="catalog-selected-item__warranty"><div class="catalog-selected-item__warranty-text">Гарантия</div><div class="catalog-selected-item__warranty-number">' + $(".catalog-item__warranty-number", $parent).text() + '</div></div><div class="catalog-selected-item__time"><div class="catalog-selected-item__time-text">Сроки</div><div class="catalog-selected-item__time-number">' + $(".catalog-item__time-number", $parent).text() + '</div></div><a href="#" class="catalog-selected-item__button"></a></div>'));
            $parent.addClass("is-active");
        }
        else {
            $(".catalog-selected-item[data-id = " + $parent.data('id') + "]").remove();
            $parent.removeClass("is-active");
        }
        catalogCalc();
        $(window).scroll();
    });

    $(".catalog-selected__items").on("click", ".catalog-selected-item__button", function (e) {
        $("[js-catalog-item][data-id = " + $(this).parent().data('id') + "]").removeClass("is-active").find("[js-catalog-item-input]").prop('checked', false);
        $(this).parent().remove();
        catalogCalc();
        e.preventDefault();
        e.stopPropagation()
    })

    $("[js-catalog-selected-input]").on("click", function () {
        catalogCalc()
    })

    $("[js-catalog-submit]").on("click", function () {
        if ($("[js-catalog-selected-input]").prop("checked")) {
            Layer.open("main/callback-out")
        }
        else {
            Layer.open("main/callback")
        }
    })

    // $("[js-catalog-credit]").on("click", function () {
    //     let $items = $(".catalog-item.is-active").not(".catalog-item_static");
    //     let items = [];
    //     let sum = 0;
    //
    //     if ($items.length) {
    //         $items.each(function () {
    //             let $this = $(this)
    //             let name, price;
    //
    //             if ($(".catalog-item__description", $this).text()) {
    //                 name = $(".catalog-item__description", $this).text();
    //             }
    //             else {
    //                 name = $(".catalog-item__name", $this)[0].innerText;
    //             }
    //
    //             price = Number($this.data("price"));
    //             sum += price;
    //             items.push({name: name, price: price, quantity: 1});
    //         })
    //
    //         if ($("[js-catalog-selected-input]").prop("checked")) {
    //             items.push({name: "Выезд мастера", price: 490, quantity: 1});
    //             sum += 490;
    //         }
    //
    //         tinkoff.create({
    //                 sum: sum,
    //                 items: items,
    //                 shopId: 'f797b066-7db8-4ee9-8d65-716f2840b849',
    //                 showcaseId: 'abe9f0a4-4fc4-412f-aee2-aac0d7432476',
    //             },
    //             {view: 'newTab'})
    //     }
    // })

    if ($(".catalog-selected_fixed")[0]) {
        $(window).on("scroll", function () {
            let $window = $(window);
            let $row = $(".catalog-selected_fixed");
            if ($row.hasClass("is-active") && $row.parent().offset() && $row.parent().offset().top + 30 > ($window.scrollTop() + $window.height())) {
                $(".catalog-selected_fixed").removeClass("is-hide")
            } else {
                $(".catalog-selected_fixed").addClass("is-hide")
            }
        })
    }

    function catalogCalc() {
        let $active = $(".catalog-item.is-active").not(".catalog-item_static");
        if ($active.length) {
            let warranty = 0, time = 0, price = 0, priceOld = 0;
            $(".catalog-selected").addClass("is-active");

            $active.each(function () {
                let $this = $(this)

                if (warranty < $this.data("warranty")) {
                    warranty = $this.data("warranty")
                }

                if (time < $this.data("time")) {
                    time = $this.data("time")
                }

                price += Number($this.data("price"));

                if (Number($this.data("price-old"))) {
                    priceOld += Number($this.data("price-old"));
                }
                else {
                    priceOld += Number($this.data("price"));
                }
            })

            if (warranty > 0) {
                $(".catalog-selected-info__warranty-number").text(warranty + " мес")
            }
            else {
                $(".catalog-selected-info__warranty-number").text("-")
            }

            if (time > 0) {
                $(".catalog-selected-info__time-number").text(time + " мин")
            }
            else {
                $(".catalog-selected-info__time-number").text("-")
            }

            if (priceOld > 0) {
                $(".catalog-selected-info__price-old").text(priceOld + " ₽")
            }
            else {
                $(".catalog-selected-info__price-old").text("")
            }

            if (price > 0) {
                if ($("[js-catalog-selected-input]").prop("checked")) {
                    price += 490
                }
                $(".catalog-selected-info__price-current").text(price + " ₽")
            }
            else {
                $(".catalog-selected-info__price-current").text("уточняйте")
            }

            // if (price > 3000) {
            //     $(".catalog-selected-info__button_credit").addClass("is-active").data("price", price)
            // }
            // else {
            //     $(".catalog-selected-info__button_credit").removeClass("is-active")
            // }
        }
        else {
            $(".catalog-selected").removeClass("is-active")
        }
    }
})

app.bind("default", function () {
    let $origImg = $(".models__img img");
    let timer;

    $(".models__items [data-src]").hover(function () {
        clearTimeout(timer);
        $origImg.attr("src", $(this).data("src"));
    }, function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            $origImg.fadeOut("fast", function() {
                $origImg.attr("src", $origImg.data("src")).fadeIn("fast");
            });
        }, 3000);
    })
})

app.bind("default", function () {
    $("[js-layer]").layer()
})
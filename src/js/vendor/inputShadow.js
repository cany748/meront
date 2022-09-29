(function ($) {
    $.fn.inputShadow = function () {
        return $(this).each(function (parent_i, parent) {
            var $parent = $(parent);
            var $input = $parent.find('input, textarea, [contenteditable], select');
            var required = $input.prop('required') || false;
            var isContenteditable = $input.is('[contenteditable]');
            var errorRemoveEvent = $parent.data('error-remove');

            if (isContenteditable) {
                var $hiddenInput = $('<input type="hidden" name="' + $input.attr('name') + '" value="' + $input.html().trim().replace(/<div>/gi, '<br>').replace(/<\/div>/gi, '').replace(/<br>/gi, '\n') + '"/>').appendTo($parent);
            }

            $parent.removeClass('is-focus is-filled').toggleClass('is-required', required);
            $input.off('.input-shadow');

            if ($input.is('select')) {
                var $options = $input.find('option');
                var selectedVal;
                $input.on({
                    'update.input-shadow': function (e) {
                        $options = $input.find('option');
                        $input.trigger('changeSilent');
                    },
                    'change.input-shadow changeSilent.input-shadow': function (e, firstLoad) {
                        if ($input.is(':disabled')) {
                            $parent.addClass('is-disabled');
                        }
                        else {
                            $parent.removeClass('is-disabled');
                        }

                        selectedVal = $options.filter(':selected').val();

                        if (selectedVal !== '' && selectedVal !== '00') {
                            $parent.addClass('is-filled');

                            if (!firstLoad && $parent.hasClass('is-error')) {
                                $parent.removeClass('is-error');
                            }
                        }
                        else {
                            $parent.removeClass('is-filled');

                            if (!firstLoad && !required && $parent.hasClass('is-error')) {
                                $parent.removeClass('is-error');
                            }
                        }
                    }
                });
            }
            else {
                $input.on({
                    'focus.input-shadow': function (e) {
                        $parent.addClass('is-focus');
                        if (errorRemoveEvent == 'focus') {
                            $parent.removeClass('is-error');
                        }
                    },
                    'blur.input-shadow': function (e) {
                        $parent.removeClass('is-focus');
                    },
                    'keyup.input-shadow': function (e) {
                        if (isContenteditable) {
                            $input.trigger('changeSilent');
                        }
                    },
                    'input.input-shadow change.input-shadow changeSilent.input-shadow': function (e, firstLoad) {
                        if ($input.is(':disabled')) {
                            $parent.addClass('is-disabled');
                        }
                        else {
                            $parent.removeClass('is-disabled');
                        }

                        if ($input.val().length > 0 || (isContenteditable && $input.text().length > 0) || ( $.fn.inputmask && $input.inputmask("hasMaskedValue"))) {
                            $parent.addClass('is-filled');
                            if ($parent.hasClass('is-error') && !firstLoad) {
                                $parent.removeClass('is-error');
                            }
                        }
                        else {
                            $parent.removeClass('is-filled');
                        }

                        if ($parent.hasClass('is-ok') && !firstLoad) {
                            $parent.removeClass('is-ok');
                        }

                        if (isContenteditable) {
                            $hiddenInput.val($input.html().trim().replace(/<div>/gi, '<br>').replace(/<\/div>/gi, '').replace(/<br>/gi, '\n'));
                        }
                    }
                });
            }

            $input.trigger('changeSilent', [true]);
        });
    };
})(jQuery);

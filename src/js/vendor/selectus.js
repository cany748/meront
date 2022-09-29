// (function($){
//     var selID = 0
//     var $document = $(document);
//     var selectusTmp = '<div class="selectus"><div js-selectus-field class="selectus-field"><div js-selectus-field-value class="selectus-field__value"></div></div><div js-selectus-options class="selectus-options"><div js-selectus-options-wrapper class="selectus-options__wrapper"><div class="selectus-options__triangle"></div><div js-selectus-options-list class="selectus-options__list"></div></div></div></div>';
//     var itemTmp = '<div js-selectus-options-item class="selectus-options__item"><div js-selectus-options-item-title class="selectus-options__item-title">TITLE</div><div class="selectus-options__item-fake"></div></div>';
//
//     $.fn.selectus = function () {
//         return this.each(function(selectIndex, select) {
//             selID++;
//
//             var $select = $(select);
//             var $options = $();
//             var $selectus = $(selectusTmp);
//             var $field = $selectus.find('[js-selectus-field]');
//             var $fieldValue = $field.find('[js-selectus-field-value]');
//             var $optionsContainer = $selectus.find('[js-selectus-options]');
//             var $optionsWrapper = $optionsContainer.find('[js-selectus-options-wrapper]');
//             var $optionsList = $optionsContainer.find('[js-selectus-options-list]');
//             var $optionsItems = $();
//
//             var selectDataset = this.dataset || {};
//             var isMulti = this.multiple;
//             var isSearch = selectDataset.search || false;
//             var isCount = selectDataset.count || false;
//             var values = $select.val();
//             var optionsScrollBar = null;
//
//             if ( selectDataset.selectusInited ) {
//                 $select.closest('.selectus').replaceWith($select);
//             }
//
//             $select.attr('data-selectus-inited', true);
//
//             spawnOptions();
//             if ( isMulti ) {
//                 $selectus.addClass('is-multiple');
//             }
//             if ( selectDataset.fieldClear ) {
//                 var $clear = $('<div js-selectus-clear class="selectus-field__clear" />').appendTo($field);
//                 $clear.on({
//                     'click.selectus': function (e) {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         $select.val('').trigger('change');
//                     }
//                 });
//             }
//
//             $selectus.addClass($select.attr('class')).insertAfter($select);
//             $select.appendTo($selectus);
//
//             connectSelects();
//             updateItems();
//
//             $field.off('.selectus').on({
//                 'click.selectus': function (e) {
//                     e.preventDefault();
//
//                     $selectus.trigger('toggleSelectus');
//                 }
//             });
//             $selectus.off('.selectus').on({
//                 'toggleSelectus.selectus': function (e) {
//                     e.stopPropagation();
//                     if ( $selectus.hasClass('is-open') ) {
//                         $selectus.trigger('closeSelectus');
//                     }
//                     else {
//                         $selectus.trigger('openSelectus');
//                     }
//                 },
//                 'openSelectus.selectus': function (e) {
//                     e.stopPropagation();
//                     $selectus.addClass('is-open');
//
//                     if ( !optionsScrollBar ) {
//                         optionsScrollBar = new SimpleBar($optionsList[0], { autoHide: false });
//                     }
//
//                     setTimeout(function(){
//                         $document.one('click.selectus-close-'+ selID, function (e) {
//                             $selectus.trigger('closeSelectus');
//                         });
//
//                         if ( !isSearch ) {
//                             $document.off('selectus-key-close-'+ selID).on('keyup.selectus-key-close-'+ selID, function (e) {
//                                 if ( e.keyCode === 27 ) { // ESC
//                                     $selectus.trigger('closeSelectus');
//                                 }
//                             });
//                         }
//
//                         $selectus.off('.selectus-close').on({
//                             'click.selectus-close': function (e) {
//                                 e.stopPropagation();
//                             }
//                         });
//                     }, 10);
//                 },
//                 'closeSelectus.selectus': function (e) {
//                     e.stopPropagation();
//                     $document.off('click.selectus-close-'+ selID);
//                     $selectus.removeClass('is-open').off('.selectus-close');
//                 }
//             });
//
//
//             if ( isSearch ) {
//                 var $search = $('<div class="selectus-options__search"><label js-inputShadow class="field"><span class="field__title">Поиск</span><input type="text" name="" class="field__input"></label></div>');
//                 var $searchInput = $search.find('input');
//                 var searchValue = $searchInput.val().toLowerCase();
//
//                 $search.find('[js-inputShadow]').inputShadow();
//                 $search.prependTo($optionsWrapper);
//                 $(itemTmp.replace(/TITLE/g, select.dataset.searchEmpty || 'Нет подходящих')).addClass('selectus-options__item_empty').appendTo($optionsList);
//
//                 $searchInput.off('.selectus').on({
//                     'input.selectus change.selectus': function (e) {
//                         searchValue = $searchInput.val().toLowerCase();
//                         if ( searchValue.length > 0 ) {
//                             $optionsContainer.addClass('is-filter');
//
//                             $optionsItems.removeClass('is-filter').filter(function (itemIndex, item) {
//                                 return item.dataset.text.toLowerCase().indexOf(searchValue) > -1;
//                             }).addClass('is-filter');
//                             if ( $optionsItems.filter('.is-filter').length === 0 ) {
//                                 $optionsContainer.addClass('is-filter-empty');
//                             }
//                             else {
//                                 $optionsContainer.removeClass('is-filter-empty');
//                             }
//                         }
//                         else {
//                             $optionsContainer.removeClass('is-filter is-filter-empty');
//                             $optionsItems.removeClass('is-filter');
//                         }
//                     },
//                     'keypress.selectus': function (e) {
//                         if ( e.keyCode === 13) { // ENTER
//                             e.stopPropagation();
//                             return false;
//                         }
//                     },
//                     'keyup.selectus': function (e) {
//                         if ( e.keyCode === 27 && searchValue.length > 0 ) { // ESC
//                             e.stopPropagation();
//                             $searchInput.trigger('clearSearch');
//                         }
//                         if ( e.keyCode === 13 && !$optionsContainer.hasClass('is-filter-empty') ) { // ENTER
//                             e.stopPropagation();
//                             $optionsItems.filter('.is-filter').eq(0).trigger('selectItem');
//                         }
//                     },
//                     'clearSearch.selectus': function (e) {
//                         $searchInput.val('').trigger('change');
//                     }
//                 });
//
//                 $selectus.off('.selectus-search').on({
//                     'closeSelectus.selectus-search': function (e) {
//                         e.stopPropagation();
//                         $searchInput.trigger('clearSearch');
//                         $document.off('.selectus-search-close-'+ selID);
//                     },
//                     'openSelectus.selectus-search': function (e) {
//                         e.stopPropagation();
//                         $document.off('selectus-key-close-'+ selID).on('keyup.selectus-key-close-'+ selID, function (e) {
//                             if ( e.keyCode === 27 && searchValue.length === 0 ) { // ESC
//                                 $selectus.trigger('closeSelectus');
//                             }
//                             else if ( e.keyCode === 27 && searchValue.length > 0 ) {
//                                 $searchInput.trigger('clearSearch').focus();
//                             }
//                         });
//                     }
//                 });
//
//                 $field.off('.selectus-search').on({
//                     'click.selectus-search': function (e) {
//                         $searchInput.focus();
//                     }
//                 });
//
//
//                 if ( !isMulti ) {
//                     $select.off('.selectus-search').on({
//                         'change.selectus-search silentChange.selectus-search': function (e) {
//                             $searchInput.trigger('clearSearch');
//                         }
//                     });
//                 }
//             }
//
//             if ( select.dataset.prefix ) {
//                 $field[0].dataset.prefix = select.dataset.prefix;
//             }
//             if ( select.dataset.title ) {
//                 $fieldValue[0].dataset.title = select.dataset.title;
//             }
//
//
//             function updateItems () {
//                 $optionsItems.removeClass('is-active');
//
//                 if ( isMulti ) {
//                     var text = '';
//                     if ( !isCount && values ) {
//                         values.forEach(function (value) {
//                             $optionsItems.filter('[data-value="'+ value +'"]').addClass('is-active').each(function (i, option) {
//                                 text = text.length > 0 ? text +', '+ option.dataset.text : option.dataset.text;
//                             });
//                         });
//                     }
//                     else if ( values ) {
//                         text = values.length;
//                         values.forEach(function (value) {
//                             $optionsItems.filter('[data-value="'+ value +'"]').addClass('is-active');
//                         });
//                     }
//
//                     $fieldValue.attr('data-value', (text));
//                 }
//                 else {
//                     $fieldValue.attr('data-value', ($optionsItems.filter('[data-value="'+ values +'"]').addClass('is-active').text()));
//                 }
//
//                 if ( values && values !== '00' ) {
//                     $selectus.addClass('is-selected');
//                 }
//                 else {
//                     $selectus.removeClass('is-selected');
//                 }
//
//             }
//
//             function connectSelects () {
//                 $select.off('.selectus').on({
//                     'change.selectus silentChange.selectus': function (e) {
//                         values = $select.val();
//                         updateItems();
//                         if ( !isMulti ) {
//                             $selectus.trigger('closeSelectus');
//                         }
//                     },
//                     'update.selectus': function (e) {
//                         e.stopPropagation();
//                         $selectus.trigger('closeSelectus');
//                         spawnOptions();
//                         updateItems();
//                     }
//                 });
//
//                 $optionsList.off('.selectus').on('click.selectus selectItem.selectus', '[js-selectus-options-item]', function (e) {
//                     e.preventDefault();
//
//                     if ( isMulti ) {
//                         if ( values ) {
//                             if ( this.classList.contains('is-active') ) {
//                                 values.splice(values.indexOf(this.dataset.value), 1);
//                             }
//                             else {
//                                 values.push(this.dataset.value);
//                             }
//                         }
//                         else {
//                             values = [this.dataset.value];
//                         }
//                     }
//                     else if ( this.classList.contains('is-active') ) {
//                         return;
//                     }
//                     else {
//                         values = this.dataset.value;
//                     }
//
//                     $select.val(values).trigger('change');
//                 });
//             }
//
//             function spawnOptions () {
//                 var $option = $();
//                 $options = $select.find('option');
//                 $optionsList.empty();
//                 $optionsItems = $();
//                 optionsScrollBar = null;
//
//                 $options.each(function (optionIndex, option) {
//                     if ( option.value == '00' || !option.value ) return;
//
//                     $option = $(itemTmp.replace(/TITLE/g, option.text));
//                     $option[0].dataset.value = option.value;
//                     $option[0].dataset.text = option.text;
//                     $option[0].dataset.additional = option.dataset.additional || [];
//
//                     if ( option.dataset.additional ) {
//                         var $additionals = $('<div class="selectus-options__item-additionals" />');
//                         JSON.parse(option.dataset.additional).forEach(function (additional, additionalIndex) {
//                             $additionals.append('<div class="selectus-options__item-additional selectus-options__item-additional_'+ additional +'" />');
//                         });
//                         $additionals.prependTo($option);
//                     }
//                     $optionsItems = $optionsItems.add($option);
//                 });
//                 $optionsItems.appendTo($optionsList);
//             }
//         });
//     };
// })(jQuery);

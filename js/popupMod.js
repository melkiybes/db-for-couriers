//  Adding new options to the default options of a popup
L.Popup.mergeOptions({
    removable: false,
    editable: false,
    copyable: false
})

// Modifying the popup mechanics
L.Popup.include({


   // modifying the _initLayout method to include edit and remove buttons, if those options are enabled

   //  ----------------    Source code  ---------------------------- //
   // original from https://github.com/Leaflet/Leaflet/blob/master/src/layer/Popup.js
   _initLayout: function () {
      var prefix = 'leaflet-popup',
          container = this._container = L.DomUtil.create('div', prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-animated');

      var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

      L.DomEvent.disableClickPropagation(wrapper);
      L.DomEvent.disableScrollPropagation(this._contentNode);
      L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

      this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);

      if (this.options.closeButton) {
         var closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
         closeButton.href = '#close';
         closeButton.innerHTML = '&#215;';

         L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
      }

      //  ----------------    Source code  ---------------------------- //


      //  ---------------    My additions  --------------------------- //

      if (this.options.editable && this.options.removable && this.options.copyable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = '<div class="edit-icon"><span>Изменить</span></div>';
          
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = '<div class="remove-icon"><span>Удалить</span></div>';
          
         var copyButton = this._removeButton = L.DomUtil.create('a', prefix + '-copy-button', userActionButtons);
         copyButton.href = '#close';
         copyButton.innerHTML = '<div class="copy-icon"><span>Копировать</span></div>';
         this.options.minWidth = 160;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
         L.DomEvent.on(copyButton, 'click', this._onCopyButtonClick, this);
      }
   },

   _onRemoveButtonClick: function (e) {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-center",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "0",
      "timeOut": "0",
      "extendedTimeOut": "0",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
       toastr["error"]('<div>Вы уверены? Удалить?<button class="remove-card-btn">Да</button><button class="leave-card-btn">Нет</button></div>');
       var _RemoveEvent = e;
       $("body").on("click", "button.remove-card-btn", function(e){
           //console.log(_RemoveEvent);
           deleteNote(_RemoveEvent);
           L.DomEvent.stop(_RemoveEvent);
           //this._source.remove();
           L.DomEvent.stop(e);
       });
   },
    
    _onCopyButtonClick: function (e) {
        //console.log($(e.target).closest(".leaflet-popup-useraction-buttons").siblings(".leaflet-popup-content"));
        try {
            var $temp = $("<textarea>");
            $("body").append($temp);

            var $temp_value = "";
            $(e.target).closest(".leaflet-popup-useraction-buttons").siblings(".leaflet-popup-content").find("table.card td:not(:hidden)").each(function(index, el){
                //console.log($("body").find("table.card td:not(:hidden)").last()[0] == el);
                $temp_value += $(el).text().trim();
                if ($(el).hasClass("card-left")){
                    $temp_value += ": ";
                } else if ($("body").find("table.card td:not(:hidden)").last()[0] != el && !$("body").find("table.card td:not(:hidden)").eq(index+1).hasClass("card-left") && !$("body").find("table.card td:not(:hidden)").eq(index+1).hasClass("contact-name")) {
                    $temp_value += ", ";
                }
                
                if ($("body").find("table.card td:not(:hidden)").eq(index+1).hasClass("card-left") || $("body").find("table.card td:not(:hidden)").eq(index+1).hasClass("contact-name")){
                    $temp_value += "\n";
                }
            });
            $temp.val($temp_value);
            $temp.trigger("select");
            document.execCommand("copy");
            console.log($temp_value);
            $temp.remove();
            toastr["info"]('<div>Скопировано в буфер обмена</div>');
        } catch (e) {
            toastr["error"]('<div>Произошла ошибка!<br>Пожалуйста, попробуйте ещё раз</div>');
            console.log(e.name + ": " + e.message);
        }
        
    },
 //
    
    _onEditButtonClick: function (e) {
      //Needs to be defined first to capture width before changes are applied
      var inputFieldWidth = this._inputFieldWidth = this._container.offsetWidth - 2*19;

      this._contentNode.style.display = "none";
      this._userActionButtons.style.display = "none";

      var wrapper = this._wrapper;
      var editScreen = this._editScreen = L.DomUtil.create('div', 'leaflet-popup-edit-screen', wrapper)
      var inputField = this._inputField = L.DomUtil.create('div', 'leaflet-popup-input', editScreen);
      editScreen.innerHTML = this.getContent();

      //  -----------  Making the input field grow till max width ------- //
      editScreen.style.width = inputFieldWidth + 'px';
      var inputFieldDiv = L.DomUtil.get(this._inputField);

      // create invisible div to measure the text width in pixels
      var ruler = L.DomUtil.create('div', 'leaflet-popup-input-ruler', editScreen);

      var inputActions = this._inputActions = L.DomUtil.create('div', 'leaflet-popup-input-actions', editScreen);
      var saveButton = this._saveButton = L.DomUtil.create('a', 'leaflet-popup-input-save', inputActions);
      saveButton.href = "#save";
      saveButton.innerHTML = 'Сохранить';
      var cancelButton = this._cancelButton = L.DomUtil.create('a', 'leaflet-popup-input-cancel', inputActions);
      cancelButton.href = '#cancel';
      cancelButton.innerHTML = 'Не сохранять';

        let _card = $(editScreen).find("table.card");
        _card.find(":hidden").show();
        if (_card.find("td.card-left.contact").prop("rowspan")<3) {
            _card.find("td.card-left.contact").prop("rowspan", 3);
        }
        _card.find("span").each(function(index){
            $(this).replaceWith(function(){
                    let _i;
                    if($(this.parentNode).next().hasClass("plus-minus") && !$(this).hasClass("jr")){
                        _i = '<input class="' + $.trim($(this).attr("class")) + '" value="' + $.trim($(this).text()) + '"/>';
                    } else {
                        _i = '<textarea rows="1" class="' + $.trim($(this).attr("class")) + '">' + $.trim($(this).text()) + '</textarea>';
                }
                return _i;
            });
        });
        _card.find("textarea.comment").prop("rows", "2");
        _card.find("textarea.company").prop("placeholder", "Поставщик рогов и копыт");
        _card.find("textarea.jr").prop("placeholder", 'ООО «Рога и Копыта»');
        _card.find("input.address").prop("placeholder", "Москва, 3-я улица Строителей, д. 25, кв. 12");
        _card.find("input.place").prop("placeholder", "Станция метро или ж/д");
        _card.find("input.contact-name").prop("placeholder", "Евгений Лукашин");
        _card.find("input.contact-number").prop("placeholder", "+7(012)345-67-89, доб. 12345");
        _card.find("input.contact-mail").prop("placeholder", "contact@contact.com");
        _card.find("textarea.comment").prop("placeholder", "Не путать с поставщиком в Петербурге, адреса совпадают!");
        $("body").trigger("card.cloned");

        L.DomEvent.on(cancelButton, 'click', this._onCancelButtonClick, this);
        L.DomEvent.on(saveButton, 'click', this._onSaveButtonClick, this);

    let valueTimestamp = parseInt(_card.attr("data-id"));
    let tx = db.transaction(['notes'], 'readonly');
    // описываем обработчики на завершение транзакции
    tx.oncomplete = (event) => {
    //console.log('Transaction completed.')
    };
    tx.onerror = function(event) {
    alert('error in cursor request ' + event.target.errorCode);
    };
  // создаем хранилище объектов по транзакции
  let store = tx.objectStore('notes');
  let index = store.index("timestamp");
  // получаем ключ записи
  let req = index.getKey(valueTimestamp);
  req.onsuccess = (event) => {  
    let request = store.get(req.result);
    request.onerror = function(event) {};
    request.onsuccess = function(event) {
      //чтобы не трогать координаты    
      MarkerCoords = request.result.coords;
    };
  }
      this.update();
      L.DomEvent.stop(e);
   },


    _onCancelButtonClick: function (e) {
        L.DomUtil.remove(this._editScreen);
        this._contentNode.style.display = "block";
        this._userActionButtons.style.display = "flex";

        this.update();
        L.DomEvent.stop(e);
    },

   _onSaveButtonClick: function (e) {
       try {
           updateNote(e);
           
       } catch (e) {
           console.log(e.name + ": " + e.message);
       }
       
    var editScreen = this._editScreen.firstElementChild;
    $(editScreen).children().find("input, textarea").each(function( index ) {
        $(this).replaceWith(function(){
            return '<span class="' + $(this).attr("class") + '">' + $(this).val() + '</span>';
        });
    });
    $(editScreen).children().find(".plus-minus").each(function( index ) {
        $(this).prop("hidden", "true");
    });
      this.setContent(editScreen.outerHTML);

      L.DomUtil.remove(this._editScreen);
      this._contentNode.style.display = "block";
      this._userActionButtons.style.display = "flex";

      this.update();
      L.DomEvent.stop(e);
      //setTimeout(() => location.reload(), 350);
      //setTimeout(() => getAndDisplayNotes(db), 350);
      //  ---------------------End my additions --------------------------------------- //


   }
})

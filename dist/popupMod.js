//  Adding new options to the default options of a popup
L.Popup.mergeOptions({
   removable: false,
   editable: false
})

// Modifying the popup mechanics
L.Popup.include({


   // modifying the _initLayout method to include edit and remove buttons, if those options are enabled

   //  ----------------    Source code  ---------------------------- //
   // original from https://github.com/Leaflet/Leaflet/blob/master/src/layer/Popup.js
   _initLayout: function () {
      var prefix = 'leaflet-popup',
          container = this._container = L.DomUtil.create('div',
         prefix + ' ' + (this.options.className || '') +
         ' leaflet-zoom-animated');

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

      if (this.options.removable && !this.options.editable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = '<div class="remove-icon"><img src="../demo/remove-icon.svg"/><span>Удалить</span></div>';
         this.options.minWidth = 110;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
      }

      if (this.options.editable && !this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = '<div class="edit-icon"><img src="../demo/edit-icon.svg"/><span>Изменить</span></div>';

         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
      }

      if (this.options.editable && this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = '<div class="edit-icon"><span>Изменить</span></div>';
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = '<div class="remove-icon"><span>Удалить</span></div>';
         this.options.minWidth = 160;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
      }
   },

   _onRemoveButtonClick: function (e) {
       if(confirm('Вы уверены? Удалить?'))
       {
           deleteNote(e);
           this._source.remove();
           L.DomEvent.stop(e);
       }
   },

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
      editScreen.style.margin = "19px 19px 4px 19px";
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
      _card.find(".plus-minus").removeAttr("hidden");
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
      try{updateNote(e);} catch (e) {console.log(e.name + ": " + e.message);}
       
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

      //  ---------------------End my additions --------------------------------------- //


   }
})

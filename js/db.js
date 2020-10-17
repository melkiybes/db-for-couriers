let db;
let dbReq = indexedDB.open('myDatabase', 1);
toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-center",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "1000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
dbReq.onupgradeneeded = (event) => {
  db = event.target.result;
  // Создадим хранилище объектов notes или получим его, если оно уже существует.
  let notes;
  if (!db.objectStoreNames.contains('notes')) {
    notes = db.createObjectStore('notes', {autoIncrement: true});
  } else {
    notes = dbReq.transaction.objectStore('notes');
  }
  // Если в notes еще нет индекса timestamp создадим его
  if (!notes.indexNames.contains('timestamp')) {
    notes.createIndex('timestamp', 'timestamp');
  }
}

dbReq.onsuccess = (event) => {
  db = event.target.result;
  // Когда база данных будет готова, отобразите заметки, которые у нас уже есть!
  getAndDisplayNotes(db);
}

dbReq.onerror = (event) => {
  console.log('error opening database ' + event.target.errorCode);
}

//собственно добавление записи в БД
const addStickyNote = (db, object) => {
  // Запустим транзакцию базы данных и получите хранилище объектов Notes
  let tx = db.transaction(['notes'], 'readwrite');
  let store = tx.objectStore('notes');
  // Добаляем заметку в хранилище объектов
  object.timestamp = Date.now();
  store.add(object);
  // Ожидаем завершения транзакции базы данных
  tx.oncomplete = () => {
	getAndDisplayNotes(db);
  }
  
  tx.onerror = (event) => {
    console.log('error storing note ' + event.target.errorCode);
  }
}

//получение-отображение записей, при обновлении данных вызвать именно ее
const getAndDisplayNotes = (db) => {
  $(".leaflet-marker-pane, .leaflet-shadow-pane").html("");
  let tx = db.transaction(['notes'], 'readonly');
  let store = tx.objectStore('notes');

  // Получим индекс заметок, чтобы запустить наш запрос курсора;
  // результаты будут упорядочены по метке времени
  let index = store.index('timestamp');

  // Создайте запрос open_Cursor по индексу, а не по основному
  // хранилище объектов.
  let req = index.openCursor(null);
  let allNotes = [];
  req.onsuccess = (event) => {
    // Результатом req.onsuccess в запросах openCursor является
     // IDBCursor
    let cursor = event.target.result;
    if (cursor != null) {
      // Если курсор не нулевой, мы получили элемент.
      allNotes.push(cursor.value);
      cursor.continue();
    } else {
      // Если у нас нулевой курсор, это означает, что мы получили
      // все данные, поэтому отображаем заметки, которые мы получили.
      displayNotes(allNotes);
    }
  }
  req.onerror = (event) => {
    console.log('error in cursor request ' + event.target.errorCode);
  }
}

//для перебора вложенных объектов
function getFiniteValue (obj) {
	let _r = [];
    getProp(obj);
    
    function getProp(o) {
        for(var _property in o) {
            if(typeof(o[_property]) === 'object') {
                getProp(o[_property]);
            } else {
            	if (_property != "lat" && _property != "lng" && _property != "timestamp"){
                _r.push(o[_property]);
                }
            }
        }
    }
    //console.log(_r);
    return _r;
}

//отображение записей на странице в виде элементов
const displayNotes = (notes) => {
  let _card = '';
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    //собираем все данные в массив
    let _cardArray = getFiniteValue(note);
    //создаем оболочку для будущего контента
    let _cardDiv = document.createElement("div");
    _cardDiv.append(document.getElementById('card_template').content.cloneNode(true));
    $(_cardDiv).children(".card").eq(0).attr("data-id", note.timestamp);
    
    if (note.company == ""){
    	$(_cardDiv).find(".company-string").eq(0).hide();
    }
    if (note.jr.jr1 == ""){
    	$(_cardDiv).find(".jr-string").eq(0).hide();
    }
    if (note.address == ""){
    	$(_cardDiv).find(".address-string").eq(0).hide();
    }
    if (note.place.place1 == ""){
    	$(_cardDiv).find(".place-string").eq(0).hide();
    }
    if (note.contact.contact1 == ""){
    	$(_cardDiv).find(".contact-name-string").eq(0).hide();
        $(_cardDiv).find("td.card-left.contact").prop('rowspan', $(_cardDiv).find("td.card-left.contact").prop('rowspan') - 1);
    }
    if (note.contact.contact2 == ""){
    	$(_cardDiv).find(".contact-number-string").eq(0).hide();
        $(_cardDiv).find("td.card-left.contact").prop('rowspan', $(_cardDiv).find("td.card-left.contact").prop('rowspan') - 1);
    }
    if (note.contact.contact3 == ""){
    	$(_cardDiv).find(".contact-mail-string").eq(0).hide();
        $(_cardDiv).find("td.card-left.contact").prop('rowspan', $(_cardDiv).find("td.card-left.contact").prop('rowspan') - 1);
    }
    if (note.contact.contact1 == "" && note.contact.contact2 == "" && note.contact.contact3 == ""){
        $(_cardDiv).find("td.card-left.contact").eq(0).hide();
        $(_cardDiv).find(".contaсt-name-string").eq(0).hide();
    }
    if (note.comment == ""){
    	$(_cardDiv).find(".comment-string").eq(0).hide();
    }
    
    //просчитываем дополнительно добавленное
    let _JNum = 0;   
    let _PNum = 0;
    let _CNum = 0;
    for (let i in note.jr){
        _JNum++;
    }
    for (let i in note.place){
        _PNum++;
    }
    for (let i in note.contact){
        _CNum++;
    }
    if (_JNum > 1){
        for (let i = 0; i<(_JNum-1); i++){
            let A = $(_cardDiv).children().find("textarea.jr").eq(i);
            let T = A.parents("table").find("tr[class$='jr-string']");
            let NewString = $('<tr class="card jr-string added"></tr>').insertAfter(T);
            let NewStringLeftCell = $('<td class="card card-right jr added"></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            let _Text = $('<textarea class="jr" rows="1" placeholder="ООО «Рога и Копыта»"></textarea>').appendTo(NewStringLeftCell);
            T.children().eq(0).prop("rowspan", T.children().eq(0).prop("rowspan")-1+2);
        }
    }
    if (_PNum > 1){
        for (let i = 0; i<(_PNum-1); i++){
            let A = $(_cardDiv).children().find("input.place").eq(i);
            let T = A.parents("table").find("tr.place-string");
            let NewString = $('<tr class="card place-string added"></tr>').insertAfter(T);
            let NewStringLeftCell = $('<td class="card card-right place added"></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            var P = $('<input class="place" placeholder="Станция метро или ж/д"/>').appendTo(NewStringLeftCell);
            T.children().eq(0).prop("rowspan", T.children().eq(0).prop("rowspan")-1+2);
        }
    }
    if (_CNum > 3){
        for (let i = 0; i<(_CNum-3); i++){
            let A = $(_cardDiv).children().find("input.contact").eq(i);
            let T = A.parents("table").find("tr[class*='contact']").last();
            //console.log(A.parents("table").find("tr[class*='name']").eq(0).children(".card-left").eq(0));
            let NewString = $('<tr class="card contact-' + note.contact["contact" + parseInt(i+4)].split(' ')[0].trim() + '-string added"></tr>').insertAfter(T);
            let NewStringLeftCell = $('<td class="card card-right contact-' + note.contact["contact" + parseInt(i+4)].replace(/(\s\S*)+/g, "") + ' added"></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            if (note.contact["contact" + parseInt(i+4)].split(' ')[0].trim() == "name") {
                let C = $('<input class="contact contact-name" placeholder="Евгений Лукашин"/>').appendTo(NewStringLeftCell);
            } else if (note.contact["contact" + parseInt(i+4)].split(' ')[0].trim() == "number") {
                let C = $('<input class="contact contact-number" placeholder="+7(012)345-67-89, доб. 12345"/>').appendTo(NewStringLeftCell);
            } else if (note.contact["contact" + parseInt(i+4)].split(' ')[0].trim() == "mail") {
                let C = $('<input class="contact contact-mail" placeholder="contact@contact.com" />').appendTo(NewStringLeftCell);
            }
            A.parents("table").find("tr[class*='name']").eq(0).children(".card-left").eq(0).prop("rowspan", A.parents("table").find("tr[class*='name']").eq(0).children(".card-left").eq(0).prop("rowspan")-1+2);
        }
    }
    //console.log(note + ': JR = '+_JNum + ', PLACE = '+_PNum+', CONTACT = '+_CNum);
    //собственно, превращаем, что положено, в простой текст
    $(_cardDiv).children().find("input, textarea").each(function( index ) {
        try {
            $(this).replaceWith(function(){
                let _PClass;
                if (_cardArray[0].match(/line.+/)){
                    _PClass = 'line ' + _cardArray[0].split(' ')[0];
                    _cardArray[0] = _cardArray[0].match(/(\s\S*)+/)[0];
                } else if (_cardArray[0].match(/(name|number|mail).+/)) {
                    _PClass = '';
                    _cardArray[0] = _cardArray[0].match(/(\s\S*)+/)[0];
                } else {
                    _PClass = '';
                }
                //console.log("_cardArray[0]: " + _cardArray[0].toString());
                return '<span class="' + $(this).attr("class") + ' ' + _PClass + '">' + _cardArray.shift()+'</span>';
            });
        } catch (e) {
            console.log("Error: " + e);
        }
    });
    $(_cardDiv).children().find(".plus-minus").each(function( index ) {
        $(this).prop("hidden", "true");
    });
    try {
        let _cardP = L.popup().setContent(_cardDiv.innerHTML);
        let marker = L.marker(note.coords);
        marker.bindPopup(_cardP, {removable: true, editable: true, copyable: true});
        marker.addTo(map);
        $(marker._icon).attr("data-id", note.timestamp);
        _cardArray = [];
    } catch (e) {
    	console.log("Error: " + e);
    }
  }
}

//удаление записи в БД
const deleteNote = (event) => {
  // получаем признак выбранной записи
  const valueTimestamp = parseInt($(event.target.parentNode.parentNode).siblings().children("table.card")[0].getAttribute('data-id'));
  // открываем транзакцию чтения/записи БД, готовую к удалению данных
  const tx = db.transaction(['notes'], 'readwrite');
  // описываем обработчики на завершение транзакции
  tx.oncomplete = (event) => {
    console.log('Transaction completed.')
    getAndDisplayNotes(db);
  };
  tx.onerror = function(event) {
    alert('error in cursor request ' + event.target.errorCode);
  };
  // создаем хранилище объектов по транзакции
  const store = tx.objectStore('notes');
  const index = store.index("timestamp");
  
  // получаем ключ записи
  const req = index.getKey(valueTimestamp);
  req.onsuccess = (event) => {  
    const key = req.result;
    // выполняем запрос на удаление указанной записи из хранилища объектов
    let deleteRequest = store.delete(key);
    deleteRequest.onsuccess = (event) => {
      // обрабатываем успех нашего запроса на удаление
      console.log('Delete request successful');
      var eventUpdate = new Event('click');
      setTimeout(() => {document.getElementsByClassName("leaflet-popup-close-button")[0].dispatchEvent(eventUpdate); getAndDisplayNotes(db); }, 350);
      toastr["info"]('<div>Элемент успешно удалён</div>');
    }
  }
}

//обновление записи в БД при изменении данных
const updateNote = (event) => {
  // получаем признак выбранной записи
  const valueTimestamp = parseInt($(event.target.parentNode.parentNode).find("table.card").attr("data-id"));
  // открываем транзакцию чтения/записи БД, готовую к удалению данных
  const tx = db.transaction(['notes'], 'readwrite');
  // описываем обработчики на завершение транзакции
  tx.oncomplete = (event) => {
    console.log('Transaction completed.')
    getAndDisplayNotes(db);
  };
  tx.onerror = function(event) {
    alert('error in cursor request ' + event.target.errorCode);
  };
  // создаем хранилище объектов по транзакции
  const store = tx.objectStore('notes');
  const index = store.index("timestamp");
  // получаем ключ записи
  const req = index.getKey(valueTimestamp);
  const object = getAnObject($(event.target).parents(".leaflet-popup-edit-screen").find("table.card").eq(0));
  //console.log(object);
  req.onsuccess = (event) => {  
    let request = store.get(req.result);
    request.onerror = function(event) {};
    request.onsuccess = function(event) {
      //чтобы не трогать координаты    
      object.timestamp = request.result.timestamp;
    };
    // выполняем запрос на перезапись указанной записи (эх, тавтология) из хранилища объектов
    let updateRequest = store.put(object, req.result);
    updateRequest.onsuccess = (event) => {
      // обрабатываем успех нашего запроса
      //console.log(updateRequest.result);
      toastr["info"]('<div>Элемент успешно изменён</div>');
      var eventUpdate = new Event('click');
      setTimeout(() => {getAndDisplayNotes(db);  document.getElementsByClassName("leaflet-popup-close-button")[0].dispatchEvent(eventUpdate);}, 350);
    }
  }
}

const getAnObject = (_card) => {
    //console.log(_card);
    try {
        let _O = {};
        let _J_Obj = {};
        let _P_Obj = {};
        let _C_Obj = {};
        let _JNum = 0;   
        let _PNum = 0;
        let _CNum = 0;
        let _J1 = $(_card).find("input, textarea").filter('.jr')[0];
        let _P1 = $(_card).find("input, textarea").filter('.place')[0];
        let _C1 = $(_card).find("input, textarea").filter('[class^="contact"]')[0];
        $(_card).find("input, textarea").each(function( index ) {
            if ($(this).hasClass("jr")) {            
                this == _J1 ? _JNum = 1 : _JNum++;
                _J_Obj["jr" + _JNum] = $(this).val().toString();
            } else if ($(this).hasClass("place")) {            
                this == _P1 ? _PNum = 1 : _PNum++;
                _P_Obj["place" + _PNum] = lastClass($(this)) + " " + $(this).val();
            } else if ($(this).hasClass("contact")) {            
                this == _C1 ? _CNum = 1 : _CNum++;
                _C_Obj["contact" + _CNum] = $(this).prop("class").replace("contact contact-",'')  + " " + $(this).val().toString();
                if($(this).val().toString() == "") _C_Obj["contact" + _CNum] = "" ;
            }
            //$(this).prop("readonly", "readonly");
            //$(this).off();
        });
        $(_card).find("input, textarea").filter('.company').eq(0).val() === undefined ? _O.company = '' : _O.company = $(_card).find("input, textarea").filter('.company').eq(0).val();
        _J_Obj === undefined ? _O.jr = '' : _O.jr = _J_Obj;
        $(_card).find("input, textarea").filter('.address').eq(0).val() === undefined ? _O.address = '' : _O.address = $(_card).find("input, textarea").filter('.address').eq(0).val();
        //_P_Obj === undefined ? _O.place = '' : _O.place = _P_Obj;
        if ($(_P1).val() == ''){
            _P_Obj.place1 = '';
            _O.place = _P_Obj;
        } else {
            _O.place = _P_Obj;
        }
        if ($(_C1).val() == ''){
            _C_Obj.contact1 = '';
            _O.contact = _C_Obj;
        } else {
            _O.contact = _C_Obj;
        }
        $(_card).find("input, textarea").filter('.comment').eq(0).val() === undefined ? _O.comment = '' : _O.comment = $(_card).find("input, textarea").filter('.comment').eq(0).val();
        if (!areCoordsStrict){
            _O.coords = MarkerCoords;
        } else {
            MarkerCoords.lat = $(_card).find("input, textarea").filter('.lat').eq(0).val();
            MarkerCoords.lng = $(_card).find("input, textarea").filter('.lng').eq(0).val();
            _O.coords = MarkerCoords;
        }
        _O.timestamp = Date.now();
        return _O;
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

$("body").on("click", ".modal-buttons #add-modal", function(e){
    let _O = getAnObject($(e.target).parents("table").siblings()[0]);
    console.log(_O);
    addStickyNote(db, _O);
    modalWindow.close();
});

/*{
    company: "",
    jr: {
        jr1: "",
        jr2: "",
        jr3: "",
    },
    address: "",
    place: {
        place1: "line2 Ховрино",
        
    },
    contact: {
        contact1: "name Zaz",
        contact2: "number +7",
        contact3: "mail za",
        contact4: "mail za2",...
    },
    comment: "",
    coords: {
        lat: "",
        lon: ""
    },
    timestamp: Date.now()
}*/
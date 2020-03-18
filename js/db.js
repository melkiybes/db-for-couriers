let db;
let dbReq = indexedDB.open('myDatabase', 1);

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
            let NewStringLeftCell = $('<td></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            let _Text = $('<textarea class="jr" rows="1" placeholder="ООО «Рога и Копыта»"></textarea>').appendTo(NewStringLeftCell);
            T.children().eq(0).prop("rowspan", T.children().eq(0).prop("rowspan")-1+2);
        }
    }
    if (_PNum > 1){
        for (let i = 0; i<(_PNum-1); i++){
            let A = $(_cardDiv).children().find("input.place").eq(i);
            let T = A.parents("table").find("tr[class$='place-string']");
            let NewString = $('<tr class="card place-string added"></tr>').insertAfter(T);
            let NewStringLeftCell = $('<td></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            var P = $('<input class="place" placeholder="Станция метро или ж/д"/>').appendTo(NewStringLeftCell);
            T.children().eq(0).prop("rowspan", T.children().eq(0).prop("rowspan")-1+2);
        }
    }
    if (_CNum > 2){
        for (let i = 0; i<(_CNum-2); i+=2){
            let A = $(_cardDiv).children().find("input.contact").eq(i);
            let T = A.parents("table").find("tr[class$='contact-string']");
            let NewString = $('<tr class="card contact-string added"></tr>').insertAfter(T);
            let NewStringLeftCell = $('<td></td>').appendTo(NewString);
            $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
            let C = $('<input class="contact contact-name" placeholder="Евгений Лукашин"/><BR><input class="contact contact-number" placeholder="+7(012)345-67-89, доб. 12345"/>').appendTo(NewStringLeftCell);
            T.children().eq(0).prop("rowspan", T.children().eq(0).prop("rowspan")-1+2);
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
                    _cardArray[0] = _cardArray[0].split(' ')[1];
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
        marker.bindPopup(_cardP, {removable: true, editable: true});
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
      getAndDisplayNotes(db);
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
                _C_Obj["contact" + _CNum] = $(this).val().toString();
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
            _C_Obj.contact2 = '';
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
        contact1: "name1",
        contact2: "phone1",
        contact3: "name2",
    },
    comment: "",
    coords: {
        lat: "",
        lon: ""
    },
    timestamp: Date.now()
}*/
L.Control.Card = L.Control.extend({
  onAdd: function(map) {
    var _C = L.DomUtil.create("div");

    _C.innerHTML =
      '<button class="add-card"><img class="add-icon" src="imgs/edit.svg"/>Добавить адрес</button><button class="add-card"><img class="ex-icon" src="imgs/save.svg"/>Сохранить в файл</button><input name="open-file" id="open-file" type="file" accept="application/json, text/json" class="add-card"/><label for="open-file" class="add-card"><img class="im-icon" src="imgs/import.svg"/>Открыть из файла</label>';
    L.DomEvent.on(_C.firstElementChild, "click", function() {
      modalWindow.show($("#card_template").html() + $("#modal-buttons-template").html());
      $("#modalwindow").trigger("card.cloned");
      $("#modalwindow .card .test").trigger("myAdd");
    });
    L.DomEvent.on(_C.firstElementChild.nextElementSibling, "click", function() {
        try {
          // export to JSON, clear database, and import from JSON
          const blob = exportToJsonString(db, function(err, jsonString) {
            if (err) {
              console.error(err);
            } else {
              console.log('Exported as JSON: ' + JSON.stringify(jsonString, null, 2));
              download(jsonString, "database.json", "application/json");
            }
          });
        } catch (e) {
            console.log(e.name + ": " + e.message);
        }
    });
    L.DomEvent.on(_C.lastElementChild.previousElementSibling, "change", function() {
      try {
        let _File = this.files[0];
        let _Reader = new FileReader();
        _Reader.readAsText(_File);
        _Reader.onload = function() {
            //console.log(_Reader.result);
            clearDatabase(db, function(err) {
                if (!err) { // cleared data successfully
                getAndDisplayNotes(db);
                importFromJsonString(db, _Reader.result, function(err) {
                    if (!err) {
                      console.log('Imported data successfully');
                      getAndDisplayNotes(db);
                      location.reload();
                    }
                  });
                }
            });
        };
      } catch (e) {
        console.log(e.name + ": " + e.message);
      }
    });
    return _C;
  },

  onRemove: function(map) {
    L.DomEvent.off(_C, "click");
  }
});

L.control.card = function(opts) {
  return new L.Control.Watermark(opts);
};

function progressCallback ({totalRows, completedRows}) {
  console.log(`Progress: ${completedRows} of ${totalRows} rows completed`);
}
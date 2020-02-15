L.Control.Watermark = L.Control.extend({
    onAdd: function(map) {
        var _C = L.DomUtil.create('div');

        _C.innerHTML = '<button class="add-card"><div class="add-icon"><span>Добавить адрес</span></div></button>';
        L.DomEvent.on(_C, 'click', function() {
            	modalWindow.show($("#card_template").html() + $("#modal-buttons-template").html());
				$("#modalwindow").trigger("card.cloned");
				$("#modalwindow .card .test").trigger("myAdd");
            }
          );
        return _C;
    },

    onRemove: function(map) {
        L.DomEvent.off(_C, 'click');
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}
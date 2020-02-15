//переменная, хранящая координаты добавляемого с карты адреса
var MarkerCoords = {};

//обработка нажатия на плюс
$("body").on("click", ".card img[src$='plus.svg']", function(e){
        let T = $(e.target.parentNode.parentNode.firstElementChild);
        let A;
        if(T.attr("rowspan") == 1){
        	A = $(e.target.parentNode.parentNode);
        } else {
        	A = $(e.target.parentNode.parentNode).nextUntil("[class$='string']").eq(-1);
        }
        let NewString = $('<tr></tr>').insertAfter(A);
        NewString.attr("class", T.attr("class")+"-string").addClass("added").removeClass("card-left");
        let NewStringLeftCell = $('<td></td>').appendTo(NewString);
        NewStringLeftCell.attr("class", T.attr("class")).addClass("added card-right").removeClass("card-left");
        $('<td class="plus-minus"><img src="../imgs/minus.svg"/></td>').appendTo(NewString);
        if (NewStringLeftCell.hasClass("place")) {
			var P = $('<input class="test" placeholder="Станция метро или ж/д"/>').appendTo(NewStringLeftCell);
			P.trigger("myAdd");
        } else if (NewStringLeftCell.hasClass("contact")){
			var C = $('<input class="contact-name" placeholder="Анна Андреева"/><BR><input class="contact-number" placeholder="+7(012)345-67-89, доб. 12345"/>').appendTo(NewStringLeftCell);
			C.eq(-1).mask('+7(000)000-00-00, доб. ZZZZZ', {
	translation: {
		'Z': { pattern: /[0-9]/, optional: true }
	}
});
		} else {
        	var Textarea = $('<textarea rows="1" placeholder="ООО «А-Стиль»"></textarea>').appendTo(NewStringLeftCell);
        	autosize(Textarea);
        }
    //костыль против превращения в строку
    T.attr("rowspan", T.attr("rowspan")-1+2);
    $("body").trigger("card.sizeChanged");
    //отладка
    //let E = NewString.children().first().children().first();
    //E.text($(".card").find(".place").children().first().attr("class"));
	});

//обработка нажатия на минус
	$("body").on("click", ".card img[src$='minus.svg']", function(e){
	 //if(confirm("Вы уверены? Удалить?")){
		let T = $(e.target.parentNode.parentNode).prevAll('[class$="string"]').eq(0).children("[rowspan]");
		T.attr("rowspan", T.attr("rowspan") -1);
		$(e.target).css("background-color", "red");
		$(e.target.parentNode.parentNode).remove();
	//}
	$("body").trigger("card.sizeChanged");
});
	
//маска для ввода телефона
$('.card .contact-number').mask('+7(000)000-00-00, доб. ZZZZZ', {
	translation: {
		'Z': { pattern: /[0-9]/, optional: true }
	}
});

//автоувеличение текстовых полей
autosize($(".card textarea"));

//при открытии Добавления
$("body").on("card.cloned", function(){
	$('.card .contact-number').mask('+7(000)000-00-00, доб. ZZZZZ', {
		translation: {
			'Z': { pattern: /[0-9]/, optional: true }
		}
	});
	$(".card .place").trigger("myAdd");
	autosize($(".card textarea"));
	
	//подсказки адресов, дадата
	$(".card input.address").suggestions({
        token: "5be2ce48996a832e4540a833f0e33420585bd113",
        type: "ADDRESS",
        addon: "none",
        width: "100%",
        // Вызывается, когда пользователь выбирает одну из подсказок
        onSelect: function(suggestion) {
        	MarkerCoords.lat = suggestion.data.geo_lat;
        	MarkerCoords.lng = suggestion.data.geo_lon;
        },
        constraints: [
      // Москва
      {
        locations: { kladr_id: '77' },
        deletable: false
      },
      // Московская область
      {
        locations: { kladr_id: '50' },
        deletable: false
      }
    ]
    });
});


	//обработка кнопок внутри Добавления
	$("body").on("click", ".modal-buttons #close-modal", function(){
		modalWindow.close();
	});
	var _CardArray = [];
	$("body").on("click", ".modal-buttons #add-modal", function(){
	$("#modalwindow .card input, #modalwindow .card textarea").each(function( index ) {
  	//console.log($(this).val());
 	 $(this).prop("disabled", "true");
 	 _CardArray.push($(this).val());
});
	 //console.log(_CardArray);
	  $("#modalwindow .card img").each(function( index ) {
		$(this).prop("hidden", "true");
	});
      modalWindow.close();
      try{
		var _cardDiv = document.createElement("div");
      $("#modalwindow table.card").clone(true, true).appendTo(_cardDiv);
      var _cardP = L.popup().setContent(_cardDiv.innerHTML);
      marker = L.marker(MarkerCoords);
	  marker.bindPopup(_cardP, {removable: true, editable: true});
	  marker.addTo(map);
	  marker.openPopup();
	} catch (err) {
		console.log("Error: " + err);
	}
});

//нечто для скачивания
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
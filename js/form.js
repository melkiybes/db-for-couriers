//переменная, хранящая координаты добавляемого с карты адреса
var MarkerCoords = {};
//определение параметров поиска в дадате, задается позже
var _Suggest;

$("body").on("card.sizeChanged", function(){
	$("#modalwindow").css("margin-top", -($("#modalwindow").height() / 2) + 'px');
	//console.log($("#modalwindow").css("margin-top"));
});

//обработка нажатия на плюс
$("body").on("click", ".card img[src$='plus.svg']", function(e){
	//где создать новые строки и что при этом увеличить
    let StringToAddAfter = $(e.target).closest("tr:not(.added)");
    let LeftCellToWiden = $(e.target).closest("tr:not(.added)").children(".card-left").first();
    //чтобы при создании новых почт и телефонов увеличивалась правильная ячейка
    if (StringToAddAfter.hasClass("contact-mail-string") || StringToAddAfter.hasClass("contact-number-string")) {
        LeftCellToWiden = $(e.target).closest("[class$='string']").prevAll(":not(.added):not(.contact-mail-string):not(.contact-number-string)").children(".card-left").first();
    }
    //чтобы новые строки добавлялись в конец "раздела", а не сразу после его начала
    if ((LeftCellToWiden.prop("rowspan")>1 && LeftCellToWiden.is(":not(.contact)"))){
        StringToAddAfter = $(e.target).closest("tr:not(.added)").nextUntil("tr:not(.added)").last();
    } else if ((LeftCellToWiden.hasClass("contact"))){
        StringToAddAfter = $(e.target).closest("tr").siblings(".comment-string").siblings().last();
    } else if ($("#findID").length) {
        
    }
    
    //создание новой строки, ячеек в ней и присвоение необходимых классов
    let NewString = $('<tr></tr>').insertAfter(StringToAddAfter);
    NewString.prop("class", StringToAddAfter.prop("class")).addClass("added").removeClass("card-left");
    let NewStringLeftCell = $('<td></td>').appendTo(NewString);
    NewStringLeftCell.prop("class", $(e.target).closest("tr:not(.added)").prop("class").replace('-string', '')).addClass("added card-right").removeClass("card-left");
    $('<td class="plus-minus"><img src="imgs/minus.svg"/></td>').appendTo(NewString);
    
    //заполнение добавленных строк, частные случаи
    if (NewStringLeftCell.hasClass("place")) {
        var P = $('<input class="place" placeholder="Станция метро или ж/д"/>').appendTo(NewStringLeftCell);
        P.trigger("myAdd");
    } else if (NewStringLeftCell.hasClass("contaсt-name")){
    	var CName = $('<input class="contact contact-name" placeholder="Евгений Лукашин"/>').appendTo(NewStringLeftCell);
    } else if (NewStringLeftCell.hasClass("contact-number")){
        var CNumber = $('<input class="contact contact-number" placeholder="+7(012)345-67-89, доб. 12345"/>').appendTo(NewStringLeftCell);
        CNumber.eq(-1).mask('+7(000)000-00-00, доб. ZZZZZ', { translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
	} else if (NewStringLeftCell.hasClass("contact-mail")){
        var CMail = $('<input class="contact contact-mail" placeholder="contact@contact.com"/>').appendTo(NewStringLeftCell);
	} else if (NewStringLeftCell.hasClass("jr")){
        var _Text = $('<textarea class="jr" rows="1" placeholder="ООО «Рога и Копыта»"></textarea>').appendTo(NewStringLeftCell);
        autosize(_Text);
    }
    
    //костыль против превращения в строку
    LeftCellToWiden.prop("rowspan", LeftCellToWiden.prop("rowspan")-1+2);
    $("body").trigger("card.sizeChanged");
    //отладка
    //let E = NewString.children().first().children().first();
    //E.text($(".card").find(".place").children().first().prop("class"));
});

//обработка нажатия на минус
$("body").on("click", ".card img[src$='minus.svg']", function(e){
	 //if(confirm("Вы уверены? Удалить?")){
        
		let T = $(e.target.parentNode.parentNode).prevAll('[class$="string"]:not(.added):not(.contact-mail-string):not(.contact-number-string)').eq(0).children("[rowspan]");
        
		T.prop("rowspan", T.prop("rowspan") -1);
		$(e.target.parentNode.parentNode).remove();
	//}
	$("body").trigger("card.sizeChanged");
});
	
var areCoordsStrict = false;
//ввод координат вручную, верстка
$("body").on("click", ".card img[src$='edit.svg']", function(e){
		let T = $(e.target.parentNode.parentNode.firstElementChild);
		let C = $(e.target.parentNode.previousElementSibling.firstElementChild);
		let N;
		if (!areCoordsStrict){
			T.text("Адрес с координатами");
			N = $('<br><input class="lat" placeholder="Широта (55.37584837)"><br><input class="lng" placeholder="Долгота (35.495940)">').insertAfter(C);
			C.siblings(".lat, .lng").mask('0Z.0ZZZZZZZZZZZZZZZ', {
			translation: {
				'Z': { pattern: /[0-9]/, optional: true }
			}
		});
			areCoordsStrict = true;
			$(this).off('card.StartSuggest');
			$(this).trigger('card.StopSuggest');
		} else {
			T.text("Адрес");
			N = C.siblings(".lat, .lng, br");
			N.remove();
			areCoordsStrict = false;
			$(this).off('card.StopSuggest');
			$(this).trigger('card.StartSuggest');
		}
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
$("body").trigger("card.sizeChanged");

//при открытии Добавления
$("body").on("card.cloned", function(){
	$('.card .contact-number').mask('+7(000)000-00-00, доб. ZZZZZ', {
		translation: {
			'Z': { pattern: /[0-9]/, optional: true }
		}
	});
	$(".card .place").trigger("myAdd");
	autosize($(".card textarea"));
	$("body").trigger('card.StartSuggest');
});
	
	//включение-выключение подсказок Дадаты
	$("body").on("card.StartSuggest", function(){
		//подсказки дадаты
_Suggest = $(".card input.address").suggestions({
		token: "5be2ce48996a832e4540a833f0e33420585bd113",
        type: "ADDRESS",
        addon: "none",
        width: "100%",
        // запретить автоисправление по пробелу
		triggerSelectOnSpace: false,
		// запрещаем автоподстановку по Enter
		triggerSelectOnEnter: true,
		// запретить автоисправление при выходе из текстового поля
		triggerSelectOnBlur: false,
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
}).suggestions();
		try {
			_Suggest.enable();
		} catch (e) {
			console.log($(".card input.address"));
			console.log(e.name + ": " + e.message);
		}
	});
	$("body").on("card.StopSuggest", function(){
		try {
			_Suggest.disable();
		} catch (e) {
			console.log(e.name + ": " + e.message);
		}
	});

//обработка кнопок внутри Добавления
	$("body").on("click", ".modal-buttons #close-modal", function(){
		modalWindow.close();
	});

//определяем размеры поиска, чтобы влез куда надо
let _ResizeSearch = function () {
    let _Left = $("div.leaflet-control").eq(0).width() + 30;
    let _Right = $(".add-card").eq(-1).width() + 30;
    $("#note-search, div.searchVars, div.searchBg").css("left", parseFloat(_Left) + "px");
    $("#note-search, div.searchVars, div.searchBg").css("right", parseFloat(_Right) + "px");
    $("#note-search").css("width", parseFloat($(window).width()- _Right - _Left - 15) + "px");   
    $("div.searchVars").css("width", parseFloat($(window).width()- _Right - _Left - 8) + "px");
    $("div.searchBg").css("width", parseFloat($(window).width()- _Right - _Left - 12) + "px");
}

$(document).ready(_ResizeSearch());
$(window).on("resize", function(){
    _ResizeSearch();
});

let _ResizeSearchBackground = function (Div) {
    if (Div.children().length == 0){
        $("div.searchBg").css("height", parseFloat(Div.height()) + "px");
    } else {
        $("div.searchBg").css("height", parseFloat(Div.height() + 30) + "px");
    }
}

function unpackageObject(obj) {
	let _r = {};
    getProp(obj);
    
    function getProp(o) {
        for(let prop in o) {
            if(typeof(o[prop]) === 'object') {
                getProp(o[prop]);
            } else {
            	if (prop != "lat" && prop != "lng" && prop != "timestamp" && prop != "comment" && !prop.startsWith("place") && o[prop]!=''){
                    _r[prop] = o[prop];
                }
            }
        }
    }
    return _r;
}    
    
let _SearchVars = $("<div id='myUL'></div>").insertAfter($("#myInput").eq(0));
$("#note-search").on("keyup", function() {
    let database = exportToJsonString(db, function(err, jsonString) {
        if (err) {
            console.error(err);
        } else {
            database = JSON.parse(jsonString).notes;
            let _SearchVars = $("div.searchVars").eq(0);
            let searchTerm = $("#note-search").val().toLowerCase();
            
            if(searchTerm!=''){
                let searchResult = database.filter(note => JSON.stringify(note).toLowerCase().includes(searchTerm));
                _SearchVars.html("");
                _ResizeSearchBackground(_SearchVars);
                
                for (let i = 0; i<searchResult.length; i++){
                    let _FullObject = unpackageObject(searchResult[i]);
                    //console.log(_FullObject);

                    for(key in _FullObject){
                        if(_FullObject[key].toLowerCase().includes(searchTerm.toLowerCase()) && $(".searchVars div").length < 5){
                            //$(".searchVars div").length < 5 - для вывода первых пяти вариантов
                            $("<div class='" + key.match(/[^\d]+/) + "' data-id='" + searchResult[i].timestamp + "'><img src='imgs/" + key.match(/[^\d]+/) + ".svg'><span>" + _FullObject[key] + "</span></div>").appendTo(_SearchVars);
                            $(_SearchVars).find("img").css("height", $(_SearchVars).find("img").next().height() + 5 + 'px');
                        }
                    }
                }
                if($(".search img[src$='minus.svg']").length < 1){
                    $("<img src='imgs/minus.svg'>").insertAfter("#note-search");
                    $(".search img[src$='minus.svg']").css("left", parseFloat($("#note-search").css("left")) + parseFloat($("#note-search").css("width")) - 17 + "px");
                }
                $(".search img[src$='minus.svg']").on("click", function(){
                    $("#note-search").val('');
                    searchTerm = '';
                    $("#note-search").nextAll("img[src$='minus.svg']").remove();
                    _SearchVars.html("");
                    _ResizeSearchBackground(_SearchVars);
                });
                $(".searchVars div").on("click", function(){
                    for (let i=0; i<searchResult.length; i++){
                        if(searchResult[i].timestamp == $(this).attr("data-id")){
                            let latlng = searchResult[i].coords;
                            let marker = L.marker([latlng.lat, latlng.lng]);
                            map.panTo(marker.getLatLng());
                            $("img.leaflet-marker-icon[data-id='" + searchResult[i].timestamp + "'").eq(0).trigger("click");
                        }
                    }
                });
            } else {
                _SearchVars.html("");
                $("#note-search").nextAll("img[src$='minus.svg']").remove();
            }
        _ResizeSearchBackground(_SearchVars);
        }
    });
});
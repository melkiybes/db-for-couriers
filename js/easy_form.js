$(document).ready(function() {
var options = {
  url: "https://raw.githubusercontent.com/LoranFurnier/moscow-metro-stations-json/master/stations.json",
  getValue: "name",
  list: {
    match: {
      enabled: true
    },
    sort: {
	  enabled: true
	},
    maxNumberOfElements: 3,
  },
  template: {
    type: "custom",
    method: function(value, item) {
      return "<span class='line " + item.line + "' >" + value + "</span>";
    }
  },
  theme: "square"
};
$("body").on("myAdd", ".card input.place", function(){
	$(this).easyAutocomplete(options);
});
$(".card input.place").trigger("myAdd");
});
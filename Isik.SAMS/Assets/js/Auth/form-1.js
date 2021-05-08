$(document).on("click", "#toggle-password", function (e) {
    var x = $("#Password").attr("type");
    if (x == "password") {
        $("#Password").attr("type", "text")
    } else {
        $("#Password").attr("type", "password")
    }
});




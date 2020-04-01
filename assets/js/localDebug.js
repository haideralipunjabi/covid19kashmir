$(document).ready(function(){
    if(window.location.href.includes("localhost")||window.location.href.includes("127.0.0.1")){
        $("#include-navbar").load("navbar.html")
        $("#include-header").load("header.html")
        $("#include-footer").load("footer.html")

    }
})
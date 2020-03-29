$(document).ready(function(){
    if(!window.location.href.includes("covidkashmir.netlify.com")){
        $("#include-header").load("/header.html")
        $("#include-navbar").load("/navbar.html")
        $("#include-footer").load("/footer.html")

    }
})

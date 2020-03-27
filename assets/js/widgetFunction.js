 function blink_text() {
    $('.blink').fadeOut(700);
    $('.blink').fadeIn(700);
}
setInterval(blink_text, 1000);
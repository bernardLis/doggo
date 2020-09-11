var click = new Howl({
    src: 'static/audio/click.wav',
    autoplay: false,
    volume: 0.5
});
var accept = new Howl({
    src: 'static/audio/Collect_Point_00.wav',
    autoplay: false,
    volume: 0.5
});


var myCards = document.getElementsByClassName("myCard");
var len = myCards.length
for (var i = 0; i < len; i++)
{
  myCards[i].addEventListener("mouseenter", function()
  {
    click.play();
  });
  myCards[i].addEventListener("click", function()
  {
    accept.play();
  });
}

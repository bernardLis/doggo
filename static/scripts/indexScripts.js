
// media
var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

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
  myCards[i].addEventListener("click", function(e)
  {
    // preventing navigation to play a sound
    e.preventDefault();
    var goTo = this.parentNode.getAttribute("href");
    // sound
    accept.play();
    // navigate after 0.3 sec
    setTimeout(function(){
         window.location = goTo;
    }, 300);
  });
}

/* ## Media ## */
// For devices with screen width of less than 1000px
if (screenWidth < 1001)
{
  // remove padding from the main wrapper
  var main = document.getElementById("main");
  main.classList.remove("p-5");
  main.classList.remove("container");
}

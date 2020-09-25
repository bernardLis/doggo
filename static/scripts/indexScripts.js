// media
var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

/* ## Audio ## */
var game = {};
game.audioMuted = false;

var click = new Howl({
    src: 'static/audio/click.wav',
    autoplay: false,
    volume: 1
});
var accept = new Howl({
    src: 'static/audio/Collect_Point_00.wav',
    autoplay: false,
    volume: 0.5
});

// Toggle sound
var toggleSound = document.getElementById("toggleSound");
var toggleSoundIcon = document.getElementById("toggleSoundIcon");
var toggleSoundSpan = document.getElementById("toggleSoundSpan");
toggleSound.addEventListener("click", function()
{
  if(game.audioMuted)
  {
    toggleSoundIcon.classList.remove("fa-volume-mute");
    toggleSoundIcon.classList.add("fa-volume-up");
    toggleSoundSpan.innerHTML = "Mute";
    game.audioMuted = false;
  }
  else
  {
    toggleSoundIcon.classList.remove("fa-volume-up");
    toggleSoundIcon.classList.add("fa-volume-mute");
    toggleSoundSpan.innerHTML = "Unmute";
    game.audioMuted = true;
  }
});


var myCards = document.getElementsByClassName("myCard");
var len = myCards.length
for (var i = 0; i < len; i++)
{
  myCards[i].addEventListener("mouseenter", function()
  {
    if(!game.audioMuted)
    {
      click.play();
    }
  });
  myCards[i].addEventListener("click", function(e)
  {
    // preventing navigation to play a sound
    e.preventDefault();
    var goTo = this.parentNode.getAttribute("href");
    // sound
    if(!game.audioMuted)
    {
      accept.play();
    }
    // navigate after 0.3 sec
    setTimeout(function(){
         window.location = goTo;
    }, 300);
  });
}

/* ## Audio ## */
// buttons make noise
var buttons = document.getElementsByTagName('button');
for (let i = 0; i < buttons.length; i++)
{
  if(!game.audioMuted)
  {
    buttons[i].addEventListener("mouseenter", function(){
      click.play();
    })
  }
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

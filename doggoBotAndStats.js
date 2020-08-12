
// simple clicker
var myInterval = setInterval(buttonClick, 1000)
function buttonClick()
{
  var button = document.getElementById("button1");
  button.click();
}
function stopInterval()
{
  clearInterval(myInterval);
}


//winner
var myInterval = setInterval(buttonClick, 3000);
function buttonClick()
{
  var doggoLs = document.getElementsByClassName("currentDoggo");
  var doggo = doggoLs[0];
  var encryptedBreed = doggo.dataset.breed;
  var decryptedBreed = caesarShift(encryptedBreed, -4);
  var buttons = document.getElementsByClassName("breedButton");
  for (var i = 0; i < buttons.length; i++)
  {
    var value = buttons[i].value;
    if(value.localeCompare(decryptedBreed)==0)
    {
       buttons[i].click();
       return;
    }
  }
}

function stopInterval()
{
  clearInterval(myInterval);
}


//stats:
/*
* What's the thershold for score not catching up
* What should be the thershold for antibot shield
* What should the thershold for score rejection


LOCAL SERVER + 91 sec game:
**** always 1st answer clicker ****
click every 0.8 sec = 165 points && 170 && 160 && 290 && 350 && 140
- game works

**** perfect run clicker ****
click every 1.5sec = xxx points
- bot shield triggers
- game is infinity long and broken

click every 2sec = 70 980 points
- score update is broken
- the game is loooong - 6 min

click every 2.5sec =  27 825 points && 26 265 points
- bones are pretttty broken at the end game

click every 3sec =  10 725 points
- The game is not broken, score manages to update correctly.

click every 3.5sec = 5 175 points

click every 4sec = 3 705 points
*/

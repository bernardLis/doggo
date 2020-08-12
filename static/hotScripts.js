var TOOLTIP_MESSAGES =
[
  "BLIBLOP",
  "BLOPBLOP",
  "WOOPWOOP"
]

var game = {};
// game
game.currentDoggo = 0;
game.doggosRemaining = 1;
game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);

// load the game when page loads
window.addEventListener("load", function()
{
  // loading additional doggos
  flaskLoadDoggos();

  // countdown before the game start into game start
  gameStartUp();
});

function gameStartUp()
{
  // setting up the countdown overlay
  var overlay = document.getElementById("countdownOverlay");
  overlay.style.width = "100%";

  var msg = document.getElementById("countdownMsg");
  var tooltip = document.getElementById("countdownTooltip");
  var msgText = "Woof! ";

  // choosing the tooltip message from TOOLTIP_MESSAGES
  var tooltipN = Math.floor(Math.random() * game.unseenTooltips.length);
  var ttmessage = game.unseenTooltips[tooltipN];
  tooltip.innerHTML = ttmessage;
  // making sure user sees all tooltips before I start recycling them
  game.unseenTooltips.splice(tooltipN, 1);
  if (game.unseenTooltips.length == 0)
  {
    game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);
  }

  // countdown duration
  var n = 3;
  var interval = setInterval(countdown, 1000);
  function countdown()
  {
    // clearing interval and hiding the overlay
    if (n == 0)
    {
      overlay.style.width = "0%";
      msg.innerHTML = "";
      tooltip.innerHTML = "";
      msg.classList.remove("textScaling");

      clearInterval(interval);
    }
    // starting the timer and counters
    else if (n == 1)
    {
      msg.innerHTML = msgText.repeat(n);
      n--;
    }
    // setting up the breed buttons
    else if (n == 2)
    {
      msg.innerHTML = msgText.repeat(n);
      n--;
    }
    // setting up the countdown
    else
    {
      msg.innerHTML = msgText.repeat(n);

      //adding the animation
      msg.classList.add("textScaling");
      n--;
    }
  }
}

// buttons - display next doggo
// TODO: add the vote, show how many people voted in total on this dog,
var hotDogButton = document.getElementById("hotDogButton");
var notHotDogButton = document.getElementById("notHotDogButton");
hotDogButton.addEventListener("click", hotDogFn);
notHotDogButton.addEventListener("click", notHotDogFn);

function hotDogFn()
{
  nextDoggo();
}
function notHotDogFn()
{
  nextDoggo();
}

// showing the next doggo
function nextDoggo()
{
  var doggoNumber = "doggo-number-" + game.currentDoggo;
  var nextDoggo = "doggo-number-" + (game.currentDoggo + 1);

  var doggoElement = document.getElementById(doggoNumber);
  var nextDoggoElement = document.getElementById(nextDoggo);

  doggoElement.classList.remove("currentDoggo");
  doggoElement.classList.add("hidden");

  nextDoggoElement.classList.add("currentDoggo");

  game.currentDoggo++;

  // load new doggos when there is less than 15 doggos
  game.doggosRemaining--;
  if (game.doggosRemaining < 15)
  {
    flaskLoadDoggos();
  }
}

async function flaskLoadDoggos()
{
  $.ajax({
  	type : "POST",
  	url : '/loadDogsCall',
  	dataType: "json",
  	contentType: 'application/json;charset=UTF-8',
  	success: function (data)
    {
      // this gets exectured only if I get the doggos from the server
      appendDoggos(data)
  	}
	});
}

// appending doggos to the document
function appendDoggos(dogs)
{
  var dogContainer = document.getElementById("dog-container");

  // finding out last doggo in the document
  var lastChildN = dogContainer.lastElementChild.getAttribute("data-id");

  // getting the count of doggos to append
  var count = Object.keys(dogs).length;

  // keeping track of how many dogs are remaining
  game.doggosRemaining += count;

  // creating arrays
  var nodeList = [];
  var canvasList = [];

  // creating doggo nodes
  function createNodes() {
    for (var i = 0; i < count; i++)
    {
      // creating a div - container for img and data
      var doggoId = parseInt(lastChildN) + i + 1
      var node = document.createElement("div");
      node.id = "doggo-number-" + doggoId;
      node.classList.add("hidden");
      node.classList.add("gameDoggo");
      node.setAttribute("data-id", doggoId);
      node.setAttribute("data-breed", dogs[i][1]);
      nodeList.push(node);

      // creating canvas where the img will be drawn
      var canvas = document.createElement('canvas');
      canvasList.push(canvas);
    }
  }

  // drawing doggo imgs to canvas
  const createImage = i => {
    var img = new Image();
    img.src = dogs[i][0];
    img.onload = function()
    {
      canvasList[i].width = img.width;
      canvasList[i].height = img.height;
      var ctx = canvasList[i].getContext("2d");
      ctx.drawImage(this, 0, 0);
    }
    return canvasList[i];
  }

  // appending the canvas with a doggo to the document only after canvas is done
  const ImgToCanva = async (i) => {
    const canvas = await createImage(i);

    // this class resizes canvas to fit the container div
    canvas.classList.add("doggoImg");
    nodeList[i].appendChild(canvas);
    dogContainer.appendChild(nodeList[i]);
  }

  // calling the functions
  createNodes();
  for (let i = 0; i < count; i++)
  {
    ImgToCanva(i);
  }

}

// https://gist.github.com/EvanHahn/2587465
// I wrote it in C and python, I don't wanna write it in js
function caesarShift(str, amount) {
  // Wrap the amount
  if (amount < 0) {
    return caesarShift(str, amount + 26);
  }

  // Make an output variable
  var output = "";

  // Go through each character
  for (var i = 0; i < str.length; i++) {
    // Get the character we'll be appending
    var c = str[i];

    // If it's a letter...
    if (c.match(/[a-z]/i)) {
      // Get its code
      var code = str.charCodeAt(i);

      // Uppercase letters
      if (code >= 65 && code <= 90) {
        c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
      }

      // Lowercase letters
      else if (code >= 97 && code <= 122) {
        c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
      }
    }

    // Append
    output += c;
  }

  // All done!
  return output;
};

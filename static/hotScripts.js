var TOOLTIP_MESSAGES =
[
  "There are over 120 different dog breeds in this game.",
  "There are over 20 000 different dog pictures in this game.",
  "WOOPWOOP"
]

var game = {};
// game variables
game.currentDoggo = 0;
game.doggosRemaining = 1;
game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);
var secretDoggoList = [];

// load the game when page loads
window.addEventListener("load", function()
{
  // storing the dog 0 object in the secret doggo list
  var doggo0El = document.getElementById("doggo-number-0");
  var doggo0ElC = doggo0El.children;
  var doggo0 = doggo0ElC[0];
  // making sure hotVotes is a number
  var hotVotes = parseInt(doggo0El.dataset.hotVotes);
  if (isNaN(hotVotes))
  {
    hotVotes = 0;
  }

  var dog = {
    id: 0,
    link: doggo0.src,
    totalVotes: parseInt(doggo0El.dataset.totalVotes),
    hotVotes: hotVotes
  }
  secretDoggoList[0] = dog

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

// TODO: add the vote, show how many people voted in total on this dog,
var hotDogButton = document.getElementById("hotDogButton");
var notHotDogButton = document.getElementById("notHotDogButton");
var scoreWrapper = document.getElementById("scoreWrapper");
hotDogButton.addEventListener("click", hotDogFn);
notHotDogButton.addEventListener("click", notHotDogFn);

function hotDogFn()
{
  link = secretDoggoList[game.currentDoggo].link;
  sendDataJsFn(link, 1);

  voteFn(1);
}

function notHotDogFn()
{
  link = secretDoggoList[game.currentDoggo].link;
  sendDataJsFn(link, 0);

  voteFn(0);
}

function voteFn(vote)
{
  // disabling the buttons and showing the score wrapper
  hotDogButton.disabled;
  notHotDogButton.disabled;

  hotDogButton.classList.add("hidden");
  notHotDogButton.classList.add("hidden");

  scoreWrapper.classList.remove("hidden");

  // adding the votes
  var totalVotes = secretDoggoList[game.currentDoggo].totalVotes + 1;
  var hotVotes = secretDoggoList[game.currentDoggo].hotVotes + vote;

  // drawing the score
  var c = document.getElementById("scoreCanvas");
  c.width = 400;
  c.height = 50;
  var ctx = c.getContext("2d");

  // fill proportionally to votes
  var yespx = hotVotes / totalVotes * 300;
  var nopx = 300 - yespx;

  ctx.fillStyle = "#55DDAB";
  ctx.fillRect(0, 0, yespx, 50);
  ctx.fillStyle = "#F07F83";
  ctx.fillRect(yespx, 0, nopx, 50);


  // adding the paragraph
  var scoreParagraph = document.getElementById("scoreParagraph");
  scoreParagraph.innerHTML = "total votes: " + totalVotes;
}

function sendDataJsFn(link, answer)
{
  // send the data to the server
  var dataToSend = {
    link: "",
    answer: ""
  };

  dataToSend.link = link;
  // 1 for hot; 0 for not
  dataToSend.answer = answer;

  sendData(dataToSend);
}

// display next doggo
var nextDogButton = document.getElementById("nextDogButton");
nextDogButton.addEventListener("click", nextDogFn);
function nextDogFn()
{
  hotDogButton.disabled = false;
  notHotDogButton.disabled = false;

  hotDogButton.classList.remove("hidden");
  notHotDogButton.classList.remove("hidden");

  scoreWrapper.classList.add("hidden");

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

/*
** FLASK CALLS
*/

function sendData(data)
{
  dataJSON = JSON.stringify(data)
  $.ajax({
    type : "POST",
    url : '/collectHotDogData',
    dataType: "json",
    data: dataJSON,
    contentType: 'application/json;charset=UTF-8',
  });
}

async function flaskLoadDoggos()
{
  $.ajax({
  	type : "POST",
  	url : '/loadHotDogs',
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
      node.classList.add("gameHotDoggo");
      node.setAttribute("data-id", doggoId);
      nodeList.push(node);

      // creating a secret list key value paris of doggo id - doggo link
      // used for collecting votes
      var hotVotes = dogs[i][2];
      if (hotVotes == null)
      {
        hotVotes = 0;
      }
      var dog = {
        id: doggoId,
        link: dogs[i][0],
        totalVotes: dogs[i][1],
        hotVotes: hotVotes
      }
      secretDoggoList.push(dog);

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

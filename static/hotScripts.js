/* ## Global variables ## */
var TOOLTIP_MESSAGES =
[
  "There are over 120 different dog breeds in this game.",
  "There are over 20 000 different dog pictures in this game.",
  "Blip"
]

// media
var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

// game variables
var game = {};
game.currentDoggo = 0;
game.doggosRemaining = 1;
game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);
var secretDoggoList = [];
game.voteTutorialStarted = false;
game.nextTutorialStarted = false;
game.shareID = null;
game.shareLinkIsUptodate = false;

/* ## Game Startup ## */
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
    vote: null,
    totalVotes: parseInt(doggo0El.dataset.totalVotes),
    hotVotes: hotVotes
  }
  secretDoggoList[0] = dog

  // managing the height and margin of vote overlays
  var height = doggo0.offsetHeight;
  setOverlayHeight(height);

  // loading additional doggos
  flaskLoadDoggos();

  // countdown before the game start into game start
  gameStartUp();

  // checking if the user came from a shared link and displaying a message
  var sharedDoggoMsg = document.getElementById("sharedDoggoMsg");
  var sharedVote = sharedDoggoMsg.dataset.sharedVote
  if (sharedVote.length > 0)
  {
    sharedDoggoMsg.classList.remove("hidden");
    if (sharedVote == 0)
    {
      sharedDoggoMsg.innerHTML = "Is this even a DOG?!";
    }
    else if (sharedVote == 1)
    {
      sharedDoggoMsg.innerHTML = "Check this hottie out!";
    }
    else
    {
      sharedDoggoMsg.innerHTML = "Is it a hot dog?";
    }
  }
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

      // starting vote tutorial, right after the countdown;
      startVoteTutorial();
    }
    // setting up the countdown
    else
    {
      msg.innerHTML = msgText.repeat(n);

      // adding the animation
      msg.classList.add("textScaling");
      n--;
    }
  }
}

/* ## The Game ## */

// Interactive overlays
var hotOverlay = document.getElementById("hotOverlay");
var notHotOverlay = document.getElementById("notHotOverlay");

var nextOverlay = document.getElementById("nextOverlay");

var placeholderScore = document.getElementById("placeholderScore");
var scoreContainer = document.getElementById("scoreContainer");

hotOverlay.addEventListener("click", hotDogFn);
notHotOverlay.addEventListener("click", notHotDogFn);
nextOverlay.addEventListener("click", nextDogFn);

/* ## Tutorials ## */

// Vote tutorial
var voteTutorialInterval;
var voteTutorialTimeout;
function startVoteTutorial()
{
  game.voteTutorialStarted = true;
  voteTutorialInterval = setInterval(voteTutorial, 3000);
}
function voteTutorial()
{
  blink(hotOverlay, 1000);
  blink(notHotOverlay, 1000);
}
function clearVoteTutorial()
{
  clearInterval(voteTutorialInterval);
  game.voteTutorialStarted = false;
}

// Next doggo tutorial
var nextTutoriaInterval;
var nextTutorialTimeout;
function startNextTutorial()
{
  game.nextTutorialStarted = true;
  nextTutoriaInterval = setInterval(nextTutorial, 3000);
}
function nextTutorial()
{
  blink(nextOverlay, 1000);
}
function clearNextTutorial()
{
  clearInterval(nextTutoriaInterval);
  game.nextTutorialStarted = false;
}

/* ## Voting & Next ## */
var link;
function hotDogFn()
{
  // sending data to the server
  link = secretDoggoList[game.currentDoggo].link;
  sendDataJsFn(link, 1);

  // storing the vote for share function
  secretDoggoList[game.currentDoggo].vote = 1

  voteFn(1);
}

function notHotDogFn()
{
  // sending data to the server
  link = secretDoggoList[game.currentDoggo].link;
  sendDataJsFn(link, 0);

  // storing the vote for share function
  secretDoggoList[game.currentDoggo].vote = 0

  voteFn(0);
}

function voteFn(vote)
{
  // when user votes, link needs to be updated
  game.shareLinkIsUptodate = false;

  // clear vote tutorial start next tutorial on the first doggo
  // else, if user is inactive for 5 seconds, start next tutorial
  if(game.voteTutorialStarted == true)
  {
    clearVoteTutorial();
    startNextTutorial();
  }
  else
  {
    clearTimeout(voteTutorialTimeout);
    nextTutorialTimeout = setTimeout(startNextTutorial, 5000);
  }

  // hiding vote overlays
  hotOverlay.classList.add("hidden");
  notHotOverlay.classList.add("hidden");

  //showing the score
  placeholderScore.classList.add("hidden");
  placeholderScore.classList.remove("d-flex");
  scoreContainer.classList.remove("hidden");

  // showing the next overlay
  nextOverlay.classList.remove("hidden");

  // summing up the votes
  var totalVotes = secretDoggoList[game.currentDoggo].totalVotes + 1;
  var hotVotes = secretDoggoList[game.currentDoggo].hotVotes + vote;

  // drawing the score
  var c = document.getElementById("scoreCanvas");

  // I have to account for padding and margin on desktop
  var main = document.getElementById("main");
  var style = main.currentStyle || window.getComputedStyle(main),
  margin = parseFloat(style.marginLeft),
  padding = parseFloat(style.paddingLeft);
  var offset = margin + padding;

  var canvasWidth;
  if (offset == 0)
  {
    canvasWidth = screenWidth;
  }
  else
  {
    canvasWidth = screenWidth - offset * 2;
  }
  c.width = canvasWidth;
  c.height = 50;
  var ctx = c.getContext("2d");

  // filling the canvas proportionally to votes
  var hotpx = hotVotes / totalVotes * canvasWidth;
  var hotPerc = Math.round(hotVotes / totalVotes * 100);

  var notpx = canvasWidth - hotpx;
  var notPerc = 100 - hotPerc;

  if (notpx != 0)
  {
    // not color
    ctx.fillStyle = "#F07F83";
    ctx.fillRect(0, 0, notpx, 50);
    // not text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#F4A4A6";
    ctx.font = "24px Arial";
    var str = notPerc + "%";
    ctx.fillText(str, notpx/2, 25);
  }

  if (hotpx != 0)
  {
    // hot color
    ctx.fillStyle = "#55DDAB";
    ctx.fillRect(notpx, 0, hotpx, 50);
    // hot text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#85E7C3";
    ctx.font = "24px Arial";
    var str = hotPerc + "%";
    ctx.fillText(str, (notpx + (hotpx/2)), 25);
  }

  // adding the paragraph with total votes
  // TODO: this
  var scoreParagraph = document.getElementById("scoreParagraph");
  scoreParagraph.innerHTML = "total votes: " + totalVotes;
}

// preparing the game for the next doggo
function nextDogFn()
{
  // when the dog changes link needs to be updated
  game.shareLinkIsUptodate = false;

  // clearing the next tutorial and the timout for next tutorial
  if (game.nextTutorialStarted == true)
  {
    clearNextTutorial();
  }
  else
  {
    clearTimeout(nextTutorialTimeout);
  }

  // if user does not vote for 5s vote tutorial will start
  voteTutorialTimeout = setTimeout(startVoteTutorial, 5000);

  // showing vote overlays
  hotOverlay.classList.remove("hidden");
  notHotOverlay.classList.remove("hidden");
  placeholderScore.classList.remove("hidden");
  placeholderScore.classList.add("d-flex");

  // hiding the score
  scoreContainer.classList.add("hidden");

  // hiding the next overlay
  nextOverlay.classList.add("hidden");

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
  nextDoggoElement.classList.remove("hidden");

  var nextDoggoElementCh = nextDoggoElement.children
  var nextDoggoCanvas = nextDoggoElementCh[0]

  // managing the height and margin of vote overlays and the doggo pic
  var rect = nextDoggoCanvas.getBoundingClientRect();
  var height = rect.height;

  // limit the height to 70% of total screen height
  if (height > 0.7 * screenHeight)
  {
    height = 0.7 * screenHeight;
  }
  setOverlayHeight(height);

  // setting the height of the doggo pict
  nextDoggoCanvas.style.height = height + "px";
  var doggoWrapper = document.getElementById("dog-container");
  doggoWrapper.style.height = height + "px";

  game.currentDoggo++;

  // load new doggos when there is less than 15 doggos left
  game.doggosRemaining--;
  if (game.doggosRemaining < 15)
  {
    flaskLoadDoggos();
  }
}

// setting the height of [vote] overlays depending on height passed
function setOverlayHeight(height)
{
  // dog pict is always in the middle of dog container which is set to be 500px high;
  var overlays = document.getElementsByClassName("interactionOverlay");
  for (var i = 0; i < overlays.length; i++)
  {
    overlays[i].style.height = (height + 50) + "px";
  }
  // setting the position of score overlay
  var scoreWrapper = document.getElementById("scoreWrapper");
  scoreWrapper.style.top = height + "px";
}

// fade-in to fade-out
function blink(element, duration)
{
  fadeObject(element, 0, 0.7, duration);

  setTimeout(function(){
    fadeObject(element, 0.7, 0, duration);
  }, 1000)
}

// https://stackoverflow.com/questions/9145809/how-to-create-an-opacity-fade-improvement-over-jquery
function fadeObject(el, start, end, duration) {
    var range = end - start;
    var goingUp = end > start;
    var steps = duration / 20;   // arbitrarily picked 20ms for each step
    var increment = range / steps;
    var current = start;
    var more = true;
    function next() {
        current = current + increment;
        if (goingUp) {
            if (current >= end) {
                current = end;
                more = false;
            }
        } else {
            if (current <= end) {
                current = end;
                more = false;
            }
        }
        el.style.opacity = current;
        if (more) {
            setTimeout(next, 20);
        }
    }
    next();
}

/* ## Share ## */

var shareButton = document.getElementById("shareButton");
shareButton.addEventListener("click", shareTheDog)

function shareTheDog()
{
  // create share ID, send data to databse
  if (game.shareLinkIsUptodate == false)
  {
    game.shareID = generateID();
    var link = secretDoggoList[game.currentDoggo].link;
    var vote = secretDoggoList[game.currentDoggo].vote;
    if (vote == null || vote == undefined)
    {
      // I will use 2 as a code for no-vote
      vote = 2;
    }
    sendShareData(game.shareID, link, vote);
    game.shareLinkIsUptodate = true;
  }

  // update the input with the link
  var shareInput = document.getElementById("shareInput");
  shareInput.value = "http://127.0.0.1:5000/hotdog/s/" + game.shareID;
}

// Unique ID generator - I should be using UUID, but this is more fun.
// https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
function generateID()
{
  var length = 8;
  var mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = length; i > 0; --i)
  {
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  }
  return result;
}

/* ## Flask calls ## */
function sendShareData(id, link, vote)
{
  var dataToSend = {
    id: "",
    link: "",
    vote: ""
  }
  dataToSend.id = id;
  dataToSend.link = link;
  dataToSend.vote = vote;

  var path = '/collectShareData';
  sendData(dataToSend, path);
}

// sending vote data to flask
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

  var path = '/collectHotDogData';
  sendData(dataToSend, path);
}

function sendData(data, path)
{
  dataJSON = JSON.stringify(data)
  $.ajax({
    type : "POST",
    url : path,
    dataType: "json",
    data: dataJSON,
    contentType: 'application/json;charset=UTF-8',
  });
}

// loading and appending doggos
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

/* ## Media ## */
// For devices with screen width of less than 1000px
if (screenWidth < 1001)
{
  // remove padding from the main wrapper
  var main = document.getElementById("main");
  main.classList.remove("p-5");
  main.classList.remove("container");
}

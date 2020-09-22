/* ## Global variables ## */
var TOOLTIP_MESSAGES =
[
  "There are over 120 different dog breeds in this game.",
  "There are over 20 000 different dog pictures in this game.",
  "Click dog pictures to play!"
]

// media
var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

// game variables
var game = {};
var secretDoggoList = [];

// arrays for storing doggos
game.hotDoggos = [];
game.notHotDoggos = [];

game.firstDoggo = true;
game.currentDoggo = 0;
game.doggosRemaining = 1;

game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);

game.voteTutorialStarted = false;
game.nextTutorialStarted = false;

game.shareID = null;
game.summaryShareID = null;
game.shareLinkIsUptodate = false;
game.shareSummaryLinkIsUptodate = false;

/* ## Audio ## */
game.audioMuted = false;

var hotSound = new Howl({
    src: 'static/audio/hot.wav',
    autoplay: false,
    volume: 1
});
var notHotSound = new Howl({
    src: 'static/audio/not-hot.wav',
    autoplay: false,
    volume: 1
});
var nextSound = new Howl({
    src: 'static/audio/next.wav',
    autoplay: false,
    volume: 1
});

// Toggle sound
var toggleSound = document.getElementById("toggleSound");
var toggleSoundIcon = document.getElementById("toggleSoundIcon");
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

  // TODO: this does not work as intended <<<<<<<<<<
  // managing the height and margin of vote overlays
  var height = doggo0.offsetHeight;
  // limit the height to 80% of total screen height
  if (height > 0.70 * screenHeight)
  {
    height = 0.70 * screenHeight;
  }
  setOverlayHeight(height);
  var doggoWrapper = document.getElementById("dog-container");
  doggo0.style.height = height + "px";
  doggoWrapper.style.height = height + "px";

  // loading additional doggos
  flaskLoadDoggos();

  // countdown -> game starts
  gameStartUp();
});

function gameStartUp()
{
  // setting up the countdown overlay
  var overlay = document.getElementById("countdownOverlay");
  overlay.style.width = "100%";

  var dogContainer = document.getElementById("dog-container");
  var tooltip = document.getElementById("countdownTooltip");

  // choosing the tooltip message from TOOLTIP_MESSAGES
  var tooltipN = Math.floor(Math.random() * game.unseenTooltips.length);
  var ttmessage = game.unseenTooltips[tooltipN];

  // checking if the user came from a shared link and displaying a special tooltip
  var sharedDoggoMsg = document.getElementById("sharedDoggoMsg");
  var sharedVote = sharedDoggoMsg.dataset.sharedVote
  if (sharedVote.length > 0)
  {
    if (sharedVote == 0)
    {
      ttmessage = "Wait a second... is this even a DOG?!";
    }
    else if (sharedVote == 1)
    {
      ttmessage = "In a second I will show you a really HOT! dog.";
    }
    else
    {
      ttmessage = "I will show you a dog, is it hot?";
    }
  }

  tooltip.innerHTML = ttmessage;
  // making sure user sees all tooltips before I start recycling them
  game.unseenTooltips.splice(tooltipN, 1);
  if (game.unseenTooltips.length == 0)
  {
    game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);
  }

  // countdown duration
  var n = 2;
  var interval = setInterval(countdown, 1000);
  function countdown()
  {
    // clearing interval and hiding the overlay
    if (n == 0)
    {
      overlay.style.width = "0%";
      tooltip.innerHTML = "";
      clearInterval(interval);
    }
    // starting the timer and counters
    // setting up the breed buttons
    else if (n == 1)
    {
      n--;
    }
    else if (n == 2)
    {
      n--;
      // bones circle animation start-up
      createBoneCircle();
      animateBoneCircle();
      // starting vote tutorial, so it fires right after the countdown;
      startVoteTutorial();
      // audio
      countdownSound.play();
    }
    // setting up the countdown
    else
    {
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
  blink(hotOverlay, 500);
  blink(notHotOverlay, 500);
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

  // on first doggo fire tutorial immediately
  if(game.firstDoggo)
  {
    nextTutorial();
  }
  nextTutoriaInterval = setInterval(nextTutorial, 3000);
}
function nextTutorial()
{
  blink(nextOverlay, 500);
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
  // get the doggo and push it to hot array #summary
  var doggoElement = document.getElementsByClassName("currentDoggo");
  doggoElement = doggoElement[0];
  game.hotDoggos.push(doggoElement);

  // play audio
  if(!game.audioMuted)
  {
    hotSound.play();
  }

  // sending data to the server
  link = secretDoggoList[game.currentDoggo].link;
  sendDataJsFn(link, 1);

  // storing the vote for share function
  secretDoggoList[game.currentDoggo].vote = 1

  voteFn(1);
}

function notHotDogFn()
{
  // get the doggo and push it to NOT hot array #summary
  var doggoElement = document.getElementsByClassName("currentDoggo");
  doggoElement = doggoElement[0];
  game.notHotDoggos.push(doggoElement);

  // play audio
  if(!game.audioMuted)
  {
    notHotSound.play();
  }
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
  // flag that summary link needs to be updated
  game.shareSummaryLinkIsUptodate = false;

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
    nextTutorialTimeout = setTimeout(startNextTutorial, 2000);
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
  // setting the first doggo flag to false on first doggo
  if (game.firstDoggo)
  {
    game.firstDoggo = false;
  }

  // play audio
  if(!game.audioMuted)
  {
    nextSound.play();
  }

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

  // if user does not vote for 2s vote tutorial will start
  voteTutorialTimeout = setTimeout(startVoteTutorial, 2000);

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

  // limit the height to 80% of total screen height
  if (height > 0.70 * screenHeight)
  {
    height = 0.70 * screenHeight;
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
  shareInput.value = "https://doggo.fans/hotdog/s/" + game.shareID;
}

var copyShareLinkDiv = document.getElementById("copyShareLinkDiv");
var copyShareLinkButton = document.getElementById("copyShareLinkButton");
var copyShareLinktt = document.getElementById("copyShareLinktt");
var clipboardjs = new ClipboardJS('#copyShareLinkButton');
clipboardjs.on('success', function(e)
{
  copyShareLinktt.innerHTML = "Copied!";
});

copyShareLinkDiv.addEventListener("mouseleave", function(){
  copyShareLinktt.innerHTML = "Copy link!";
});


/* ## Summary ## */
var summaryButton = document.getElementById("summaryButton");
summaryButton.addEventListener("click", showSummary);

function showSummary()
{
  // hide the game
  var gameState = document.getElementById("gameState");
  gameState.classList.add("hidden");

  //show the summary
  var summaryState = document.getElementById("summaryState");
  summaryState.classList.remove("hidden");

  // render doggos in matching doggo piles
  var hotDoggos = game.hotDoggos;
  var notHotDoggos = game.notHotDoggos;
  var hotDoggosLen = hotDoggos.length;
  var notHotDoggosLen = notHotDoggos.length;
  var hotDoggoPile = document.getElementById("hotDoggoPile");
  var notHotDoggoPile = document.getElementById("notHotDoggoPile");

  for (var i = 0; i < hotDoggosLen; i++)
  {
    var doggo = hotDoggos[i];
    doggo = prepDoggo(doggo)
    hotDoggoPile.appendChild(doggo);
  }

  for (var i = 0; i < notHotDoggosLen; i++)
  {
    var doggo = notHotDoggos[i];
    doggo = prepDoggo(doggo)
    notHotDoggoPile.appendChild(doggo);
  }

  // add text
  var pHotPile = document.getElementById("pHotPile");
  if (hotDoggosLen == 0)
  {
    pHotPile.innerHTML = "Not a single hot doggo :(";
  }
  else if (hotDoggosLen == 1)
  {
    pHotPile.innerHTML = "This is your hot dog:";
  }
  else
  {
    pHotPile.innerHTML = "These " + hotDoggosLen + " doggos are your hot doggos:";
  }
  var pNotPile = document.getElementById("pNotPile");
  if (notHotDoggosLen == 0)
  {
    pNotPile.innerHTML = "Not a single not doggo :)";
  }
  else if (notHotDoggosLen == 1)
  {
    pNotPile.innerHTML = "This is your not hot dog:";
  }
  else
  {
    pNotPile.innerHTML = "These " + notHotDoggosLen + " doggos are your not hot doggos:";
  }

  // preparing the doggo before it goes to the pile
  function prepDoggo(doggo)
  {
    doggo.classList.add("doggoPile");
    doggo.classList.remove("hidden");
    doggo.classList.remove("gameHotDoggo");
    var ch = doggo.children;
    ch[0].style.height = 100 + "%";

    // getting link to the doggo pic
    var doggoId  = doggo.id;
    var splitString = doggoId.split("doggo-number-");
    var id = splitString[1];

    // linking doggo up
    var link = document.createElement("a");
    link.href = secretDoggoList[id].link;
    link.target = "_blank";
    link.appendChild(doggo);

    return link
  }
}

// back to the game
var backToGame = document.getElementById("backToGame");
backToGame.addEventListener("click", backToGameFn);
function backToGameFn()
{

  // if there is no current doggo - it happens when user goes to summary after voting
  // I need to bring the last doggo from the pile to the game
  // coz I want to make sure user has his game as he left it
  var gameHotDoggos = document.getElementsByClassName("gameHotDoggo");
  var firstGameDoggo = gameHotDoggos[0];
  var classList = firstGameDoggo.classList;
  var isCurrentDoggo = false;
  for (var i = 0; i < classList.length; i++)
  {
    if (classList[i] == "currentDoggo")
    {
      isCurrentDoggo = true;
    }
  }
  if (isCurrentDoggo == false)
  {
    var currentDoggoId = "doggo-number-" + game.currentDoggo;
    var currentDoggo = document.getElementById(currentDoggoId);

    currentDoggo.classList.remove("doggoPile");
    currentDoggo.classList.add("gameHotDoggo");

    var nextDoggoId = "doggo-number-" + (game.currentDoggo + 1);
    var nextDoggo = document.getElementById(nextDoggoId);

    var dogContainer = document.getElementById("dog-container");
    dogContainer.insertBefore(currentDoggo, nextDoggo);
  }

  // else just going back to the game

  var gameState = document.getElementById("gameState");
  var summaryState = document.getElementById("summaryState");
  gameState.classList.remove("hidden");
  summaryState.classList.add("hidden");
}

// share game summary
var shareSummaryButton = document.getElementById("shareSummaryButton");
shareSummaryButton.addEventListener("click", shareSummaryFn)
function shareSummaryFn()
{
  if (game.shareSummaryLinkIsUptodate == false)
  {
    // generate ID
    game.summaryShareID = generateID();

    // I want to send a list of objects to flask, each object will hold id, link and vote
    var listOfEntries = [];

    // iterate on doggo arrays and create entries
    var hotDoggos = game.hotDoggos;
    var notHotDoggos = game.notHotDoggos;
    var hotDoggosLen = hotDoggos.length;
    var notHotDoggosLen = notHotDoggos.length;

    for (var i = 0; i < hotDoggosLen; i++)
    {
      var doggo = hotDoggos[i];
      var entry = createEntry(doggo, 1)
      listOfEntries.push(entry)
    }

    for (var i = 0; i < notHotDoggosLen; i++)
    {
      var doggo = notHotDoggos[i];
      var entry = createEntry(doggo, 0)
      listOfEntries.push(entry)
    }

    // sending data to flask
    sendSummaryShareData(listOfEntries);

    // setting flag to not run this function if nothing is changed
    game.shareSummaryLinkIsUptodate = true;
  }

  var shareSummaryInput = document.getElementById("shareSummaryInput");
  shareSummaryInput.value = "https://doggo.fans/hotdog/sm/" + game.summaryShareID;

  function createEntry(doggo, vote)
  {
    var entry =
    {
      id: "",
      link: "",
      vote: ""
    }
    entry.id = game.summaryShareID;

    var doggoId  = doggo.id;
    var splitString = doggoId.split("doggo-number-");
    var id = splitString[1];
    entry.link = secretDoggoList[id].link;

    entry.vote = vote;

    return entry
  }
}

// summary share modal functionality
var copyShareSummaryLinkDiv = document.getElementById("copyShareSummaryLinkDiv");
var copyShareSummaryLinkButton = document.getElementById("copyShareSummaryLinkButton");
var copyShareSummaryLinktt = document.getElementById("copyShareSummaryLinktt");
var clipboardjs = new ClipboardJS('#copyShareSummaryLinkButton');
clipboardjs.on('success', function(e)
{
  copyShareSummaryLinktt.innerHTML = "Copied!";
});

copyShareSummaryLinkDiv.addEventListener("mouseleave", function(){
  copyShareLinktt.innerHTML = "Copy link!";
});

/* ## Flask calls ## */
function sendSummaryShareData(listOfEntries)
{
 var path = '/collectHotDogSummaryShareData'
 sendData(listOfEntries, path)
}

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

  var path = '/collectHotDogShareData';
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

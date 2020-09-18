var TOOLTIP_MESSAGES =
[
  "You get more bones on higher streaks.",
  "You can see how much time you have left in upperleft corner.",
  "You get +5 seconds for guessing 3 doggos in a row.",
  "Remember to submit your high score.",
  "There are over 120 different dog breeds in this game.",
  "There are over 20 000 different dog pictures in this game.",
  "'The more bones the better.' - Bark Twain"
]

// media
var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

// keep track of the current doggo
var game = {};
// game
game.currentDoggo = 0;
game.doggosRemaining = 1;
game.currentDoggoBreed = null;
game.nCorrect = 0;
game.nIncorrect = 0;
game.score = 0;
game.streak = 0;
game.lastDoggo = false;
game.lastDoggoAnswered = false;
game.numberOfChoices = 4;
var secretDoggoList = {};
game.unseenTooltips = TOOLTIP_MESSAGES.slice(0);

// timer
game.gameTime = 91;
game.timerValue = 0;
game.timeLeft = 0;

/* ## Audio ## */
game.audioMuted = false;

var correctSound = new Howl({
    src: 'static/audio/Correct.mp3',
    autoplay: false,
    volume: 1
});
var inCorrectSound = new Howl({
    src: 'static/audio/Negative.wav',
    autoplay: false,
    volume: 1
});
var click = new Howl({
    src: 'static/audio/click.wav',
    autoplay: false,
    volume: 0.2
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

// start the timer only when the page loads
window.addEventListener("load", function()
{
  // storing the doggo 0 link in the secret doggo list
  var doggo0El = document.getElementById("doggo-number-0").children;
  var doggo0 = doggo0El[0];
  secretDoggoList[0] = doggo0.src

  // loading additional doggos
  flaskLoadDoggos();

  // countdown before the game start into game start
  gameStartUp(setBreedButtons, gameTimer);
});

function gameStartUp(breeds, timer)
{
  // disable the game reset button and add the placeholder bone
  var gameResetButton = document.getElementById("gameReset");
  gameResetButton.innerHTML = "";
  gameResetButton.disabled = true;
  for(var i = 0; i < game.numberOfChoices; i++)
  {
    var bone = getABone();
    bone.classList.add("rotating");
    gameResetButton.appendChild(bone);
  }

  // arrays for storing doggos
  correctDoggos = [];
  incorrectDoggos = [];

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

  var streakDisplay = document.getElementById("streakDisplay");
  var scoreDisplay = document.getElementById("scoreDisplay");
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
      timer(game.gameTime); //61 works well for a minute
      streakDisplay.innerHTML = "0";
      scoreDisplay.innerHTML = "0";

      msg.innerHTML = msgText.repeat(n);
      n--;
    }
    // setting up the breed buttons
    else if (n == 2)
    {
      breeds();

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

function setBreedButtons()
{
  breedsForButtons = []

  // getting breed of the current doggo
  var doggoNumber = "doggo-number-" + game.currentDoggo
  var doggoElement = document.getElementById(doggoNumber);
  currentDoggoBreed = doggoElement.getAttribute("data-breed");
  game.currentDoggoBreed = currentDoggoBreed;
  var decryptedBreed = caesarShift(currentDoggoBreed, -4);
  breedsForButtons.push(decryptedBreed);

  // https://stackoverflow.com/questions/9792927/javascript-array-search-and-remove-string
  // making sure I only get one occurance of each breed in buttons
  let arr = ALL_BREEDS;
  arr = arr.filter(e => e !== decryptedBreed);

  // getting 3 random doggo breeds from the list
  for (var i = 0; i < game.numberOfChoices - 1; i++)
  {
    var b = arr[Math.floor(Math.random() * arr.length)];

    // making sure I only get one occurance of each breed in buttons
    arr = arr.filter(e => e !== b);

    breedsForButtons.push(b);
  }

  // shuffle the array
  shuffle(breedsForButtons);
  // twice
  shuffle(breedsForButtons);

  // adding breeds to buttons
  for (var i = 0; i < game.numberOfChoices; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    // setting their html and value
    button.innerHTML = breedsForButtons[i];
    button.value = breedsForButtons[i];
    button.style.backgroundColor = "#f8f9fa";
    button.style.borderColor = "#6b6b6b";

    // clickclacking on hover on dekstop
    if (screenWidth > 1000)
    {
      button.addEventListener("mouseenter", function(){
        click.play();
      });
    }

    // checking the answer on button click
    button.addEventListener("click", doggoBreedCheck);
  }
}

// checking the answer
function doggoBreedCheck()
{
  // send the data to the server
  var dataToSend = {
    link: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    userGuess: ""
  };
  dataToSend.link = secretDoggoList[game.currentDoggo];
  dataToSend.userGuess = this.innerHTML;

  // disable the buttons
  for (var i = 0; i < game.numberOfChoices; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    button.disabled = true;
    // populate dataToSend
    var choice = "choice" + (i + 1);
    dataToSend[choice] = button.innerHTML;
  }

  // sending user's guess to the server
  sendData(dataToSend);

  var doggoNumber = "doggo-number-" + game.currentDoggo;
  var doggoElement = document.getElementById(doggoNumber);
  var streakDisplay = document.getElementById("streakDisplay");
  var scoreDisplay = document.getElementById("scoreDisplay");
  var encryptedBreed = caesarShift(this.value, 4);

  if (encryptedBreed == game.currentDoggoBreed)
  {
    // play sound if audio is not muted
    if(!game.audioMuted)
    {
      correctSound.play();
    }

    // giving player more bones on higher streaks
    animateResultCount(game.streak, (game.streak + 1), streakDisplay);

    game.streak += 1;
    boneN = game.streak * 5

    // animating the score (bone) count
    animateResultCount(game.score, (game.score + boneN), scoreDisplay);
    game.score += boneN;

    // bone animation
    throwBones(boneN);

    // blink this button green
    this.style.backgroundColor = "rgba(68, 175, 105, 0.5)";
    this.style.borderColor = "rgba(68, 175, 105, 0.7)";

    // displaying congratz
    // I have 20 congratz adjectives
    var streakCongratzN = game.streak - 1;
    if (streakCongratzN > 19)
    {
      streakCongratzN = 19;
    }
    var messageTxt = STREAK_CONGRATZ[streakCongratzN];
    var timerDisplay = document.getElementById("timerDisplay");
    var message = document.getElementById("message");
    // TODO: it breaks sometimes...
    if (message != null)
    {
      message.innerHTML = messageTxt.toUpperCase();
      message.classList.remove("hidden");
      message.classList.add("textScaling");

      // hide the message after 800 ms
      setTimeout(hideTheMessage, 800);
      function hideTheMessage()
      {
        message.classList.remove("textScaling");
        message.classList.add("hidden");
      }
    }

    // timer shenanigans
    if (!game.lastDoggo)
    {
      if (game.streak % 3 == 0)
      {
        var messageParTxt = " + 5 sec";
        var messagePar = document.getElementById("messageParagraph");
        if (messagePar != null)
        {
          messagePar.innerHTML = messageParTxt.toUpperCase();
          messagePar.classList.remove("hidden");
          messagePar.classList.add("textScaling");

          // hide the message after 800 ms
          setTimeout(hideTheMessagePar, 800);
          function hideTheMessagePar()
          {
            messagePar.classList.remove("textScaling");
            messagePar.classList.add("hidden");
          }
        }
        // add 5 sec to the timer
        game.timerValue += 5 * 1000;
        game.totalGameTime += 5;
      }
    }

    // anti-bot shield!
    //player goes on a watchlist when he makes streak 8
    if (game.streak == 6)
    {
      // if streak is equal or more than 8 after 3 seconds, inform him about the bot watchlist
      setTimeout(botWatchlistInformation, 3000);

      function botWatchlistInformation()
      {
        if(game.streak >= 8)
        {
          console.log("Welcome to the bot watchlist!\n I will be testing whether you are a human.");
          // if streak is equal or more than 10 after 3 seconds, apply test 1
          setTimeout(firstBotTest, 3000);
        }
      }
      function firstBotTest()
      {
        if(game.streak >= 10)
        console.log("1st bot test.");
        {
          var reply = confirm("WOW NICE STREAK AND SO QUICKLY TOO!\nPress OK if you are not a bot.");
          if (reply == true)
          {
            console.log("Wow, congratz on being human.");
            var streakAfterFirst = game.streak;

            // if streak equal or more than game.streak + 2 after 3 seconds, apply test 2
            secondBotTest(streakAfterFirst, 3000);
          }
          else
          {
            game.streak = 0;
            game.score = 0;
          }
        }
      }

      function secondBotTest(streak, timeout)
      {
        setTimeout(function()
        {
          console.log("streak + 2 in second bot test", streak+2)
          if(game.streak >= streak + 2)
          {
            console.log("2nd bot test.");

            let reply2 = prompt("YOU SEEM TO BE A BOT!\nType: 'I am human.' to continue");
            if (reply2 == "I am human.")
            {
              console.log("Dear human, stahp botting!");
              var streakAfterSecond = game.streak;

              // if streak equal or more than game.streak + 4 after 6 seconds, apply test 2
              thirdBotTest(streakAfterSecond, 6000)
            }
            else
            {
              game.streak = 0;
              game.score = 0;
            }
          }
        }, timeout);
      }
      function thirdBotTest(streak, timeout)
      {
        setTimeout(function()
        {
          if(game.streak >= streak + 2)
          {
            console.log("3rd bot 'test'.");
            alert("This game is not optimized for BOTS!!!11!\nJust fyi, I am rejecting scores over 4.5k");
          }
        }, timeout);
      }
    }

    // preping the end screen doggo pile
    game.nCorrect++;
    correctDoggos.push(doggoElement);
  }
  else
  {
    // play sound if audio is not muted
    if(!game.audioMuted)
    {
      inCorrectSound.play();
    }

    // blinking the wrong choice red and the correct button green
    this.style.backgroundColor = "rgba(248, 51, 60, 0.5)";
    this.style.borderColor = "rgba(248, 51, 60, 0.7)";
    for (var i = 0; i < game.numberOfChoices; i++)
    {
      // getting the breed buttons
      var str = "button" + (i + 1);
      var button = document.getElementById(str);
      var encryptedButton = caesarShift(button.value, 4);
      if (encryptedButton == game.currentDoggoBreed)
      {
        button.style.backgroundColor = "rgba(68, 175, 105, 0.5)";
        button.style.borderColor = "rgba(68, 175, 105, 0.7)"
      }
    }

    // 0-ing the streak
    animateResultCount(game.streak, 0, streakDisplay);
    game.streak = 0;

    // displaying negative congratz
    //var message = capitalizeFirstLetter(WRONG[Math.floor(Math.random() * WRONG.length)]) + " " + DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)];
    //document.getElementById("message").innerHTML = "You will get it next time!";

    // preping the end screen doggo pile
    game.nIncorrect++;
    incorrectDoggos.push(doggoElement);
  }

  // waiting for the user to answer the last doggo querry
  if (game.lastDoggo)
  {
    game.lastDoggoAnswered = true;
  }
  // wait 500 and show the next doggo
  else
  {
    setTimeout(function(){ nextDoggo(); }, 700);
  }
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

  // enable the buttons so user can't click
  for (var i = 0; i < game.numberOfChoices; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    button.disabled = false;
  }

  // load new doggos when there is less than 15 doggos
  game.doggosRemaining--;
  if (game.doggosRemaining < 15)
  {
    flaskLoadDoggos();
  }
  setBreedButtons();
}

function gameTimer(value) {
  // Timer variables
  game.timerValue = value * 1000;
  var n = 0;
  var isTimerOver = false;
  var sn = 0;

  // Audio
  // Countdown sound
  var GAME_END_SOUNDS = [
    'static/audio/game_end1.mp3',
    'static/audio/game_end2.mp3',
    'static/audio/game_end3.mp3',
  ]

  // Update the count down every second
  var timer = new Timer(function()
  {
    // Every second update the iterating variable
    n += 1 * 1000;

    // Find the distance between now and the count down date
    game.timeLeft = game.timerValue - n;

    // Never let distance be less than 0
    if (game.timeLeft < 0)
    {
      game.timeLeft = 0;
    }

    // Time calculations for minutes and seconds
    // toLocaleString to display 01
    var minutes = Math.floor((game.timeLeft % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    var seconds = Math.floor((game.timeLeft % (1000 * 60)) / 1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    // Display the timer in the element with id="timerDisplay"
    var timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.innerHTML = minutes + ":" + seconds;

    // Countdown audio
    var src = GAME_END_SOUNDS[sn];

    var countDownSound = new Howl({
        src: src,
        autoplay: false,
        volume: 1
    });
    // bold on one minute left
    if (game.timeLeft == 60000)
    {
      timerDisplay.style.fontWeight = "600";
    }
    //reset after a second
    if (game.timeLeft == 59000)
    {
      timerDisplay.style.fontWeight = "400";
    }
    // bold on half minute left
    if (game.timeLeft == 30000)
    {
      timerDisplay.style.fontWeight = "600";
    }
    //reset after a second
    if (game.timeLeft == 29000)
    {
      timerDisplay.style.fontWeight = "400";
    }
    // countdown on 6, 4, 2 seconds
    if (game.timeLeft == 6000)
    {
      timerDisplay.style.color = "#F56676";
      timerDisplay.style.fontWeight = "600";
      // play sound if audio is not muted
      if(!game.audioMuted)
      {
        sn = 0;
        countDownSound.play();
      }
    }
    if (game.timeLeft == 4000)
    {
      // play sound if audio is not muted
      if(!game.audioMuted)
      {
        sn = 1;
        countDownSound.play();
      }
    }
    if (game.timeLeft == 2000)
    {
      // play sound if audio is not muted
      if(!game.audioMuted)
      {
        sn = 2;
        countDownSound.play();
      }
    }

    // When the countdown is finished transition between game state and hight score entry state
    if (game.timeLeft <= 0)
    {
      // giving the user time to answer the last doggo
      game.lastDoggo = true;
      isTimerOver = true;

      // waiting for the last answer
      if (game.lastDoggoAnswered)
      {
        timer.stop();

        // reset the timer color
        timerDisplay.style.fontWeight = "400";
        timerDisplay.style.color = "black";

        // finishes the game and starts preparing the new game
        setTimeout(function(){ finishTheGame(); }, 500);
      }
    }
  }, 1000);
}

// 2 async functions to make sure that the game loop does not break itself
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
const finishTheGame = async () => {
  const result = await finishTheGameFn()
  prepareTheNewGame();
}

// function that prepares the new game and enables the restart button after it is done
const prepareTheNewGame = async () => {
  const result = await prepareTheNewGameFn()
  // enable the restart button after the new game is ready + 1.5sec
  setTimeout(function()
  {
    var gameResetButton = document.getElementById("gameReset");
    gameResetButton.disabled = false;
    gameResetButton.innerHTML = "Try again!";
  }, 2000);
}

function finishTheGameFn()
{
  // hide the game, show the hscore entry
  var gameContainer = document.getElementById("game");
  gameContainer.classList.add("hidden");

  var hscoreEntryState = document.getElementById("hscoreEntryState");
  hscoreEntryState.classList.remove("hidden");

  // show score
  var dbScore = document.getElementById("db-score");
  var formScore = document.getElementById("form-score");
  dbScore.innerHTML = game.score;
  formScore.value = game.score;

  // show good job
  var msgEnd = document.getElementById("msgEnd");
  var msg = capitalizeFirstLetter(CONGRATZ[Math.floor(Math.random() * CONGRATZ.length)]) + " " + DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)];
  msgEnd.innerHTML = msg + "!";

  // show how many doggos user guessed correcty/incorrectly
  var pNCorrect = document.getElementById("pNCorrect");
  if (game.nCorrect == 0)
  {
    pNCorrect.innerHTML = "";
  }
  else if (game.nCorrect == 1)
  {
    pNCorrect.innerHTML = "You have guessed this " + game.nCorrect + " doggo correctly:";
  }
  else
  {
    pNCorrect.innerHTML = "You have guessed these " + game.nCorrect + " doggos correctly:";
  }

  var pNIncorrect = document.getElementById("pNIncorrect");
  if (game.nIncorrect == 0)
  {
    pNIncorrect.innerHTML = "";
  }
  else if (game.nIncorrect == 1)
  {
    pNIncorrect.innerHTML = "You will guess this " + game.nIncorrect + " doggo next time:";
  }
  else
  {
    pNIncorrect.innerHTML = "You will guess these " + game.nIncorrect + " doggos next time:";
  }

  // show correctly and incorrectly guessed doggos
  var correctDoggoPile = document.getElementById("correctDoggoPile");
  var incorrectDoggoPile = document.getElementById("incorrectDoggoPile");

  len = correctDoggos.length
  for (var i = 0; i < len; i++)
  {
    // getting link to the doggo
    var doggoDivId  = correctDoggos[i].id;
    var splitString = doggoDivId.split("doggo-number-");
    var id = splitString[1];

    // img is a link to the big pic
    var img = correctDoggos[i].children[0];
    var link = document.createElement("a");
    link.href = secretDoggoList[id];
    link.target = "_blank";
    link.appendChild(img);
    correctDoggos[i].appendChild(link);

    // display breed
    var breedEncoded = correctDoggos[i].getAttribute("data-breed");
    var breedDecoded = caesarShift(breedEncoded, -4);
    var para = document.createElement("p");
    para.innerHTML = breedDecoded;
    para.classList.add("doggoPileText");
    correctDoggos[i].appendChild(para);

    correctDoggos[i].classList.remove("hidden");
    correctDoggos[i].classList.remove("gameDoggo");
    correctDoggos[i].classList.remove("currentDoggo");
    correctDoggos[i].classList.add("doggoPile");

    correctDoggoPile.appendChild(correctDoggos[i]);
  }

  len = incorrectDoggos.length
  for (var i = 0; i < len; i++)
  {
    // getting link to the doggo
    var doggoDivId  = incorrectDoggos[i].id;
    var splitString = doggoDivId.split("doggo-number-");
    var id = splitString[1];

    // img is a link to the big pic
    var img = incorrectDoggos[i].children[0];
    var link = document.createElement("a");
    link.href = secretDoggoList[id];
    link.target = "_blank";
    link.appendChild(img);
    incorrectDoggos[i].appendChild(link);

    // display breed
    var breedEncoded = incorrectDoggos[i].getAttribute("data-breed");
    var breedDecoded = caesarShift(breedEncoded, -4);
    var para = document.createElement("p");
    para.innerHTML = breedDecoded;
    para.classList.add("doggoPileText");

    incorrectDoggos[i].appendChild(para);

    incorrectDoggos[i].classList.remove("hidden");
    incorrectDoggos[i].classList.remove("gameDoggo");
    incorrectDoggos[i].classList.remove("currentDoggo");
    incorrectDoggos[i].classList.add("doggoPile");

    incorrectDoggoPile.appendChild(incorrectDoggos[i]);
  }
}

// I want to prepare new game when user reviews his previous game and then transition to the new game without reloading the page
function prepareTheNewGameFn()
{
  // reseting the last doggo flags
  game.lastDoggo = false;
  game.lastDoggoAnswered = false;

  // reseting the score
  game.score = 0;
  game.streak = 0;

  // reseting the correct/incorrect doggo count
  game.nCorrect = 0;
  game.nIncorrect = 0;

  // adding placeholder bones
  var bones = [];
  for (var i = 0; i < 3; i++)
  {
    // create bone element with a random color
    var bone = getABone();
    bone.classList.add("rotating");
    bones.push(bone);
  }
  var scoreDisplay = document.getElementById("scoreDisplay");
  var streakDisplay = document.getElementById("streakDisplay");
  var timerDisplay = document.getElementById("timerDisplay");

  scoreDisplay.innerHTML = "";
  streakDisplay.innerHTML = "";
  timerDisplay.innerHTML = "";

  scoreDisplay.appendChild(bones[0]);
  streakDisplay.appendChild(bones[1]);
  timerDisplay.appendChild(bones[2]);

  // prep the first doggo
  var dogContainer = document.getElementById("dog-container");
  var currentDoggo = dogContainer.children[0];
  game.currentDoggo = parseInt(currentDoggo.getAttribute("data-id"));
  currentDoggo.classList.add("currentDoggo");

  //loading 20 doggos
  flaskLoadDoggos();
  flaskLoadDoggos();
}

// Restars the game
var gameResetButton = document.getElementById("gameReset");
gameResetButton.addEventListener("click", newGame)
function newGame()
{
  var game = document.getElementById("game");
  var hscoreEntryState = document.getElementById("hscoreEntryState");

  // showing the game
  game.classList.remove("hidden");
  hscoreEntryState.classList.add("hidden");

  // clearing doggo piles
  removeElements("doggoPile");

  // resetting the score in hscoreEntryState
  document.getElementById("db-score").innerHTML = 0;
  // enable the hscore inputs
  document.getElementById("db-user").disabled = false;
  document.getElementById("favBreed").disabled = false;

  // show the submit hscore button
  var subHscoreButton = document.getElementById("subHscoreButton");
  subHscoreButton.classList.remove("hidden");
  subHscoreButton.disabled = false;

  // hide the success message
  var submitHscoreSuccess = document.getElementById("submitHscoreSuccess");
  submitHscoreSuccess.classList.add("hidden");

  // Appending placeholder bones to dog breed buttons
  // for some reason game.numberOfChoices does not work here - it's undefined.
  for (var i = 0; i < 4; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    // setting their html
    button.innerHTML = "";
    // reseting their color
    button.style.backgroundColor = "rgb(248, 249, 250)";
    button.style.borderColor = "rgb(107, 107, 107)";

    // create bone element with a random color
    var bone = getABone();
    bone.classList.add("rotating");
    button.appendChild(bone);
    button.disabled = false;
  }

  // starting new timer
  gameStartUp(setBreedButtons, gameTimer);
}


// animating flying bones on streaks
function throwBones(boneN)
{
  // create bone elements
  for (var i = 0; i < boneN; i++)
  {
    // create bone element with a random color
    var bone = getABone();
    bone.classList.add("bone")

    // bone position (without position it breaks)
    bone.style.position = 'absolute';
    bone.style.left = '0px';
    bone.style.top = '0px';

    // bones will be thrown in the game
    var game = document.getElementById("game");
    game.appendChild(bone);
  }

  // animate bones
  var boneElements = document.querySelectorAll(".bone");
  var len = boneElements.length;

  for (var i = 0; i < len; i++)
  {
    var boneEl = boneElements[i];

    // animate half bones from the left and half from the right
    if (i < len/2)
    {
      boneAnimationR(boneEl);
    }
    else
    {
      boneAnimationL(boneEl);
    }

    // remove bone elements from the document after 0.9 sec
    setTimeout(function()
    {
      removeElements("bone");
    }, 800);
  }
}

// animate bones so they fly from the left side of the doggo img to top-left corner of the document
function boneAnimationL(bone) {
  // bones originate from the picture not the document sides
  var currentDoggo = document.getElementsByClassName("currentDoggo");
  currentDoggo = currentDoggo[0];
  var cdImg = currentDoggo.children;
  cdImg = cdImg[0];
  var offsetLeft = cdImg.offsetLeft;
  var offsetTop = cdImg.offsetTop;
  var cdHeight = cdImg.offsetHeight;

  var maxY = offsetTop;
  var minY = offsetTop + cdHeight;
  var onTheLeft = offsetLeft;

  // animation on desktop - originates from the picture and flies to the edges
  if (screenWidth > 1001)
  {
    bone.keyframes = [
      {
        opacity: 1,
        transform: "translate3d(" + onTheLeft + "px, " + getRndInteger(minY, (minY - 50)) + "px, 0px)"
      },
      {
        opacity: 1,
        // first is left to right, second is bottom to top
        transform: " translate3d(" + getRndInteger((onTheLeft - 300), (onTheLeft - 30)) + "px, " + getRndInteger((minY - 60), (maxY - 200)) + "px, 0px) rotate(" + getRndInteger(0,540) + "deg)"
      }
    ];
  }
  // animation on mobile - originates from the top and flies to the bottom
  else
  {
    bone.keyframes = [
      {
        opacity: 1,
        // this is where they originate
        transform: "translate3d(" + getRndInteger(25, screenWidth / 2 - 25) + "px, " + 55 + "px, 0px)"
      },
      {
        opacity: 1,
        // this is where the bones fly to
        // first is left to right, second is bottom to top
        transform: " translate3d(" + getRndInteger(5, screenWidth / 2 - 5) + "px, " + getRndInteger(200, 400) + "px, 0px) rotate(" + getRndInteger(0,540) + "deg)"
      }
    ];

  }
 
  bone.animProps =
  {
    duration: 1000,
    easing: "ease-out",
    iterations: 1
  }
 
  var animationPlayer = bone.animate(bone.keyframes, bone.animProps);
}

// animate bones so they fly from the right side of the doggo img to top-right corner of the document
function boneAnimationR(bone) {
  // bones originate from the picture not the document sides
  var currentDoggo = document.getElementsByClassName("currentDoggo");
  currentDoggo = currentDoggo[0];
  var cdImg = currentDoggo.children;
  cdImg = cdImg[0];
  var offsetLeft = cdImg.offsetLeft;
  var offsetTop = cdImg.offsetTop;
  var cdWidth = cdImg.offsetWidth;
  var cdHeight = cdImg.offsetHeight;

  var maxY = offsetTop;
  var minY = offsetTop + cdHeight;
  var onTheRight = offsetLeft + cdWidth;

  // animation on desktop - originates from the picture and flies to the edges
  if (screenWidth > 1001)
  {
    bone.keyframes = [
      {
        opacity: 1,
        // this is where they originate
        transform: "translate3d(" + onTheRight + "px, " + getRndInteger(minY, (minY - 50)) + "px, 0px)"
      },
      {
        opacity: 1,
        // this is where the bones fly to
        // first is left to right, second is bottom to top
        transform: " translate3d(" + getRndInteger((onTheRight + 10), (onTheRight + 300)) + "px, " + getRndInteger((minY - 60), (maxY - 200)) + "px, 0px) rotate(" + getRndInteger(0,540) + "deg)"
      }
    ];
  }
  // animation on mobile - originates from the top and flies to the bottom
  else
  {
    bone.keyframes = [
      {
        opacity: 1,
        // this is where they originate
        transform: "translate3d(" + getRndInteger(screenWidth / 2, screenWidth - 25) + "px, " + 55 + "px, 0px)"
      },
      {
        opacity: 1,
        // this is where the bones fly to
        // first is left to right, second is bottom to top
        transform: " translate3d(" + getRndInteger(screenWidth / 2 , screenWidth - 5) + "px, " + getRndInteger(200, 400) + "px, 0px) rotate(" + getRndInteger(0,540) + "deg)"
      }
    ];
  }
 
  bone.animProps =
  {
    duration: 1000,
    easing: "ease-out",
    iterations: 1
  }
 
  var animationPlayer = bone.animate(bone.keyframes, bone.animProps);
}

// submitting the hscore form
// https://stackoverflow.com/questions/25983603/how-to-submit-html-form-without-redirection
var subFormButton = document.getElementById("subHscoreButton");
subFormButton.addEventListener("click", subForm);

// deletes the error message on input
var dbUser = document.getElementById("db-user");
var userMsg = document.getElementById("db-user-error-msg");
var breedMsg = document.getElementById("db-favBreed-error-msg");

dbUser.addEventListener("input", function(){
  if(dbUser.value.length != 0)
  {
    userMsg.innerHTML = "";
  }
})

function subForm(e){
    e.preventDefault();

    // naively validating score
    var score = document.getElementById("form-score").value;
    if (score > 4500)
    {
      subFormButton.innerHTML = "Are you a cheater?";
      subFormButton.disabled;
      subButtonDiv = document.getElementById("subButtonWrapper");
      var cheaterDiv = document.createElement("div");
      subButtonDiv.appendChild(cheaterDiv)
      var yes = document.createElement("button");
      yes.innerHTML = "Yes.";
      yes.type = "button";
      var a = document.createElement("a");
      a.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      a.appendChild(yes);
      cheaterDiv.appendChild(a);

      var no = document.createElement("button");
      no.innerHTML = "No";
      no.type = "button";
      no.addEventListener("click", function(){
        var p = document.createElement("p");
        p.innerHTML = "Ok, you can submit your score. I promise it won't load viruses to your computer.";
        cheaterDiv.appendChild(p);

        var cheaterSubmit = document.createElement("button");
        cheaterSubmit.innerHTML = "I am not a cheater and I want to submit my score.";

        cheaterDiv.appendChild(cheaterSubmit);
      })
      cheaterDiv.appendChild(no);

      return;
    }

    // validating username
    var usr = dbUser.value.toLowerCase();
    if (usr.length == 0)
    {
      userMsg.innerHTML = "Enter your nickname!";
      userMsg.style.color = "#F8333C";
      return;
    }
    if (usr.includes("hitler"))
    {
      userMsg.innerHTML = "No.";
      userMsg.style.color = "#F8333C";
      return;
    }
    else
    {
      userMsg.innerHTML = "";
    }

    // validating fav dog breed
    var favBreed = document.getElementById("favBreed");
    if (favBreed.value.length == 0)
    {
      breedMsg.innerHTML = "It's going to be Chihuahua then!";
      breedMsg.style.color = "#F8333C";
      favBreed.value = "Chihuahua";
    }
    else
    {
      breedMsg.innerHTML = "";
    }

    // send data to the database
    var url=$(this).closest('form').attr('action'),
    data=$(this).closest('form').serialize();
    $.ajax({
        url: url,
        type: 'post',
        data: data,
        beforeSend: function(xhr, settings) {
          //https://flask-wtf.readthedocs.io/en/stable/csrf.html?fbclid=IwAR25LkK-Hw3ii8UuL-tD-GVVVYcve8XqMNV8VM1TB0Gh-JxQcBVcpSmH2BU
          if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain)
          {
            xhr.setRequestHeader("X-CSRFToken", csrf_token);
          }

          // disable the inputs
          dbUser.disabled = "true";
          document.getElementById("favBreed").disabled = "true";
          subFormButton.disabled = "true";
          subFormButton.innerHTML = "";

          // animate the bone
          var bone = getABone();
          bone.classList.add("rotating");
          subFormButton.appendChild(bone);
        },

        success: function() {
          // show the success message
          setTimeout( function() {
            // hide the button and prep it
            subFormButton.classList.add("hidden");
            var c = subFormButton.childNodes;
            c[0].parentNode.removeChild(c[0]);
            subFormButton.innerHTML = "Submit";

            var submitHscoreSuccess = document.getElementById("submitHscoreSuccess");
            submitHscoreSuccess.classList.remove("hidden");
          }, 1500);

         // remove the breed error message if it exists
         setTimeout( function() { breedMsg.innerHTML = "";}, 2500);
       }
   });
}

/* MEDIA */

// For devices with screen width of less than 1000px
if (screenWidth < 1001)
{
  // remove padding from the main wrapper
  var main = document.getElementById("main");
  main.classList.remove("p-5");
  main.classList.remove("container");

  // remove width150 from the dashboard elements
  var parent = document.getElementById("scoreDashboard");
  var width150Elements = parent.children
  var len = width150Elements.length;
  for(var i = 0; i < len; i++)
  {
    width150Elements[i].classList.remove("width150");
    if (i == 0 || i == 1)
    {
      width150Elements[i].classList.add("width130");
    }
    else if (i == 2)
    {
      width150Elements[i].classList.add("width20");
    }
  }
}



function sendData(data)
{
  dataJSON = JSON.stringify(data)
  $.ajax({
    type : "POST",
    url : '/collectData',
    dataType: "json",
    data: dataJSON,
    contentType: 'application/json;charset=UTF-8',
  });
}

// flask call
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// https://stackoverflow.com/questions/5316697/jquery-return-data-after-ajax-call-success
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

      // creating a secret list key value paris of doggo id - doggo link
      // used for doggo piles at the end of the game
      secretDoggoList[doggoId] = dogs[i][0];

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

// Timer helper class from: https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
function Timer(fn, t) {
  var timerObj = setInterval(fn, t);

  this.stop = function() {
      if (timerObj) {
          clearInterval(timerObj);
          timerObj = null;
      }
      return this;
  }

  // Start timer using current settings (if it's not already running)
  this.start = function() {
      if (!timerObj) {
          this.stop();
          timerObj = setInterval(fn, t);
      }
      return this;
  }

  // Restart with original interval, stop current interval
  this.reset = function() {
      isTimerOver = false;
      return this.stop().start();
  }
}

// https://stackoverflow.com/questions/18152719/animate-number-incrementing
function animateResultCount(number, target, elem) {
    if(number < target) {
        var interval = setInterval(function() {
            $(elem).text(number);
            if (number >= target) {
                clearInterval(interval);
                return;
            }
            number++;
        }, 30);
    }
    if(target < number) {
        var interval = setInterval(function() {
            $(elem).text(number);
            if (target >= number) {
                clearInterval(interval);
                return;
            }
            number--;
        }, 30);
    }
}


// doggo breeds list
ALL_BREEDS = ['Chihuahua', 'Japanese Spaniel', 'Maltese Dog', 'Pekinese', 'Shih Tzu', 'Blenheim Spaniel', 'Papillon', 'Toy Terrier', 'Rhodesian Ridgeback', 'Afghan Hound', 'Basset', 'Beagle', 'Bloodhound',  'Bluetick', 'Black And Tan Coonhound', 'Walker Hound', 'English Foxhound', 'Redbone', 'Borzoi', 'Irish Wolfhound', 'Italian Greyhound', 'Whippet', 'Ibizan Hound', 'Norwegian Elkhound', 'Otterhound', 'Saluki', 'Scottish Deerhound', 'Weimaraner', 'Staffordshire Bullterrier', 'American Staffordshire Terrier', 'Bedlington Terrier', 'Border Terrier', 'Kerry Blue Terrier', 'Irish Terrier', 'Norfolk Terrier', 'Norwich Terrier', 'Yorkshire Terrier', 'Wire Haired Fox Terrier', 'Lakeland Terrier', 'Sealyham Terrier', 'Airedale', 'Cairn', 'Australian Terrier', 'Dandie Dinmont', 'Boston Bull', 'Miniature Schnauzer', 'Giant Schnauzer', 'Standard Schnauzer', 'Scotch Terrier', 'Tibetan Terrier', 'Silky Terrier', 'Soft Coated Wheaten Terrier', 'West Highland White Terrier', 'Lhasa', 'Flat Coated Retriever', 'Curly Coated Retriever', 'Golden Retriever', 'Labrador Retriever', 'Chesapeake Bay Retriever', 'German Short Haired Pointer', 'Vizsla', 'English Setter', 'Irish Setter', 'Gordon Setter', 'Brittany Spaniel', 'Clumber', 'English Springer', 'Welsh Springer Spaniel', 'Cocker Spaniel', 'Sussex Spaniel', 'Irish Water Spaniel', 'Kuvasz', 'Schipperke', 'Groenendael', 'Malinois', 'Briard', 'Kelpie', 'Komondor', 'Old English Sheepdog', 'Shetland Sheepdog', 'Collie', 'Border Collie', 'Bouvier Des Flandres', 'Rottweiler', 'German Shepherd', 'Doberman', 'Miniature Pinscher', 'Greater Swiss Mountain Dog', 'Bernese Mountain Dog', 'Appenzeller', 'Entlebucher', 'Boxer', 'Bull Mastiff', 'Tibetan Mastiff', 'French Bulldog', 'Great Dane', 'Saint Bernard', 'Eskimo Dog', 'Malamute', 'Siberian Husky', 'Affenpinscher', 'Basenji', 'Pug', 'Leonberg', 'Newfoundland', 'Great Pyrenees', 'Samoyed', 'Pomeranian', 'Chow', 'Keeshond', 'Brabancon Griffon', 'Pembroke', 'Cardigan', 'Toy Poodle', 'Miniature Poodle', 'Standard Poodle', 'Mexican Hairless', 'Dingo', 'Dhole', 'African Hunting Dog']

// Streak
var STREAK_CONGRATZ =
[
  "ok",
  "sweet",
  "great",
  "ambitious",
  "confidant",
  "qualified",
  "impressive",
  "wonderful",
  "life-changing",
  "savvy",
  "grand",
  "dedicated",
  "highly regarded",
  "impressive",
  "spectacular",
  "stunning",
  "monumental",
  "superior",
  "unmatched",
  "unlimited"
]

//https://www.thesprucepets.com/punny-names-for-dogs-4842364
var DOG_NAMES =
[
  "Jimmy Chew",
"Elmo",
"Little Bow Wow",
"Notorious D.O.G",
"Bullwinkle",
"Bacon",
"Taco",
"Bark Twain",
"Furdinand",
"Kanye Westie",
"Bacon",
"Lady Rover",
"Taco",
"Barkley",
"Subwoofer",
"Chewie",
"Einstein",
"Elmo",
"Slink",
"Snoop Doggie Dog",
"Little Bow Wow",
"Oscar Mayer",
"Meatball",
"Meatloaf",
"Muddy Buddy",
"Nacho",
"Charlie Brown",
"Cookie Monster",
"E.T.",
"Hooch",
"McGruff",
"Cinder Ella",
"Pee Wee",
"Munchkin",
"Phideaux (“Fi-Dough”)",
"Porkchop",
"Chewbacca",
"Pup Tart",
"Sir Licks-a-lot",
"Sir Barks-a-lot",
"Sushi",
"Miss Piggy",
"Tater",
"Waffles",
"Waldo",
"Bingo",
"Woofer",
"Muttley Cru",
"Bark Twain",
"Chew Barka",
"Kanye Westie",
"Droolius Caesar",
"Furdinand",
"Jimmy Chew",
"Orville Redenbarker",
"Salvador Dogi",
"Spark Pug",
"Sherlock Bones",
"Woofgang Amadeus",
"50 Scent",
"Groucho Barks",
"Indiana Bones",
"Catherine Zeta Bones",
"Al Poo-chino",
"Woofgang Puck",
"Fresh Prints",
"Mary Puppins",
"Winnie the Pooch",
"Angus",
"Bear",
"Beethoven",
"Bruiser",
"Brutus",
"Button",
"Byte",
"Dozer",
"Jellybean",
"Jitterbug",
"King Kong",
"Rambo",
"Spud",
"Subwoofer",
"Squirt",
"Tank",
"Gumdrop",
"Boss",
"Atom",
"Bubba",
"Bullwinkle",
"Butterball",
"Captain Chaos",
"Chuck Norris",
"Marshmallow",
"Mac Daddy",
"Napoleon",
"Pee Wee",
"Queen Bey",
"Tiny",
"The Notorious D.O.G",
"Cloud",
"Marshmallow",
"Noodle",
"Ringo",
"Taz",
"Ziggy",
"Harry",
"Shaggy",
"Bear",
"Simba",
"Wookiee",
"Scruffy",
"Ruffles",
"Andy Warhowl",
"Arfer Fonzarelli",
"Arf Vader",
"Chewbarka",
"Fuzz Aldrin",
"Hairy Paw-ter",
"Helga Hufflepup",
"Indiana Bones",
"Jude Paw",
"Kanye Westie",
"Lick Jagger",
"Mutt Damon",
"Snarls Barkley",
"Winnie the Pooch",
"Arf Maul",
"Arftoo-D2",
"Arf Vader",
"Boba Fetch",
"Chewbarka",
"C3 Pee-O",
"Jabba the Mutt",
"James Earl Bones",
"Luke Skybarker",
"Obi Wag Kenobi",
"Dumbledog",
"Godric Gryffindog",
"Hairy Paw-ter",
"Helga Hufflepup",
"JK Growling",
"Ron Fleasly",
"Rowena Ravenpaw",
"Salazar Snifferin",
"Arfer Fonzarelli",
"Beowoof",
"Bilbo Waggins",
"Furcules",
"Indiana Bones",
"Mary Puppins",
"Santa Paws",
"Sherlock Bones",
"Winnie the Pooch",
"Bark Wahlberg",
"Benedict Cumberbark",
"Howly Mandel",
"Jude Paw",
"Mutt Damon",
"Ryan Fleacrest",
"Sarah Jessica Barker",
"Woofie Goldberg",
"Andy Warhowl",
"Bark Obama",
"Bark Twain",
"Colin Howl",
"Droolius Caesar",
"Fuzz Aldrin",
"Heel Armstrong",
"Jimmy Chew",
"Karl Barx",
"Rosa Barks",
"Salvador Dogi",
"Snarls Barkley",
"Vera Fang",
"Winston Furchill",
"Woofgang Puck",
"Woof Bader Ginsburg",
"Woof Blitzer",
"50 Scent",
"Alanis Morissetter",
"Bone Pugs-N-Harmony",
"Christina Waguilera",
"Hairy Underwood",
"Jon Bone Jovi",
"Kanye Westie",
"Lick Jagger",
"L.L. Drool J",
"Muttley Crew",
"Nine Inch Tails",
"The Notorious D.O.G.",
"Olivia Chewton John",
"Ozzy Pawsborne"
]

var CONGRATZ =
[
  "amazing",
"ambitious",
"aspiring",
"astounding",
"awe-inspiring",
"best",
"better",
"brilliant",
"celebrated",
"celebratory",
"certain",
"challenging",
"compelling",
"confidant",
"congratulatory",
"consummate",
"dedicated",
"deserving",
"driven",
"eminent",
"energetic",
"massive",
"momentous",
"monumental",
"moving",
"notable",
"outstanding",
"passionate",
"phenomenal",
"profound",
"proud",
"qualified",
"recent",
"remarkable",
"satisfying",
"savvy",
"self-assured",
"sensational",
"skilled",
"smart",
"special",
"spectacular",
"exciting",
"exemplary",
"extraordinary",
"focused",
"grand",
"great",
"gutsy",
"hard",
"hardworking",
"heartfelt",
"highly regarded",
"honoarble",
"impassioned",
"important",
"impressive",
"innovative",
"inspired",
"inspiring",
"intelligent",
"life-changing",
"limitless",
"stunning",
"successful",
"superb",
"superior",
"talented",
"thrilled",
"thrilling",
"top-notch",
"touching",
"triumphant",
"ultimate",
"unlimited",
"unmatched",
"up-and-coming",
"victorious",
"visionary",
"well-deserved",
"well-done",
"winning",
"wonderful"
]

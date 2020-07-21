// keep track of the current doggo
var game = {};
game.currentDoggo = 0;
game.currentDoggoBreed = null;
game.nCorrect = 0;
game.nIncorrect = 0;
game.score = 0;
game.streak = 0;
game.lastDoggo = false;
game.lastDoggoAnswered = false;

var documentHeight = document.body.clientHeight;
var documentWidth = document.body.clientWidth;

// start the timer only when the page loads
window.addEventListener("load", function()
{
  // keep track of how many doggos I have loaded
  game.doggosRemaining = 15;

  // countdown before the game start into game start
  gameStartUp(setBreedButtons, gameTimer);
});

function gameStartUp(breeds, timer)
{
  // disable the game reset button and add the placeholder bone
  var gameResetButton = document.getElementById("gameReset");
  gameResetButton.innerHTML = "";
  gameResetButton.disabled = true;
  for(var i = 0; i < 4; i++)
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
  var msgText = "Woof! ";

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
      msg.classList.remove("textScaling");

      clearInterval(interval);
    }
    // starting the timer and counters
    else if (n == 1)
    {
      timer(4); //61 works well for a minute
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
  breedsForButtons.push(currentDoggoBreed);

  // https://stackoverflow.com/questions/9792927/javascript-array-search-and-remove-string
  // making sure I only get one occurance of each breed in buttons
  let arr = ALL_BREEDS;
  arr = arr.filter(e => e !== currentDoggoBreed);

  // getting 5 random doggo breeds from the list
  for (var i = 0; i < 5; i++)
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
  for (var i = 0; i < 6; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    // setting their html and value
    button.innerHTML = breedsForButtons[i];
    button.value = breedsForButtons[i];
    button.style.backgroundColor = "#f8f9fa";

    // checking the answer on button click
    button.addEventListener("click", doggoBreedCheck);
  }
}

// checking the answer
function doggoBreedCheck()
{
  var doggoNumber = "doggo-number-" + game.currentDoggo;
  var doggoElement = document.getElementById(doggoNumber);
  var streakDisplay = document.getElementById("streakDisplay");
  var scoreDisplay = document.getElementById("scoreDisplay");

  if (this.value == game.currentDoggoBreed)
  {
    // giving player more bones on higher streaks
    animateResultCount(game.streak, (game.streak + 1), streakDisplay);

    game.streak += 1;
    boneN = game.streak * 5
    // limiting boneN to 100
    if (boneN > 100)
    {
      boneN = 100;
    }

    // animating the score (bone) count
    animateResultCount(game.score, (game.score + boneN), scoreDisplay);
    game.score += boneN;

    // bone animation
    throwBones(boneN);

    // blink this button green
    this.style.backgroundColor = "#44AF69";

    // displaying congratz
    var message = capitalizeFirstLetter(CONGRATZ[Math.floor(Math.random() * CONGRATZ.length)]) + " " + DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)];
    document.getElementById("message").innerHTML = message;

    // preping the end screen doggo pile
    game.nCorrect++;
    correctDoggos.push(doggoElement);
  }
  else
  {
    // blinking the wrong choice red and the correct button green
    this.style.backgroundColor = "#F8333C";
    for (var i = 0; i < 6; i++)
    {
      // getting the breed buttons
      var str = "button" + (i + 1);
      var button = document.getElementById(str);
      if (button.value == game.currentDoggoBreed)
      {
        button.style.backgroundColor = "#44AF69";
      }
    }

    // 0-ing the streak
    animateResultCount(game.streak, 0, streakDisplay);
    game.streak = 0;

    // displaying negative congratz
    var message = capitalizeFirstLetter(WRONG[Math.floor(Math.random() * WRONG.length)]) + " " + DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)];
    document.getElementById("message").innerHTML = message;

    // preping the end screen doggo pile
    game.nIncorrect++;
    incorrectDoggos.push(doggoElement);
  }

  // waiting for the user to answer the last doggo querry
  if (game.lastDoggo)
  {
    // disabling the buttons after the answer (otherwise user could click several buttons)
    for (var i = 0; i < 6; i++)
    {
      // getting the breed buttons
      var str = "button" + (i + 1);
      var button = document.getElementById(str);
      button.disabled = "true";
    }
    game.lastDoggoAnswered = true;
  }
  // wait 300 and show the next doggo
  else
  {
    setTimeout(function(){ nextDoggo(); }, 300);
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

  //nextDoggoElement.classList.remove("hidden");
  nextDoggoElement.classList.add("currentDoggo");

  game.currentDoggo++;

  // load new doggos when there is less than 15 doggos
  game.doggosRemaining--;
  if (game.doggosRemaining < 15)
  {
    flaskLoadDoggos();
    game.doggosRemaining += 10;
  }

  setBreedButtons();
}

function gameTimer(value) {
  // Timer variables
  var timerValue = value * 1000;
  var n = 0;
  var isTimerOver = false;

  // Update the count down every second
  var timer = new Timer(function()
  {
    // Every second update the iterating variable
    n += 1 * 1000;

    // Find the distance between now and the count down date
    var distance = timerValue - n;

    // Never let distance be less than 0
    if (distance < 0)
    {
      distance = 0
    }

    // Time calculations for minutes and seconds
    // toLocaleString to display 01
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    var seconds = Math.floor((distance % (1000 * 60)) / 1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    // Display the timer in the element with id="timerDisplay"
    var timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.innerHTML = minutes + ":" + seconds;

    // When the countdown is finished transition between game state and hight score entry state
    if (distance <= 0)
    {
      // giving the user time to answer the last doggo
      game.lastDoggo = true;
      isTimerOver = true;

      // waiting for the last answer
      if (game.lastDoggoAnswered)
      {
        timer.stop();

        // finishes the game and starts preparing the new game
        finishTheGame();
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
    gameResetButton.disabled = false
    gameResetButton.innerHTML = "New game";
  }, 1500);
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

  // show how many doggos user guessed correcty/incorrectly
  var spanNCorrect = document.getElementById("spanNCorrect");
  if (game.nCorrect == 1)
  {
    spanNCorrect.innerHTML = game.nCorrect + " doggo:";
  }
  else
  {
    spanNCorrect.innerHTML = game.nCorrect + " doggos:";
  }

  var spanNCorrect = document.getElementById("spanNIncorrect");
  if (game.nIncorrect == 1)
  {
    spanNIncorrect.innerHTML = game.nIncorrect + " doggo";
  }
  else
  {
    spanNIncorrect.innerHTML = game.nIncorrect + " doggos";
  }

  // show correctly and incorrectly guessed doggos
  var correctDoggoPile = document.getElementById("correctDoggoPile");
  var incorrectDoggoPile = document.getElementById("incorrectDoggoPile");

  len = correctDoggos.length
  for (var i = 0; i < len; i++)
  {
    // display breed
    var breed = correctDoggos[i].getAttribute("data-breed");
    var para = document.createElement("p");
    para.innerHTML = breed;
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
    // display breed
    var breed = incorrectDoggos[i].getAttribute("data-breed");
    var para = document.createElement("p");
    para.innerHTML = breed;
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
  // destroy doggos in the dog container
  removeElements("gameDoggo");
  game.doggosRemaining = 0;

  // reseting the last doggo flags
  game.lastDoggo = false;
  game.lastDoggoAnswered = false;

  // reseting the score
  game.score = 0;
  game.streak = 0;

  // reseting the correct/incorrect doggo count
  game.nCorrect = 0;
  game.nIncorrect = 0;

  //adding placeholder bones
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

  // load new doggos
  var dogContainer = document.getElementById("dog-container");

  game.currentDoggo = -1;
  // creating a div - container for img and data
  var placeholderDoggoId = -1;
  var placeholderNode = document.createElement("div");
  placeholderNode.id = "doggo-number-" + placeholderDoggoId;
  placeholderNode.classList.add("hidden");
  placeholderNode.classList.add("currentDoggo");
  placeholderNode.classList.add("gameDoggo");
  placeholderNode.setAttribute("data-id", placeholderDoggoId);

  // appending the element to the game
  dogContainer.appendChild(placeholderNode);

  //loading 20 doggos
  flaskLoadDoggos();
  game.doggosRemaining += 10;
  flaskLoadDoggos();
  game.doggosRemaining += 10;
}

// Restars the game
var gameResetButton = document.getElementById("gameReset");
gameResetButton.addEventListener("click", newGame)
function newGame()
{
  // resetting the msg
  var dbUser = document.getElementById("db-user");
  var msg = document.getElementById("message");
  if (dbUser.value.length == 0)
  {
    msg.innerHTML = "Good Luck " + "Chihuahua " + "!";
  }
  else
  {
    msg.innerHTML = "Good Luck " + dbUser.value + "!";
  }

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

  // moving from placeholder doggo to a proper doggo
  nextDoggo();
  // Appending placeholder bones to dog breed buttons
  for (var i = 0; i < 6; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    // setting their html
    button.innerHTML = "";
    // create bone element with a random color
    var bone = getABone();
    bone.classList.add("rotating");
    button.appendChild(bone);
    button.disabled = false;
  }

  // removing the placeholder doggo
  var dogContainer = document.getElementById("dog-container");
  dogContainer.removeChild(dogContainer.getElementsByTagName('div')[0]);

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
    }, 900);
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
 
  bone.animProps =
  {
    duration: 1000,
    easing: "ease-out",
    iterations: 1
  }
 
  var animationPlayer = bone.animate(bone.keyframes, bone.animProps);
}

function getABone()
{
  // random color https://stackoverflow.com/questions/1484506/random-color-generator
  var rcolor = "#"+((1<<24)*Math.random()|0).toString(16)
  // create bone element with a random color
  var bone = document.createElement("i");
  bone.classList.add("fas");
  bone.classList.add("fa-bone");
  bone.style.color = rcolor;

  return bone;
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
        url:url,
        type:'post',
        data:data,
        beforeSend: function() {
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

  // creating doggo nodes
  var count = Object.keys(dogs).length;
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

    // creating an img element
    var img = document.createElement("img");
    img.src = dogs[i][0];
    img.classList.add("doggoImg")
    node.appendChild(img);

    // appending the element to the game
    dogContainer.appendChild(node);
  }
}

// removing all elements with a class from the document
function removeElements(className)
{
  var list = document.getElementsByClassName(className);

  while(list[0]){
    list[0].parentNode.removeChild(list[0]);
  }
}

// https://javascript.info/task/shuffle#:~:text=function%20shuffle%20(%20array%20)%20%7B%20array,That%20somewhat%20works%2C%20because%20Math.
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// https://www.w3schools.com/js/js_random.asp
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function capitalizeFirstLetter(str)
{
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
var ALL_BREEDS =
['Affenpinscher', 'African', 'Airedale', 'Akita', 'Appenzeller', 'Australian Shepherd', 'Basenji', 'Beagle', 'Bluetick', 'Borzoi', 'Bouvier', 'Boxer', 'Brabancon', 'Briard',
'Buhund Norwegian', 'Bulldog Boston', 'Bulldog English', 'Bulldog French', 'Bullterrier Staffordshire', 'Cairn', 'Cattledog Australian', 'Chihuahua', 'Chow', 'Clumber',
'Cockapoo', 'Collie Border', 'Coonhound', 'Corgi Cardigan', 'Cotondetulear', 'Dachshund', 'Dalmatian', 'Dane Great', 'Deerhound Scottish', 'Dhole', 'Dingo', 'Doberman',
'Elkhound Norwegian', 'Entlebucher', 'Eskimo', 'Finnish Lapphund', 'Frise Bichon', 'Germanshepherd', 'Greyhound Italian', 'Groenendael', 'Havanese', 'Hound Afghan',
'Hound Basset', 'Hound Blood', 'Hound English', 'Hound Ibizan', 'Hound Plott', 'Hound Walker', 'Husky', 'Keeshond', 'Kelpie', 'Komondor', 'Kuvasz', 'Labrador', 'Leonberg',
'Lhasa', 'Malamute', 'Malinois', 'Maltese', 'Mastiff Bull', 'Mastiff English', 'Mastiff Tibetan', 'Mexicanhairless', 'Mix', 'Mountain Bernese', 'Mountain Swiss', 'Newfoundland',
'Otterhound', 'Ovcharka Caucasian', 'Papillon', 'Pekinese', 'Pembroke', 'Pinscher Miniature', 'Pitbull', 'Pointer German', 'Pointer Germanlonghair', 'Pomeranian',
'Poodle Miniature', 'Poodle Standard', 'Poodle Toy', 'Pug', 'Puggle', 'Pyrenees', 'Redbone', 'Retriever Chesapeake', 'Retriever Curly', 'Retriever Flatcoated',
'Retriever Golden', 'Ridgeback Rhodesian', 'Rottweiler', 'Saluki', 'Samoyed', 'Schipperke', 'Schnauzer Giant', 'Schnauzer Miniature', 'Setter English', 'Setter Gordon',
'Setter Irish', 'Sheepdog English', 'Sheepdog Shetland', 'Shiba', 'Shihtzu', 'Spaniel Blenheim', 'Spaniel Brittany', 'Spaniel Cocker', 'Spaniel Irish', 'Spaniel Japanese',
'Spaniel Sussex', 'Spaniel Welsh', 'Springer English', 'Stbernard', 'Terrier American', 'Terrier Australian', 'Terrier Bedlington', 'Terrier Border', 'Terrier Dandie',
'Terrier Fox', 'Terrier Irish', 'Terrier Kerryblue', 'Terrier Lakeland', 'Terrier Norfolk', 'Terrier Norwich', 'Terrier Patterdale', 'Terrier Russell', 'Terrier Scottish',
'Terrier Sealyham', 'Terrier Silky', 'Terrier Tibetan', 'Terrier Toy', 'Terrier Westhighland', 'Terrier Wheaten', 'Terrier Yorkshire', 'Vizsla', 'Waterdog Spanish', 'Weimaraner',
'Whippet', 'Wolfhound Irish']


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

var WRONG =
[
"apprehension",
"avoid",
"back down",
"be lazy",
"choke",
"delay",
"detour",
"dodge",
"err",
"everyday",
"fail",
"failure",
"fall",
"falter",
"fluctuate",
"flunk",
"fruitless",
"neglect",
"partied too much",
"past due",
"powerless",
"premature",
"scared",
"self-doubt",
"shirk",
"shy",
"sidetracked",
"sit around",
"stagnant",
"stray",
"student loans",
"stumble",
"talentless",
"undecided",
"going nowhere",
"hapless",
"hesitant",
"hesitate",
"hopeless",
"in vain",
"inability",
"incapable",
"incompetent",
"indecisive",
"ineffective",
"inept",
"irresolute",
"lack of drive",
"laziness",
"lazy",
"lethargy",
"unfulfilled",
"uninspired",
"unintelligent",
"unlucky",
"unmotivated",
"unprofitable",
"unsuccessful",
"unsure",
"up in the air",
"useless",
"waver",
"wavering",
"weak",
"worthless",
"would-be"
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

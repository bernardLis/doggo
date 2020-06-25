// keep track of the current doggo
var game = {};
game.currentDoggo = 0;
game.currentDoggoBreed = null;
game.score = 0;


// setting up the game on window load
window.onload = function()
{
  setBreedButtons();
};

function setBreedButtons()
{

  breedsForButtons = []

  // getting 5 random doggo breeds from the list
  for (var i = 0; i < 5; i++)
  {
    var b = ALL_BREEDS[Math.floor(Math.random() * ALL_BREEDS.length)];
    breedsForButtons.push(b);
  }

  // getting breed of the current doggo
  var doggoNumber = "doggo-number-" + game.currentDoggo
  var doggoElement = document.getElementById(doggoNumber);
  currentDoggoBreed = doggoElement.getAttribute("data-breed");
  game.currentDoggoBreed = currentDoggoBreed;
  breedsForButtons.push(currentDoggoBreed);

  // shuffling the array
  shuffle(breedsForButtons);

  // adding breeds to buttons
  for (var i = 0; i < 6; i++)
  {
    // getting the breed buttons
    var str = "button" + (i + 1);
    var button = document.getElementById(str);
    // setting their html
    button.innerHTML = breedsForButtons[i];
    button.value = breedsForButtons[i];

    // checking the answer on button click
    button.addEventListener("click", doggoBreedCheck);
  }
}

function doggoBreedCheck()
{
  if (this.value == game.currentDoggoBreed)
  {
    // Adding to the score
    game.score += 100
    document.getElementById("scoreDisplay").innerHTML = game.score;

    // displaying congratz
    var message = CONGRATZ[Math.floor(Math.random() * CONGRATZ.length)];
    document.getElementById("message").innerHTML = message;

    // 0 for success
    nextDoggo(0);
    return;
  }
  else
  {
    // displaying negative congratz
    var message = WRONG[Math.floor(Math.random() * WRONG.length)];
    document.getElementById("message").innerHTML = message;

    // 1 for failure
    nextDoggo(1);
    return;
  }
}

// showing next doggo
function nextDoggo(success)
{
  var dogContainer = document.getElementById("dog-container");
  var correctCheck = document.getElementById("correctCheck");
  var wrongCheck = document.getElementById("wrongCheck");

  var doggoNumber = "doggo-number-" + game.currentDoggo;
  var nextDoggo = "doggo-number-" + (game.currentDoggo + 1);

  var doggoElement = document.getElementById(doggoNumber);

  // giving player feedback to his answer
  if (success == 0)
  {
    correctDoggos.push(doggoElement);
    correctCheck.classList.remove("hidden");
    wrongCheck.classList.add("hidden");
  }
  else
  {
    incorrectDoggos.push(doggoElement);
    wrongCheck.classList.remove("hidden");
    correctCheck.classList.add("hidden");
  }

  doggoElement.classList.remove("currentDoggo");
  doggoElement.classList.add("hidden");

  var nextDoggoElement = document.getElementById(nextDoggo);
  nextDoggoElement.classList.remove("hidden");
  nextDoggoElement.classList.add("currentDoggo");

  game.currentDoggo++;

  game.doggosRemaining--;
  if (game.doggosRemaining < 15)
  {
    flaskLoadDoggos();
    game.doggosRemaining += 10;
  }

  setBreedButtons();
}


// start the timer only when the page loads
window.addEventListener("load", function()
{

  // keep track of how many doggos I have loaded
  game.doggosRemaining = 15;


  // Timer variables
  var timerValue = 15 * 1000;
  var n = 0;
  var isTimerOver = false;

  // arrays for storing doggos
  correctDoggos = [];
  incorrectDoggos = [];

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
    timerDisplay.innerHTML = minutes + ":" + seconds;

    // When the countdown is finished pause timer
    if (distance <= 0)
    {
      isTimerOver = true;
      timer.stop();

      // hide the game, show the hscore entry
      var gameContainer = document.getElementById("game");
      gameContainer.classList.add("hidden");

      var hscoreEntryState = document.getElementById("hscoreEntryState");
      hscoreEntryState.classList.remove("hidden");

      var dbScore = document.getElementById("db-score");
      var formScore = document.getElementById("form-score");

      dbScore.innerHTML = game.score;
      formScore.value = game.score;

      // show correct and incorrect doggos
      var correctDoggoPile = document.getElementById("correctDoggoPile");
      var incorrectDoggoPile = document.getElementById("incorrectDoggoPile");
      len = correctDoggos.length
      for (var i = 0; i < len; i++)
      {
        var breed = correctDoggos[i].getAttribute("data-breed");
        var para = document.createElement("p");
        para.innerHTML = breed;
        para.classList.add("doggoPileText");

        correctDoggos[i].appendChild(para);

        correctDoggos[i].classList.remove("hidden");
        correctDoggos[i].classList.add("doggoPile");

        correctDoggoPile.appendChild(correctDoggos[i]);
      }
      len = incorrectDoggos.length
      for (var i = 0; i < len; i++)
      {
        var breed = incorrectDoggos[i].getAttribute("data-breed");
        var para = document.createElement("p");
        para.innerHTML = breed;
        para.classList.add("doggoPileText");

        incorrectDoggos[i].appendChild(para);

        incorrectDoggos[i].classList.remove("hidden");
        incorrectDoggos[i].classList.add("doggoPile");

        incorrectDoggoPile.appendChild(incorrectDoggos[i]);
      }


    }
  }, 1000);
});


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
      //asd
      appendDoggos(data)
  	}
	});
}

//appending doggos to the document
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

// https://javascript.info/task/shuffle#:~:text=function%20shuffle%20(%20array%20)%20%7B%20array,That%20somewhat%20works%2C%20because%20Math.
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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


// lists
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

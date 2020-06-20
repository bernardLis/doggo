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

    console.log("yes");
    console.log(this.value);
    console.log(game.currentDoggoBreed);

    // displaying congratz
    var message = CONGRATZ[Math.floor(Math.random() * CONGRATZ.length)];
    document.getElementById("message").innerHTML = message;

    nextDoggo();
    return;
  }
  else
  {
    console.log("no");
    console.log(this.value);
    console.log(game.currentDoggoBreed);

    // displaying negative congratz
    var message = WRONG[Math.floor(Math.random() * WRONG.length)];
    document.getElementById("message").innerHTML = message;

    nextDoggo();
    return;
  }
}

// skips a doggo
document.getElementById("skip").addEventListener("click", nextDoggo);

// showing next doggo
function nextDoggo()
{
  console.log("in next dogoo");
  var doggoNumber = "doggo-number-" + game.currentDoggo;
  var nextDoggo = "doggo-number-" + (game.currentDoggo + 1);

  var doggoElement = document.getElementById(doggoNumber);
  doggoElement.classList.add("hidden");
  doggoElement.classList.remove("currentDoggo");

  var nextDoggoElement = document.getElementById(nextDoggo);
  doggoElement.classList.add("currentDoggo");
  nextDoggoElement.classList.remove("hidden");

  game.currentDoggo++;

  setBreedButtons();
}


// start the timer only when the page loads
window.addEventListener("load", function(){

  // Timer variables
  var timerValue = 15 * 1000;
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
    timerDisplay.innerHTML = minutes + ":" + seconds;

    // When the countdown is finished pause timer
    if (distance <= 0)
    {
      isTimerOver = true;
      timer.stop();

      // hide the game, show the hscore entry
      var game = document.getElementById("game");
      game.classList.add("hidden");

      var hscoreEntry = document.getElementById("hscoreEntry");
      hscoreEntry.classList.remove("hidden");

      var dbScore = document.getElementById("db_score");
      //dbScore.value = game.score;
      dbScore.innerHTML = toString(game.score);

    }
  }, 1000);
});



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

      // Pause-resume button logic
      document.getElementById("pauseResumeTimer").classList.remove("resumeTimer");
      document.getElementById("pauseResumeTimer").classList.add("pauseTimer");
      document.getElementById("pauseResumeTimer").innerHTML = "Pause";

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

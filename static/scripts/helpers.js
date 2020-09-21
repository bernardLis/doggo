// BONE CIRCLE!!
var countdownSound = new Howl({
    src: 'static/audio/countdown.wav',
    autoplay: false,
    volume: 1
});

// https://stackoverflow.com/questions/10152390/dynamically-arrange-some-elements-around-a-circle
function createBoneCircle()
{
  var container = document.getElementById('boneCircleContainer');
  var positionInfo = container.getBoundingClientRect();
  var width = positionInfo.width;
  var height = positionInfo.height;

  // with angle 4.7 bones are being drawn from the top
  var numberOfBones = 12;
  var radius = 120;
  var angle = 4.7;
  var step = (2*Math.PI) / numberOfBones;
  var boneColor = "#"+((1<<24)*Math.random()|0).toString(16)

  for(var i = 0; i < numberOfBones; i++)
  {
    // create append and hide a bone
    var bone = getABone();
    var boneID = "bone-" + i;
    bone.id = boneID;
    container.appendChild(bone);
    bone.style.color = boneColor;
    bone.classList.add("boneCircleBone");
    bone.classList.add("hidden");

    // position the bone
    var rect = bone.getBoundingClientRect();
    var boneHeight = rect.height;
    var boneWidth = rect.width;
    var x = Math.round(width/2 + radius * Math.cos(angle) - (boneWidth/2+20));
    var y = Math.round(height/2 + radius * Math.sin(angle) - (boneHeight/2+20));
    bone.style.left = x + "px";
    bone.style.top = y + "px";

    // rotation (90+(i*30)) works perfectly with 12 bones drawn from the top
    bone.style.transform = 'rotate(' + (90 + (i * 30)) + 'deg)';

    angle += step;
  }
}

function animateBoneCircle()
{
  // Showing bones
  var i = 0;
  var interval = setInterval(function()
  {
    var boneID = "bone-" + i;
    var bone = document.getElementById(boneID);
    bone.classList.remove("hidden");
    i++;
    // clearing interval after 3s
    if(i == 12)
    {
      clearInterval(interval)
    }
  }, 150);

  // removing bones after 2s
  var timeout = setTimeout(function()
  {
    removeElements("boneCircleBone");
  }, 2000);
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

// returns a bone element
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

// https://flask-wtf.readthedocs.io/en/stable/csrf.html?fbclid=IwAR25LkK-Hw3ii8UuL-tD-GVVVYcve8XqMNV8VM1TB0Gh-JxQcBVcpSmH2BU
// general csfr set up
var csrf_token = "{{ csrf_token() }}";

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrf_token);
        }
    }
});

//BONE CIRCLE!!
// https://stackoverflow.com/questions/10152390/dynamically-arrange-some-elements-around-a-circle
function createBoneCircle()
{
  var container = document.getElementById('boneCircleContainer');
  var positionInfo = container.getBoundingClientRect();
  var width = positionInfo.width;
  var height = positionInfo.height;

  // with angle 4.7 bones are being drawn from the top
  var numberOfBones = 12;
  var radius = 70;
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
    var x = Math.round(width/2 + radius * Math.cos(angle) - (boneWidth/2+10));
    var y = Math.round(height/2 + radius * Math.sin(angle) - (boneHeight/2+10));
    bone.style.left = x + "px";
    bone.style.top = y + "px";

    // rotation (90+(i*30)) works perfectly with 12 bones drawn from the top
    bone.style.transform = 'rotate(' + (90 + (i * 30)) + 'deg)';

    angle += step;
  }
}

function animateBoneCircle()
{
  //showing bones
  var i = 0;
  var interval = setInterval(function(){
    var boneID = "bone-" + i;
    var bone = document.getElementById(boneID);
    bone.classList.remove("hidden");
    i++;
    if(i==12)
    {
      i=0;
    }
  }, 250);

  //hiding bones
  var j = 0;
  var timeout = setTimeout(function(){
    var interval2 = setInterval(function(){
      var boneID = "bone-" + j;
      var bone = document.getElementById(boneID);
      bone.classList.add("hidden");
      j++;
      if(j==12)
      {
        j=0;
      }
    }, 250);
  },2750)
}

createBoneCircle();
animateBoneCircle();

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

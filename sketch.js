var myCapture, // camera
    myVida;    // VIDA

var padding = 0.27; var n = 5;
var zoneWidth = 0.1; var zoneHeight = 0.1;
var hOffset = (1.0 - (n * zoneWidth + (4 + n) ) * padding) / 2.0;
var vOffset = 0.15;

//just tidy this up a bit, we could do more for sure in that regard
let finalPadding = zoneWidth + padding;

//arrays of for the values for a level
const hOffsetsA = [1.5, 2, 2.5, 3, 2.5];
const normYValuesA = [0.95, 0.4, 0, 0.4, 0.95, 0.4];


//the data for a level
const levelA = {
  id: 'A',
  hOffsets: hOffsetsA,
  normYValues: normYValuesA,
}
//an array for our data and one for our levels
let levelData = [levelA];
let levels = Array.from({length: levelData.length})



/*
  We will set this flag when we grab the background image. We will use it to
  introduce additional control over the sound (to avoid unnecessary noise the
  sound will not be heard before the background image is captured).
*/
var backgroundCapturedFlag = false;

/*
  We will use the sound in this example (so remember to add the p5.Sound
  library to your project if you want to recreate this). This array will be
  used to store oscillators.
*/
var synth = [];

/*
  Here we are trying to get access to the camera.
*/
function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(800, 600);
    myCapture.elt.setAttribute('playsinline', '');
    myCapture.hide();
    console.log(
      '[initCaptureDevice] capture ready. Resolution: ' +
      myCapture.width + ' ' + myCapture.height
    );
  } catch(_err) {
    console.log('[initCaptureDevice] capture error: ' + _err);
  }
}

function setup() {
  createCanvas(800, 600); // we need some space...
  initCaptureDevice(); // and access to the camera

  /*
    VIDA stuff. One parameter - the current sketch - should be passed to the
    class constructor (thanks to this you can use Vida e.g. in the instance
    mode).
  */
  myVida = new Vida(this); // create the object

  myVida.progressiveBackgroundFlag = true;
  /*
    The value of the threshold for the procedure that calculates the threshold
    image. The value should be in the range from 0.0 to 1.0 (float).
  */
  myVida.imageFilterThreshold = 0.1;

  myVida.mirror = myVida.MIRROR_HORIZONTAL;
  /*
    In order for VIDA to handle active zones (it doesn't by default), we set
    this flag.
  */
  myVida.handleActiveZonesFlag = true;
  /*
    If you want to change the default sensitivity of active zones, use this
    function. The value (floating point number in the range from 0.0 to 1.0)
    passed to the function determines the movement intensity threshold which
    must be exceeded to trigger the zone (so, higher the parameter value =
    lower the zone sensitivity).
  */
  myVida.setActiveZonesNormFillThreshold(0.1);
  /*
    Let's create several active zones. VIDA uses normalized (in the range from
    0.0 to 1.0) instead of pixel-based. Thanks to this, the position and size
    of the zones are independent of any eventual changes in the captured image
    resolution.
  */
  
 
    /*
      addActiveZone function (which, of course, adds active zones to the VIDA
      object) comes in two versions:
        [your vida object].addActiveZone(
          _id, // zone's identifier (integer or string)
          _normX, _normY, _normW, _normH, // normalized (!) rectangle
          _onChangeCallbackFunction // callback function (triggered on change)
        );
      and
        [your vida object].addActiveZone(
          _id, // zone's identifier (integer or string)
          _normX, _normY, _normW, _normH // normalized (!) rectangle
        );
      If we use the first version, we should define the function that will be
      called after the zone status changes. E.g.
        function onActiveZoneChange(_vidaActiveZone) {
          console.log(
            'zone: ' + _vidaActiveZone.id +
            ' status: ' + _vidaActiveZone.isMovementDetectedFlag
          );
        }
      Then the addActiveZone call can look like this:
        [your vida object].addActiveZone(
          'an_id', // id
          0.33, 0.33, 0.33, 0.33, // big square on the center of the image
          onActiveZoneChange // callback function
        );
      Note: It is also worth mentioning here that if you want, you can delete a
            zone (or zones) with a specific identifier (id) at any time. To do
            this, use the removeActiveZone function:
              [your vida object].removeActiveZone(id);
      But this time we just want to create our own function drawing the zones
      and we will check their statuses manually, so we can opt out of defining
      the callback function, and we will use the second, simpler version of the
      addActiveZone function.
    */
    
    //  levelA();
          //let's use our class instead

         levels.forEach( (level, i) => {
            levels[i] = new Level(levelData[i])
            levels[i].addZones();
    
          }) 




    /*
      For each active zone, we will also create a separate oscillator that we
      will mute/unmute depending on the state of the zone. We use the standard
      features of the p5.Sound library here: the following code just creates an
      oscillator that generates a sinusoidal waveform and places the oscillator
      in the synth array.
    */
    var osc = new p5.Oscillator();
    osc.setType('sine');
    /*
      Let's assume that each subsequent oscillator will play 4 halftones higher
      than the previous one (from the musical point of view, it does not make
      much sense, but it will be enough for the purposes of this example). If
      you do not take care of the music and the calculations below seem unclear
      to you, you can ignore this part or access additional information , e.g.
      here: https://en.wikipedia.org/wiki/MIDI_tuning_standard
    */
   for(var i = 0; i < 6; i++) {
    osc.freq(440.0 * Math.pow(2.0, (60 + (i * 4) - 69.0) / 12.0));
    // osc.amp(0.0); osc.start();
    synth[i] = osc;
  }

  frameRate(25); // set framerate
}

function draw() {
  if(myCapture !== null && myCapture !== undefined) { // safety first
    background(0, 0, 255);
    /*
      Call VIDA update function, to which we pass the current video frame as a
      parameter. Usually this function is called in the draw loop (once per
      repetition).
    */
    myVida.update(myCapture);


        console.log(myVida.activeZones)


    /*
      Now we can display images: source video (mirrored) and subsequent stages
      of image transformations made by VIDA.
    */
   
    image(myVida.thresholdImage, 0, 0);
   
    noStroke(); fill(0, 0, 255);
    text('youre on camera', 20, 20);
    /*
      VIDA has two built-in versions of the function drawing active zones:
        [your vida object].drawActiveZones(x, y);
      and
        [your vida object].drawActiveZones(x, y, w, h);
      But we want to create our own drawing function, which at the same time
      will be used for the current handling of zones and reading their statuses
      (we must also remember about controlling the sound).
    */
    // defint size of the drawing
    var temp_drawing_w = width / 2;  var temp_drawing_h = height / 2; 
    // offset from the upper left corner
    var offset_x = 320; var offset_y = 240;
    // pixel-based zone's coords
    var temp_x, temp_y, temp_w, temp_h;
    push(); // store current drawing style and font
    translate(offset_x, offset_y); // translate coords
    // set text style and font
    textFont('Helvetica', 10); textAlign(LEFT, BOTTOM); textStyle(NORMAL);
    // let's iterate over all active zones
    for(var i = 0; i < myVida.activeZones.length; i++) {
      /*
        Having access directly to objects that store active zone data, we can
        read or modify the values of individual parameters. Here is a list of
        parameters to which we have access:
          normX, normY, normW, normH - normalized coordinates of the rectangle
        in which active zone is contained (bounding box); you can change these
        parameters if you want to move the zone or change it's size;
          isEnabledFlag - if you want to disable the processing of a given
        active zone without deleting it, this flag will definitely be useful to
        you; if it's value is "true", the zone will be tested, if the variable
        value is "false", the zone will not be tested;
          isMovementDetectedFlag - the value of this flag will be "true"
        if motion is detected within the zone; otherwise, the flag value will
        be "false";
          isChangedFlag - this flag will be set to "true" if the status (value
        of isMovementDetectedFlag) of the zone has changed in the current
        frame; otherwise, the flag value will be "false";
          changedTime, changedFrameCount  - the moment - expressed in
        milliseconds and frames - in which the zone has recently changed it's
        status (value of isMovementDetectedFlag);
          normFillFactor - ratio of the area of the zone in which movement was
        detected to the whole surface of the zone
          normFillThreshold - ratio of the area of the zone in which movement
        was detected to the total area of the zone required to be considered
        that there was a movement detected in the zone; you can modify this
        parameter if you need to be able to set the threshold of the zone
        individually (as opposed to function
        [your vida object].setActiveZonesNormFillThreshold(normVal); 
        which sets the threshold value globally for all zones);
          id - zone identifier (integer or string);
          onChange - a function that will be called when the zone changes status
        (when value of this.isMovementDetectedFlag will be changed); the object
        describing the current zone will be passed to the function as a
        parameter.
      */ 
      // read and convert norm coords to pixel-based
      temp_x = Math.floor(myVida.activeZones[i].normX * temp_drawing_w);
      temp_y = Math.floor(myVida.activeZones[i].normY * temp_drawing_h - 30);
      temp_w = Math.floor(myVida.activeZones[i].normW * temp_drawing_w);
      temp_h = Math.floor(myVida.activeZones[i].normH * temp_drawing_h);
      // draw zone rect (filled if movement detected)
      strokeWeight(1);
      if(myVida.activeZones[i].isEnabledFlag) {
        stroke(255, 0, 0);
        if(myVida.activeZones[i].isMovementDetectedFlag) fill(255, 0, 0, 128);
        else noFill();
      }
      else {
        stroke(0, 0, 255);
        /*
          Theoretically, movement should not be detected within the excluded
          zone, but VIDA is still in the testing phase, so this line will be
          useful for testing purposes.
        */
        if(myVida.activeZones[i].isMovementDetectedFlag) fill(0, 0, 255, 128);
        else noFill();
      }
      rect(temp_x, temp_y, temp_w, temp_h, 20);
      // print id
      noStroke();
      if(myVida.activeZones[i].isEnabledFlag) fill(255, 0, 0);
      else fill(0, 0, 255);
      text(myVida.activeZones[i].id, temp_x, temp_y - 1);
      /*
        Using the isChangedFlag flag is very important if we want to trigger an
        behavior only when the zone has changed status.
      */
      if(myVida.activeZones[i].isChangedFlag) {
        // print zone id and status to console ... 
        console.log(
          'zone: ' + myVida.activeZones[i].id +
          ' status: ' + myVida.activeZones[i].isMovementDetectedFlag
        );
        //... and use this information to control the sound.
        synth[myVida.activeZones[i].id].amp(
          0.1 * myVida.activeZones[i].isMovementDetectedFlag
        );
      }
    }
    pop(); // restore memorized drawing style and font
  }
  else {
    /*
      If there are problems with the capture device (it's a simple mechanism so
      not every problem with the camera will be detected, but it's better than
      nothing) we will change the background color to alarmistically red.
    */
    background(255, 0, 0);
  }
}

/*
  Capture current video frame and put it into the VIDA's background buffer.
*/
function touchEnded() {
  if(myCapture !== null && myCapture !== undefined) { // safety first
    myVida.setBackgroundImage(myCapture);
    console.log('background set');
    backgroundCapturedFlag = true;
  }
}






// function levelA(){
//  myVida.addActiveZone(
//       0,
//       hOffset + 1.5 * (zoneWidth + padding), 0.95, zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       1,
//       hOffset + 2 * (zoneWidth + padding), 0.4, zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       2,
//       hOffset + 2.5 * (zoneWidth + padding),0 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       3,
//       hOffset + 3 * (zoneWidth + padding), 0.4 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       4,
//       hOffset + 3.5 * (zoneWidth + padding), 0.95 , zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       5,
//       hOffset + 2.5 * (zoneWidth + padding), 0.4 , zoneWidth, zoneHeight
//     );

// }

// function levelB(){
//    myVida.addActiveZone(
//       0,
//       hOffset + 2.5 * (zoneWidth + padding), 0.6, zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       1,
//       hOffset + 3 * (zoneWidth + padding), 0.85, zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       2,
//       hOffset +2 * (zoneWidth + padding),0 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       3,
//       hOffset + 2 * (zoneWidth + padding),1 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       4,
//       hOffset +3 * (zoneWidth + padding), 0.15 , zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       5,
//       hOffset + 2.5 * (zoneWidth + padding), 0.4 , zoneWidth, zoneHeight
//     );


// }

// function levelC() {
//      myVida.addActiveZone(
//       0,
//       hOffset + 3.05 * (zoneWidth + padding), 1.0, zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       1,
//       hOffset + 2.25 * (zoneWidth + padding), 0.9, zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       2,
//       hOffset + 1.75 * (zoneWidth + padding),0.6 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       3,
//       hOffset + 1.75 * (zoneWidth + padding), 0.4 , zoneWidth, zoneHeight
//     );
//   myVida.addActiveZone(
//       4,
//       hOffset + 2.25 * (zoneWidth + padding), 0.1 , zoneWidth, zoneHeight
//     );
//    myVida.addActiveZone(
//       5,
//       hOffset + 3.05 * (zoneWidth + padding), 0 , zoneWidth, zoneHeight
//     );

// }
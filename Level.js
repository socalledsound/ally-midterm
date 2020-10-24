class Level {
    constructor({id, hOffsets, normYValues}){
        //the vida instance from the main sketch
        // this.myVida = myVida;
        //we'll pass in the letter to be the id
        this.id = id;
        this.hOffsets = hOffsets;
        this.numZones = hOffsets.length;
        this.zones = Array.from({length: this.numZones});
        this.sounds = Array.from({length: this.numZones});
        this.normYValues = normYValues;
        this.addZones();

    }



    addZones(){
        this.zones.forEach( (zone, i) => {
          console.log(zone);
            this.zones[i] = this.createZone(i);
        })
    }

    checkZones(zones){
      this.zones = zones
      this.zones.forEach((zone, i) => {
        console.log(zone);
        this.checkZone(zone, i);
    })
    }


    checkZone(zone, i){
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
      temp_x = Math.floor(zone.normX * temp_drawing_w);
      temp_y = Math.floor(zone.normY * temp_drawing_h - 30);
      temp_w = Math.floor(zone.normW * temp_drawing_w);
      temp_h = Math.floor(zone.normH * temp_drawing_h);
      // draw zone rect (filled if movement detected)
      strokeWeight(1);
      if(zone.isEnabledFlag) {
        stroke(255, 0, 0);
        if(zone.isMovementDetectedFlag) fill(255, 0, 0, 128);
        else noFill();
      }
      else {
        stroke(0, 0, 255);
        /*
          Theoretically, movement should not be detected within the excluded
          zone, but VIDA is still in the testing phase, so this line will be
          useful for testing purposes.
        */
        if(zone.isMovementDetectedFlag) fill(0, 0, 255, 128);
        else noFill();
      }
      rect(temp_x, temp_y, temp_w, temp_h, 20);
      // print id
      noStroke();
      if(zone.isEnabledFlag) fill(255, 0, 0);
      else fill(0, 0, 255);
      text(zone.id, temp_x, temp_y - 1);
      /*
        Using the isChangedFlag flag is very important if we want to trigger an
        behavior only when the zone has changed status.
      */
      if(zone.isChangedFlag) {
        // print zone id and status to console ... 
        console.log(
          'zone: ' + zone.id +
          ' status: ' + zone.isMovementDetectedFlag
        );
        //... and use this information to control the sound.
        this.sounds[i].amp(
          0.1 * zone.isMovementDetectedFlag
        );
      }
    }








    createSound(i){
          /*
    For each active zone, we will also create a separate oscillator that we
    will mute/unmute depending on the state of the zone. We use the standard
    features of the p5.Sound library here: the following code just creates an
    oscillator that generates a sinusoidal waveform and places the oscillator
    in the synth array.
    */
    let osc = new p5.Oscillator();
    osc.setType('sine');

    osc.freq(440.0 * Math.pow(2.0, (60 + (i * 4) - 69.0) / 12.0));
    /*
    Let's assume that each subsequent oscillator will play 4 halftones higher
    than the previous one (from the musical point of view, it does not make
    much sense, but it will be enough for the purposes of this example). If
    you do not take care of the music and the calculations below seem unclear
    to you, you can ignore this part or access additional information , e.g.
    here: https://en.wikipedia.org/wiki/MIDI_tuning_standard
    */
    // for(var i = 0; i < 6; i++) {

    //  // osc.amp(0.0); osc.start();
    //  synth[i] = osc;
    //   }

    return osc
    }


    createZone(index){
      this.sounds[index] = this.createSound(index);

      myVida.addActiveZone(index, hOffset + this.hOffsets[index] * finalPadding, this.normYValues[index], zoneWidth, zoneHeight);
        
    }

}



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
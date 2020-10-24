class Level {
    constructor({id, hOffsets, normYValues}){
        //the vida instance from the main sketch
        // this.myVida = myVida;
        //we'll pass in the letter to be the id
        this.id = id;
        this.hOffsets = hOffsets;
        this.numZones = hOffsets.length;
        this.zones = Array.from({length: this.numZones});
        this.normYValues = normYValues;

    }

    addZones(){
        this.zones.forEach( (zone, i) => {
            this.zones[i] = this.createZone(i);
        })
    }

    createZone(index){

        myVida.addActiveZone(index, hOffset + this.hOffsets[index] * finalPadding, this.normYValues[index], zoneWidth, zoneHeight)

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
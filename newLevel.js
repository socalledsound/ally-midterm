

class AllyLevel {
    constructor(){
        this.boxesFilled = Array.from({length: numSensors}, (box) => box = false);
        this.levelComplete = false;
    }



    checkSensors(){
        sensors.forEach((sensor, i) => {
            if(sensor.triggered){
                boxesFilled[i] = true;
            }
        })
    }

    checkLevelComplete(){
        const complete = this.boxesFilled.filter(box => box === false);
        if(complete < 1){
            this.levelComplete = true;
        }
    }


}

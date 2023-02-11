class Population {
    constructor(maxPop){
        this.maxPop = maxPop
        this.timestep = 0
        this.currentPop = 0
        this.entities = {}

        //var bigDiv = document.getElementById("stats-box")
        //this.infoContainer = document.createElement("div")
        //bigDiv.appendChild(this.infoContainer)
        //this.infoContainer.innerText = "Connections"

        for(let i = 0; i < maxPop; i++){
            var pos = createVector(10 * randomInt(0,40),10 * randomInt(0,40))
            var entity = new Being(pos,this.entities)
            this.entities[i] = entity
        }

    }

    run(){
        for(var entity in this.entities){
            entity = this.entities[entity]
            entity.entities = this.entities
            entity.show(this.entities)
        }
    }

    moveRandom(){
        for(var entity in this.entities){
            entity = this.entities[entity]

            
            switch(entity.getAction(entity.nnet.feedForward(entity))){
                case(1):
                    entity.moveUp()
                    break;
                case(2):
                    entity.moveDown()
                    break;
                case(3):
                    entity.moveLeft()
                    break;
                case(4):
                    entity.moveRight()
                    break;
            }

            entity.show()
        }
    }
}

/*
for(var entity in this.entities){
            entity = this.entities[entity]

            var randomChoice = randomInt(0,4)
            switch(randomChoice){
                case(1):
                    entity.moveUp()
                    break;
                case(2):
                    entity.moveDown()
                    break;
                case(3):
                    entity.moveLeft()
                    break;
                case(4):
                    entity.moveRight()
                    break;
            }

            entity.show()
        }

*/
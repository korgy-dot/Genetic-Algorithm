class Being {
    constructor(pos,entities){
        this.size = 10
        this.moveDistance = 10
        this.pos = createVector(pos.x - this.size / 2 ,pos.y - this.size / 2)
        this.entities = entities
        this.nnet = new NeuralNet()
        this.lastDir = createVector()
    }


    show(){
        if(this.pos.y + this.size > height ){
            this.pos.y = height - this.size / 2
        }

        if(this.pos.y - this.size <= 0){
            this.pos.y = 0 + this.size / 2
        }

        if(this.pos.x - this.size <= 0){
            this.pos.x = 0 + this.size / 2
        }

        if(this.pos.x + this.size >= width){
            this.pos.x = width - this.size / 2
        }

        


        ellipse(this.pos.x,this.pos.y,this.size)
    }

    moveUp(){
        if(this.pos.y - this.size <= 0){
            this.pos.y = 0 + this.size / 2
            return
        }

        if(this.checkCollisions(createVector(this.pos.x, this.pos.y + -this.moveDistance))){
            return
        }

        this.lastDir = createVector(0,-1)
        this.pos.add(createVector(0,-this.moveDistance))
    }

    moveDown(){
        if(this.pos.y + this.size >= height){
            this.pos.y = height - this.size / 2
            return
        }

        if(this.checkCollisions(createVector(this.pos.x, this.pos.y + this.moveDistance))){
            return
        }


        this.lastDir = createVector(0,1)
        this.pos.add(createVector(0,this.moveDistance))
    }

    moveRight(){
        if(this.pos.x >= width){
            return
        }

        if(this.checkCollisions(createVector(this.pos.x + this.moveDistance, this.pos.y))){
            return
        }

        this.lastDir = createVector(1,0)
        this.pos.add(createVector(this.moveDistance,0))
    }

    moveLeft(){
        if(this.pos.x <= 0){
            return
        }

        if(this.checkCollisions(createVector(this.pos.x + -this.moveDistance, this.pos.y))){
            return
        }

        this.lastDir = createVector(-1,0)
        this.pos.add(createVector(-this.moveDistance,0))
    }

    checkCollisions(pos){
        for(var entity in this.entities){
            entity = this.entities[entity]

            if(entity.pos.x == pos.x && entity.pos.y == pos.y){
                return true
            }
        }
        return false
    }

    getAction(actionLevels){
        var highestLevel

        for(var level of actionLevels){
            if(highestLevel == undefined || highestLevel < level){
                highestLevel = level
            }
        }

        var index = actionLevels.indexOf(highestLevel)


        return index
    }


    getSensor(id){
        var sensorVal = 0
        if(id == 0){
            sensorVal = this.pos.x / (width - 1)
        }
        if(id == 1){
            sensorVal = this.pos.y / (height - 1)
        }
        if(id == 2){
            sensorVal = this.lastDir.x == 0 ? 0.5 : (this.lastDir.x == -1 ? 0.0 : 1.0)
        }
        if(id == 3){
            sensorVal = this.lastDir.y == 0 ? 0.5 : (this.lastDir.y == -1 ? 0.0 : 1.0)
        }
        if(id == 4){
            var distX = Math.min(this.pos.x,(width - this.pos.x) - 1)
            var distY = Math.min(this.pos.y,(height - this.pos.y) - 1)
            var closest = Math.min(distX,distY)
            var maxPossible = Math.max(width / 2 - 1, height / 2 - 1)
            sensorVal = closest / maxPossible
        }
        if(id == 5){
            sensorVal = Math.tanh(Object.keys(this.entities).length)
        }

        if(id == 6){
            var minDistX = Math.min(this.pos.x, (width - this.pos.x) - 1)
            sensorVal = minDistX / (width / 2.0)
        }

        if(id == 7){
            var minDistY = Math.min(this.pos.y, (height - this.pos.y) - 1)
            sensorVal = minDistY / (height / 2.0)
        }


        return sensorVal;
    }

}

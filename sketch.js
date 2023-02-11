var population

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function setup() {
    console.log("Setting up")
    createCanvas(400, 400);
    population = new Population(50)

    setInterval(() => {
        population.moveRandom()
    },100)
}

function draw() {
    background(51);
    if(mouseIsPressed){
        
    }
    population.run()
}


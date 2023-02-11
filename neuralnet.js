//INTERNAL = 1
//ACTION/INPUT = 0


//Sensors that are used to influence input neurons
const InputNeurons = {
    [0]: "LOC_X",
    [1]: "LOC_Y",
    [2]: "LAST_MOVE_DIR_X",
    [3]: "LAST_MOVE_DIR_Y",
    [4]: "BOUNDARY_DIST", //Distance from the closest wall
    [5]: "POPULATION_COUNT",
    [6]: "BOUNDARY_DIST_X",
    [7]: "BOUNDARY_DIST_Y"
}


const ActionNeurons = {
    [0]: "Up",
    [1]: "Down",
    [2]: "Left",
    [3]: "Right"
}

const INTERNAL = 1


function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateRandomBytes(length){
    var finalBin = ""
    for(let i = 0; i < length; i++){
        finalBin += `${randomInt(0,1)}`
    }

    return finalBin
}

class Gene {
    constructor(sourceType,sourceId,sinkType,sinkId,weight){
        this.sourceType = sourceType
        this.sourceId = sourceId
        this.sinkType = sinkType
        this.sinkId = sinkId
        this.weight = weight
    }
}

class Chromosome{
    constructor(genes){
        this.genes = genes
    }
}


class NeuronNode{
    constructor(remappedNumber = 0,numOutputs = 0,numSelfInputs = 0,numInputsFromSensorsOrOtherNeurons = 0){
        this.remappedNumber = remappedNumber
        this.numOutputs = numOutputs
        this.numSelfInputs = numSelfInputs
        this.numInputsFromSensorsOrOtherNeurons = numInputsFromSensorsOrOtherNeurons
    }
}


class NeuralNet {
    constructor(){
        this.maxInternal = 3
        this.geneCount = 5
        this.connectionList = this.generateConnectionList()
        this.internalNeuronMap = this.generateInternalNeuronMap()
        this.nnet = this.createNeuralNetFromConnections()

        console.log(this.nnet['connections'])
    }

    generateConnectionList(){
        var TempGenes = []
        for(let j = 0; j < this.geneCount; j++){
            TempGenes.push(this.generateGene())
        }
        var TempChromosome = new Chromosome(TempGenes)
        

        return TempChromosome
    }

    generateGene(){
        var random = Math.random() 
        var weight = random > 0.5 ? random : -random
        var sourceType = randomInt(0,1)
        var sourceId = generateRandomBytes(7)
        var sinkType = randomInt(0,1)
        var sinkId = generateRandomBytes(7)


        if(sourceType == 0){
            sourceId = parseInt(sourceId,2) % Object.keys(InputNeurons).length
        }else{
            sourceId = parseInt(sourceId,2) % this.maxInternal
        }

        if(sinkType == 0){
            sinkId = parseInt(sinkId,2) % Object.keys(ActionNeurons).length
        }else{
            sinkId = parseInt(sinkId,2) % this.maxInternal
        }


        var TempGene = new Gene(sourceType,sourceId,sinkType,sinkId,weight)

        return TempGene
    }

    generateInternalNeuronMap(){
        var TempObj = {}
        for(const gene of this.connectionList.genes){
            if(gene.sinkType == INTERNAL){
                if(TempObj[gene.sinkId] == undefined){
                    TempObj[gene.sinkId] = new NeuronNode(gene.sinkId,0,0,0)

                }
                if(gene.sourceType == INTERNAL && (gene.sourceId == gene.sinkId)){
                    TempObj[gene.sinkId].numSelfInputs += 1
                }else{
                    TempObj[gene.sinkId].numInputsFromSensorsOrOtherNeurons += 1
                }
            }

            if(gene.sourceType == INTERNAL){
                if(TempObj[gene.sourceId] == undefined){
                    TempObj[gene.sourceId] = new NeuronNode(gene.sourceId,0,0,0)
                }
                TempObj[gene.sourceId].numOutputs += 1
            }
        }
        return TempObj
    }

    removeConnectionToInternalNeuron(internalNum){
        for(const gene of this.connectionList.genes){
            if(gene.sinkType == INTERNAL && gene.sinkId == internalNum && gene != undefined){
                if(gene.sourceType == INTERNAL){
                    this.internalNeuronMap[gene.sourceId].numOutputs -= 1
                    var index = this.connectionList.genes.indexOf(gene)
                    this.connectionList.genes.splice(index,1)
                }
            }
        }
    }

    removeUselessInternalNeurons(){
        var allDone = false
        while(!allDone){
            allDone = true
            for(var iNeuron in this.internalNeuronMap){
                iNeuron = this.internalNeuronMap[iNeuron]
                if(iNeuron.numOutputs == iNeuron.numSelfInputs){
                    allDone = false
                    this.removeConnectionToInternalNeuron(iNeuron.remappedNumber)
                    delete this.internalNeuronMap[iNeuron.remappedNumber]
                }
            }
        }
        return
    }

    createNeuralNetFromConnections(){
        this.removeUselessInternalNeurons()

        var index = 0
        for(var node in this.internalNeuronMap){
            node = this.internalNeuronMap[node]
            node.remappedNumber = index
            index += 1
        }

        var neuralNet = {}
        neuralNet["connections"] = []
        neuralNet["internalNeurons"] = []

        for(var gene of this.connectionList.genes){
            if(gene.sinkType == INTERNAL){
                if(this.internalNeuronMap[gene.sinkId] == undefined){
                    continue
                }
                neuralNet['connections'].push(gene)
                var newConn = neuralNet["connections"][neuralNet['connections'].length - 1]
                newConn.sourceId = this.internalNeuronMap[gene.sinkId].remappedNumber
                if(gene.sourceType == INTERNAL){
                    if(this.internalNeuronMap[gene.sourceId] == undefined){
                        continue
                    }
                    newConn.sourceId = this.internalNeuronMap[gene.sourceId].remappedNumber

                }
            }
        }


        for(var gene of this.connectionList.genes){
            if(gene.sinkType != INTERNAL){
                neuralNet['connections'].push(gene)
                var newConn = neuralNet['connections'][neuralNet['connections'].length - 1]

                if(gene.sourceType == INTERNAL){
                    if(this.internalNeuronMap[gene.sourceId] == undefined){
                        continue
                    }
                    newConn.sourceId = this.internalNeuronMap[gene.sourceId].remappedNumber
                }

            }
        }

        for(var Neuron in this.internalNeuronMap){
            neuralNet['internalNeurons'].push({
                'output': 0.5,
                'driven': this.internalNeuronMap[Neuron].numInputsFromSensorsOrOtherNeurons != 0
            })
        }

        return neuralNet
    }

    feedForward(entity){
        var actionLevels = []
        for(let i = 0; i < Object.keys(ActionNeurons).length; i++){
            actionLevels.push(0)
        }

        var neuronAccumulators = []
        for(let i = 0; i < this.nnet.internalNeurons.length; i++){
            neuronAccumulators.push(0.0)
        }

        var neuroOutputsComputed = false;

        for(var conn of this.nnet['connections']){
            if(conn.sinkType == 0 && !neuroOutputsComputed){
                for(let neuronIndex = 0; neuronIndex < this.nnet['internalNeurons'].length; ++neuronIndex){
                    if(this.nnet['internalNeurons'][neuronIndex].driven){
                        this.nnet['internalNeurons'][neuronIndex].output = Math.tanh(neuronAccumulators[neuronIndex])
                    }
                }

                neuroOutputsComputed = true
            }

            var inputVal = 0.0;
            if (conn.sourceType == 0){
                inputVal = entity.getSensor(conn.sourceId)
            }else{
                inputVal = this.nnet['internalNeurons'][conn.sourceId].output
            }

            if(conn.sinkType == 0){
                actionLevels[conn.sinkId] += inputVal * conn.weight
            }else{
                neuronAccumulators[conn.sinkId] += inputVal * conn.weight
            }

        }


        return actionLevels

    }

    printConnectionListInfo(Chromosome){
        var CurrGeneCount = Chromosome.genes.length
        var Genes = Chromosome.genes
        console.log(`Gene count: ${CurrGeneCount}`)

        for(let i = 0; i < CurrGeneCount; i++){
            console.log(`[Input] ${Genes[i].sourceType == 1 ? `Internal(${Genes[i].sourceId})` : InputNeurons[Genes[i].sourceId]} ====(${Genes[i].weight})===> [Action] ${Genes[i].sinkType == 1 ? `Internal(${Genes[i].sinkId})` : ActionNeurons[Genes[i].sinkId]}  `)
        }
    }

}


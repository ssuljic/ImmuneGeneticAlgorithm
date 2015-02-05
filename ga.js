String.prototype.replaceAt=function(index, char) {
  return this.substr(0, index) + char + this.substr(index+char.length);
}

var validChars = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.'";
var INITIAL_POP_SIZE = 2500;
var MAX_GENERATIONS = 50;
var evolutionTarget = "";
var INDIVIDUAL_SIZE = 0;
var ELITE = INITIAL_POP_SIZE - INITIAL_POP_SIZE*5/100;
var MUTATION_RATE = 0.156;
var MAX_RAND = 32767.00;

function evolve(currentGeneration, generationCounter, placeHolder, useImmunization, inoculationFunction) {
  var fitnessScores = [];
  var tempGenerationHolder = [];

  for(var i= 0; i<currentGeneration.length; i++) {
    fitnessScores[i] = {fitness: levenshtein(evolutionTarget, currentGeneration[i]), chromosome: currentGeneration[i]};
  }

  fitnessScores.sort(function(a, b) {
    return a.fitness - b.fitness;
  });

  $("<div style='text-align: left;'>Best of <b>generation " + (generationCounter + 1) + "</b>: " + fitnessScores[0].chromosome + "</div>").hide().appendTo('#' + placeHolder).slideDown('slow');

  if(fitnessScores[0].fitness != 0 && generationCounter < MAX_GENERATIONS) {
    for(var i=0; i<ELITE; i++) {
      tempGenerationHolder.push({fitness: levenshtein(evolutionTarget, fitnessScores[i].chromosome), chromosome: fitnessScores[i].chromosome}); 
    }

    var newPopulationCount = useImmunization ? INITIAL_POP_SIZE * 2 : INITIAL_POP_SIZE;
    for(var i=0; i<newPopulationCount; i++) {
      var randInd1 = Math.floor(Math.random()*(INITIAL_POP_SIZE));
      var randInd2 = Math.floor(Math.random()*(INITIAL_POP_SIZE));
      var child = mate(fitnessScores[randInd1].chromosome, fitnessScores[randInd2].chromosome);
      if(useImmunization) child = inoculationFunction(child);
      tempGenerationHolder.push({fitness: levenshtein(evolutionTarget, child), chromosome: child});
    }

    tempGenerationHolder.sort(function(a, b) {
      return a.fitness - b.fitness;
    });

    if(useImmunization) {
      tempGenerationHolder = tempGenerationHolder.slice(0, newPopulationCount/2 + 1);
    }

    tempGenerationHolder = tempGenerationHolder.map(function(individual) {
      return individual.chromosome;
    });

    currentGeneration = tempGenerationHolder;
    generationCounter++;
    setTimeout(function() {
      evolve(currentGeneration, generationCounter, placeHolder, useImmunization, inoculationFunction)
    }, 100);
  }
}
 
function mate(individual1, individual2) {
  var randomIndex1 = Math.floor(Math.random()*(INDIVIDUAL_SIZE));
  var randomIndex2 = Math.floor(Math.random()*(INDIVIDUAL_SIZE));
  var smaller;
  var bigger;

  if(randomIndex1 > randomIndex2) {
    smaller = randomIndex2;
    bigger = randomIndex1;
  }
  else {
    smaller = randomIndex1;
    bigger = randomIndex2;
  }

  var ind1_1 = individual1.substring(0,smaller);
  var ind1_3 = individual1.substring(bigger, INDIVIDUAL_SIZE);
  var ind2_2 = individual2.substring(smaller, bigger);
  var offspring = ind1_1 + ind2_2 + ind1_3;

  if(offspring.length != INDIVIDUAL_SIZE) {
    alert('anomaly in offspring, lenght = ' + offspring.length + ' - ' + offspring);
  }

  if (Math.floor(Math.random()*(MAX_RAND + 1)) > MAX_RAND * MUTATION_RATE) {
    offspring = mutate(offspring);
  }

  return offspring;
}

function mutate(individual) {
  var marker = Math.floor(Math.random()*(INDIVIDUAL_SIZE));
  var delta = Math.floor(Math.random()*(INDIVIDUAL_SIZE - marker + 1));
  var mutatedStream = "";

  for(var i=0; i<delta; i++) {
    var randomIndex = Math.floor(Math.random()*(validChars.length + 1));
    mutatedStream += validChars.charAt(randomIndex);
  }

  for (var i=0; i<delta; i++) {
    individual.replaceAt(marker++, mutatedStream.charAt(i));
  }

  return individual;
}

function inoculateRandom(chromosome) {
  var inoculatedChromosome = "";
  for(var i=0; i<chromosome.length; i++) {
    if(chromosome[i] != evolutionTarget[i]) {
      inoculatedChromosome += generateString(1);
    }
    else {
      inoculatedChromosome += chromosome[i];
    }
  }
  return inoculatedChromosome;
}

function inoculateAware(chromosome) {
  var inoculatedChromosome = "", flipped = false;
  for(var i=0; i<chromosome.length; i++) {
    if(chromosome[i] != evolutionTarget[i] && !flipped) {
      inoculatedChromosome += evolutionTarget[i];
      flipped = true;
    }
    else {
      inoculatedChromosome += chromosome[i];
    }
  }
  return inoculatedChromosome; 
}

function generateInitialPop(sizeOfIndividual, sizeOfPopulation) {
  var population = new Array();

  for(var i=0; i<sizeOfPopulation; i++) {
    var individual = generateString(sizeOfIndividual);

    if(individual.length != sizeOfIndividual) {
      alert('size of individual is ' + individual.length + ' - ' + individual);
    }
    population.push(individual);
  }

  return population;
}

function generateString(length) {
  var individual = "";
  for(var i=0; i<length; i++) {
    var randomIndex = Math.floor(Math.random()*(validChars.length));

    if(randomIndex >= validChars.length) {
      alert('randomIndex is ' + randomIndex);
    }
    individual += validChars.charAt(randomIndex);
  }
  return individual;
}
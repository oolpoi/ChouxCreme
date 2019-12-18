// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient,Image } = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function recipe(agent) {
    const recipes = agent.parameters.recipe;
    agent.add(`Searching for recipe "${recipes}."`);
  }
  
  function searchRecipes(agent){
    const recipes = agent.parameters.recipe;
    agent.add(`Searching for recipe "${recipes}."`);
   	var request = require("request");
	var APIKEY = '65cbc0cce46a48c18c36ca1200d9e989';
	
	var options = { method: 'GET',
  	url: 'https://api.spoonacular.com/recipes/search',
  	qs: 
   	{ query: recipes,
     number: '3',
     apiKey: APIKEY }
	};

  	return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      for(var i =0;i<JSON.parse(body).results.length;i++){
        agent.add(JSON.parse(body).results[i].title+" ("+JSON.parse(body).results[i].id+")");
      }
      resolve();
    });
  }); 
  }
  
  function searchRecipeByIngredents(agent){
    
      
  }


  function decoy(agent){
    const ingredients = agent.parameters.ingredents;
    agent.add(`Searching for recipe that includes "${ingredients}."`);
    var request = require("request");
    var APIKEY = '65cbc0cce46a48c18c36ca1200d9e989';
    
    var options = { method: 'GET',
      url: 'https://api.spoonacular.com/recipes/findByIngredients',
      qs: 
       { query: ingredients,
        number: '3',
        apiKey: APIKEY }
        };

      return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      for(var i =0;i<JSON.parse(body).results.length;i++){
        agent.add(JSON.parse(body).results[i].title+"("+JSON.parse(body).results[i].id+")");
      }
      resolve();
    });
  }); 
  }
 
  function getRandomRecipe(agent){
    var unirest = require("unirest");

    var req = unirest("GET", "https://api.spoonacular.com/recipes/random?apiKey=65cbc0cce46a48c18c36ca1200d9e989");


    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      //console.log(res.body.recipes[0]);
      var tmp = "";
      agent.add("Your random recipe is");
      agent.add(res.body.recipes[0].title+"("+res.body.recipes[0].id+")");
    
      for(var i =0;i<res.body.recipes[0].analyzedInstructions[0].steps.length;i++){
        
        tmp = tmp+"Ingredeients"+"\n";
        for(var j =0;j<res.body.recipes[0].analyzedInstructions[0].steps[i].ingredients.length;j++){
            tmp = tmp+res.body.recipes[0].analyzedInstructions[0].steps[i].ingredients[j].name+"\n";
        }
        tmp = tmp+"Equipments"+"\n";
        for(var k =0;k<res.body.recipes[0].analyzedInstructions[0].steps[i].equipment.length;k++){
            tmp = tmp+res.body.recipes[0].analyzedInstructions[0].steps[i].equipment[k].name+"\n";
        }
        tmp = tmp+"Step: "+res.body.recipes[0].analyzedInstructions[0].steps[i].number+"  "+res.body.recipes[0].analyzedInstructions[0].steps[i].step+"\n";
        tmp = tmp+"--------------------------------------"+"\n";
        agent.add(tmp);
        tmp="";
      }  
      //console.log(res.body.recipes[0].analyzedInstructions[0].steps[0]);
      //console.log(res.body.recipes[0].cookingMinutes);//+res.body.recipes[0].PreparationMinutes);
      //console.log(res.body.recipes[0].analyzedInstruction.steps[0]);
    });
  }

  function searchInstructionByName(agent){
    const recipes = agent.parameters.recipe;
    agent.add(`Searching for recipe "${recipes}."`);
   	var request = require("request");
	var APIKEY = '65cbc0cce46a48c18c36ca1200d9e989';
	
	var options = { method: 'GET',
  	url: 'https://api.spoonacular.com/recipes/search',
  	qs: 
   	{ query: recipes,
     number: '1',
     apiKey: APIKEY }
    };
    
    var p = new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
        resolve(JSON.parse(body).results[0].id);
    });
    });
    return p.then(function(values){
        var tmp = "";

    agent.add(`Instructions for recipe id :"${recipes}(${values})"`);
   	
	
	options = { method: 'GET',
  	url: 'https://api.spoonacular.com/recipes/'+values+'/analyzedInstructions',
  	qs: 
   	{ 
     apiKey: APIKEY }
	};
    agent.add(`Searching for recipe "${values}."`);
  	return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
        for(var i =0;i<JSON.parse(body).length;i++){
            tmp = tmp+"Part "+(i+1)+":"+"\n";
            for(var j =0;j<JSON.parse(body)[i].steps.length;j++){
                tmp = tmp+"\nStep "+(j+1)+" :"+"\n";
                tmp = tmp+"\nIngredients:"+"\n";
              for(var k =0;k<JSON.parse(body)[i].steps[j].ingredients.length;k++){
                tmp = tmp+JSON.parse(body)[i].steps[j].ingredients[k].name+"\n";
              }
              tmp = tmp+"\nEquipments:"+"\n";
              for(var l =0;l<JSON.parse(body)[i].steps[j].equipment.length;l++){
                tmp = tmp+JSON.parse(body)[i].steps[j].equipment[l].name+"\n";
              }
              tmp = tmp+"\n";
              tmp = tmp+JSON.parse(body)[i].steps[j].step+"\n";
              tmp = tmp+"---------------------------------------------------------\n";
                                                                        
              agent.add(tmp);
              tmp="";
            }
          }
      resolve();
    });
    }); 
    });
    
  }


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Get Reciepe By Ingredient',decoy);
  intentMap.set('Food Recipes',searchRecipes);
  intentMap.set('Random Recipes',getRandomRecipe);
  intentMap.set('Food Instruction',searchInstructionByName);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

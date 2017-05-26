"use strict";

//Setup / Import libraries
const ApiAiAssistant = require("actions-on-google").ApiAiAssistant;
const express = require("express");
const bodyParser = require("body-parser");
const httpRequest = require("request-promise");
require("string_score");
const utilities = require("./utilities.js"); //utility functions
const app = express();

app.set("port", (process.env.PORT || 8080));
app.use(bodyParser.json({type: "application/json"}));

//Register an endpoint that will listen on http://localhost:8080/
app.post("/", function (request, response) {
  //Create an instance of API.AI assistant
  const assistant = new ApiAiAssistant({request: request, response: response});

  // **************************
  //    Welcome Action
  // **************************

  //action name for welcome
  const WELCOME_ACTION = "welcome";

  //handler function for welcome
  function handleWelcome (assistant) { //for Google Assistant only
    assistant.ask("Hi, I'm fabio - ask me a question!");
  }

  // **************************
  //  Check Balance Action
  // **************************

  //Action name for checking balance
  const CHECK_BALANCE_ACTION = "checkBalance";
  //Handler function for Nessie
  function handleCheckBalance(assistant) {
    //Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "5925e8aba73e4942cdafd649"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    //http://api.reimaginebanking.com/accounts/5925e8aba73e4942cdafd649?key=d5b7be3380bb6eb21f3c377b204f3ebc
    const checkBalanceAPIUrl = "http://api.reimaginebanking.com/accounts/"
    + CUSTOMER_ACCOUNT + "?key=" + NESSIE_API_KEY;

    httpRequest({
      method: "GET",
      uri: checkBalanceAPIUrl,
      json: true
    }).then(function (json) {
      const speech = utilities.findBalance(json);
      
      utilities.replyToUser(request, response, assistant, speech);
    })
    .catch(function (err) {
      console.log("Error:" + err);
      const speech = "I could not check your balance. Ask me something else.";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  // **************************
  //  Convert Balance Action
  // **************************

  //Action name for converting balance
  const CONVERT_BALANCE_ACTION = "convertBalance";
  //Handler function for Nessie
  function handleConvertBalance(assistant) {
    //1. Declare argument constant for user input (currency)
    const CURRENCY_ARG = "currency";
    //2. Extract day of week from the assistant
    const currency = assistant.getArgument(CURRENCY_ARG).toLowerCase();
    console.log(currency)
    //3. Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "5925e8aba73e4942cdafd649"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";

    const convertBalanceAPIUrl = "http://api.reimaginebanking.com/accounts/"
    + CUSTOMER_ACCOUNT + "?key=" + NESSIE_API_KEY;

    httpRequest({
      method: "GET",
      uri: convertBalanceAPIUrl,
      json: true
    }).then(function (json) {
      const speech = utilities.convertBalance(currency, json);
      utilities.replyToUser(request, response, assistant, speech);
    })
    .catch(function (err) {
      console.log("Error:" + err);
      const speech = "I could not convert your balance. Ask me something else.";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Last Transaction Action
  //*****************************

  //Action name for getting last transaction
  const FIND_LAST_TRANSACTION_ACTION = "findLastTransaction"
  //Handler function for getting the last transaction
  function handleLastTransaction(assistant) {
    //Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "5925e8aba73e4942cdafd649"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    const nessieAPIUrl = "http://api.reimaginebanking.com/accounts/"+
    CUSTOMER_ACCOUNT +"/purchases?key="+ NESSIE_API_KEY;

    httpRequest({
      method: "GET",
      uri: nessieAPIUrl,
      json: true
    }).then(function(json){
      const speech = utilities.findLastTransaction(json);
      utilities.replyToUser(request, response,assistant, speech);
    })
    .catch(function(err){
      console.log("Error:" + err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Current Stock Price
  //*****************************

  //Action name for finding stock price
  const CURRENT_STOCK_PRICE_ACTION = "currentStockPrice"
  //Handler function for getting the last transaction
  function handleStockPrice(assistant) {
    //1. Declare argument constant for user input (company name)
    const COMPANY_NAME_ARG = "companyName";
    //2. Extract day of week from the assistant
    const companyName = assistant.getArgument(COMPANY_NAME_ARG).toLowerCase();
    const companyTicker = utilities.findCompanyTicker(companyName);

    //Extract company name and convert to ticker
    const stockAPIUrl = "http://www.quandl.com/api/v3/datatables/WIKI/PRICES.json?date=20170525&ticker=" + companyTicker + "&api_key=xyrBzPSyVzqturdzFyKZ";

    httpRequest({
      method: "GET",
      uri: stockAPIUrl,
      json: true
    }).then(function(json){
      const speech = utilities.findStockPrice(companyName, companyTicker, json);
      utilities.replyToUser(request, response, assistant, speech);
    })
    .catch(function(err){
      console.log("Error:" + err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Transfer Action
  //*****************************

  //Action name for getting last transaction
  const TRANSFER_MONEY_ACTION = "transferMoney"
  //Handler function for getting the last transaction
  function handleTransferMoney(assistant) {
    //1. Declare amount to be transferred (input from user)
    const TRANSFER_AMOUNT_ARG = "transferAmount"
    //2. Extract day of week from the assistant
    const transferAmount = parseFloat(assistant.getArgument(TRANSFER_AMOUNT_ARG));
    //3. Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "5925e8aba73e4942cdafd649"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    const nessieAPIUrl = "http://api.reimaginebanking.com/accounts/"+ CUSTOMER_ACCOUNT +"/transfers?key="+ NESSIE_API_KEY;

    httpRequest({
      method: "POST",
      uri: nessieAPIUrl,
      json: true,
      body: {
          "medium": "balance",
          "payee_id": "59275453ceb8abe24250de9c",
          "amount": transferAmount,
          "transaction_date": "2017-05-25",
          "description": "string"
      }
    }).then(function(json){
      const speech = utilities.transferMoney(json);
      utilities.replyToUser(request, response,assistant, speech);
    })
    .catch(function(err){
      console.log("Error:" + err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Find Bill Action
  //*****************************

  //Action name for getting last transaction
  const FIND_BILL = "findBill"
  //Handler function for getting the last transaction
  function handleFindBill(assistant) {
    //Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "59273aa6ceb8abe24250de6f"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    const nessieAPIUrl = "http://api.reimaginebanking.com/accounts/"+ CUSTOMER_ACCOUNT +"/bills?key="+ NESSIE_API_KEY;
    httpRequest({
      method: "GET",
      uri: nessieAPIUrl,
      json: true
    }).then(function(json){
      const speech = utilities.findBill(json);
      utilities.replyToUser(request, response,assistant, speech);
    })
    .catch(function(err){
      console.log("Eror:"+err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Pay Bill Action
  //*****************************

  const PAY_BILL = "payBill"
  //Handler function for getting the last transaction
  function handlePayBill(assistant) {
     //Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "59273aa6ceb8abe24250de6f"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    const nessieAPIUrl = "http://api.reimaginebanking.com/accounts/"+ CUSTOMER_ACCOUNT +"/bills?key="+ NESSIE_API_KEY;
    httpRequest({
      method: "GET",
      uri: nessieAPIUrl,
      json: true
    }).then(function(json){
      const speech = utilities.payBill(json);
      utilities.replyToUser(request, response,assistant, speech);
    })
    .catch(function(err){
      console.log("Eror:"+err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }

  //*****************************
  // Save Money Action
  //*****************************
  //Action name for getting last transaction
  const SAVE_MONEY_ACTION = "saveMoney"
  //Handler function for getting the last transaction
  function handleSaveMoney(assistant) {
    //Perform networking call to Nessie API and speak result
    const CUSTOMER_ACCOUNT = "5925e8aba73e4942cdafd649"
    const NESSIE_API_KEY = "d5b7be3380bb6eb21f3c377b204f3ebc";
    const nessieAPIUrl = "http://api.reimaginebanking.com/accounts/"
    + CUSTOMER_ACCOUNT + "/purchases?key=" + NESSIE_API_KEY;

    httpRequest({
      method: "GET",
      uri: nessieAPIUrl,
      json: true,
    }).then(function(json){
      const speech = utilities.saveMoney(json);
      utilities.replyToUser(request, response, assistant, speech);
    })
    .catch(function(err){
      console.log("Error:" + err);
      const speech = "I cannot understand that request. Ask me something else";
      utilities.replyToUser(request, response, assistant, speech);
    });
  }
  //Create a map of potential actions that a user can trigger
  const actionMap = new Map();

  //For each action, set a mapping between the action name and the handler function
  actionMap.set(WELCOME_ACTION, handleWelcome);
  actionMap.set(CHECK_BALANCE_ACTION, handleCheckBalance);
  actionMap.set(CONVERT_BALANCE_ACTION, handleConvertBalance)
  actionMap.set(FIND_LAST_TRANSACTION_ACTION, handleLastTransaction);
  actionMap.set(SAVE_MONEY_ACTION, handleSaveMoney);
  actionMap.set(CURRENT_STOCK_PRICE_ACTION, handleStockPrice);
  actionMap.set(FIND_BILL, handleFindBill);
  actionMap.set(TRANSFER_MONEY_ACTION, handleTransferMoney);
  actionMap.set(PAY_BILL, handlePayBill);

  //Register the action map with the assistant
  assistant.handleRequest(actionMap);
});

// Start the server on your local machine
const server = app.listen(app.get("port"), function () {
  console.log("App listening on port %s", server.address().port);
  console.log("Press Ctrl+C to quit.");
});

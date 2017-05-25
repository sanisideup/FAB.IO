const tickersData = require("./tickers.json");
module.exports = {
    findBalance: function (json) {
        const balanceAmount = json.balance
        return ("Your balance is $" + balanceAmount)
    },
    convertBalance: function (currency, json) {
        const currentBalance = json.balance
        var convertedBalance

        switch(currency) {
          case "euros":
            convertedBalance = parseFloat(currentBalance*1.12051).toFixed(2)
            break;
          default:
            convertedBalance = currentBalance
        }

        return ("Your converted balance from $ is: €" + convertedBalance )
    },
    findLastTransaction: function(json){
        const transAmount = json[0].amount
        const transDate = json[0].purchase_date
        const transDesc = json[0].description
        if(transDesc != null){
            return("Your last transaction was a purchase for "+ transDesc
            + " in the amout of $"+ transAmount+ " on "+transDate)
        }
        else{
            return("Your last transaction was a purchase for "+ transAmount
            + " " + "on" + " "+ transDate)
        }

    },
    findCompanyTicker: function(companyName) {
      if(companyName in tickersData) {
        return tickersData[companyName]
      }
    },
    findStockPrice: function (companyTicker, json) {
        const stockPrice = json.l
        const lastUpdate = json.lt
        return companyTicker + "As of " + lastUpdate + ", the stock price is $"
        + stockPrice;
    },
    transferMoney: function(json){
        const amountTransferred = json.objectCreated.amount
        return ("You have transferred $" + amountTransferred + " to Mark's account")
    },
    findBill: function(json){
        const status = json[0].status
        const payee = json[0].payee
        const payment_date = json[0].payment_date
        const payment_amount = json[0].payment_amount
        const recurring_date= json[0].recurring_date
        return ("Your " + payee + " bill is due on"+ payment_date+" in the amount of $"+ payment_amount+". This bill reoccurs on the "+ recurring_date +"st of every month")
    },
    getBillAmount: function(json){
        const payment_amount = json[0].payment_amount
        return (payment_amount)
    },
    payBill: function(json, billPayAmount){
        const status = json[0].status
        const payee = json[0].payee
        const payment_amount = json[0].payment_amount - billPayAmount
        return ("$"+billPayAmount+" has been applied to your " + payee + " bill. Your balance due is now $"+ payment_amount)
    },
    replyToUser: function(request, response, assistant, speech) {
        if(request.body.originalRequest && request.body.originalRequest.source == "google") { //for google assistant
            assistant.ask(speech + ". What else can I help you with?"); //assistant.tell will end the conversation
        }
        else { //for slack
            return response.json({
                    speech: speech,
                    displayText: speech,
                    source: "summit_bot"
            });
        }
    }
}

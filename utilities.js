
const financeTips = require("./financeTips.json");
const tickersData = require("./companyTickers.json");
var say = require('say');

module.exports = {
    findBalance: function(json) {
        const balanceAmount = json.balance
        var speech = ("Your balance is $" + balanceAmount)

        console.log("findBalance hit")
        say.speak(speech)
        return speech;
    },
    convertBalance: function(currency, json) {
        const currentBalance = json.balance
        var convertedBalance
        var currencySymbol

        switch (currency) {
            case "euros":
                convertedBalance = parseFloat(currentBalance * 1.12051).toFixed(2)
                currencySymbol = "€"
                break
            case "yen":
                convertedBalance = parseFloat(currentBalance * 111.476).toFixed(2)
                currencySymbol = "¥"
                break
            case "pounds":
                convertedBalance = parseFloat(currentBalance * 0.7768).toFixed(2)
                currencySymbol = "£"
            case "sterling":
            case "pounds sterling":
                convertedBalance = parseFloat(currentBalance * 0.7768).toFixed(2)
                currencySymbol = "£"
                break
            default:
                convertedBalance = currentBalance
        }

        var speech = ("Your converted balance from $ is: " + currencySymbol +  convertedBalance)
        
        console.log("convertBalance hit")
        say.speak(speech)
        return speech
    },
    findLastTransaction: function(json) {
        const transAmount = json[0].amount
        const transDate = json[0].purchase_date
        const transDesc = json[0].description
        console.log("findLastTransaction hit")
        var speech = ""
        if (transDesc != null) {
            speech = ("Your last transaction was a purchase for " + transDesc +
                " in the amout of $" + transAmount + " on " + transDate);
            say.speak(speech)
            return speech
        } else {
            speech = ("Your last transaction was a purchase for " + transAmount +
                " " + "on" + " " + transDate);
            say.speak(speech)
            return speech
        }

    },
    findCompanyTicker: function(companyName) {
        if(companyName in tickersData[0]) {
            return tickersData[0][companyName]
        } else {
          return nil
        }
    },
    findStockPrice: function (companyName, companyTicker, json) {
        const stockPrice = json.datatable.data[0][5]
        var speech = ("As of today, the stock price of " + companyName + " is $" + stockPrice)
        
        console.log("findStockPrice hit")
        say.speak(speech)
        return speech
    },
    transferMoney: function(json) {
        const amountTransferred = json.objectCreated.amount
        var speech = ("You have transferred $" + amountTransferred + " to Mark's account")
        
        console.log("transferMoney hit")
        say.speak(speech)
        return speech
    },
    saveMoney: function(json) {
        const transactionAmount = 0;
        var hash = {}
        var category

        amountsArr = json.map(function(o) {
            return o.amount;
        })
        categoriesArr = json.map(function(o) {
            return o.description;
        })

        for (category in categoriesArr) {
            hash[categoriesArr[category]] = amountsArr[category]
        }

        var maxCategory = Object.keys(hash).reduce(function(a, b) {
            return hash[a] > hash[b] ? a : b
        })

        var maxCategoryAmount = hash.health.toString()

        var speech = ("In the last month, you've spent a grand total of $"
        + maxCategoryAmount + " on " + maxCategory + ". This was your highest "
        + "expense. " + financeTips[maxCategory])

        console.log("saveMoney hit")
        say.speak(speech)
        return speech
    },
    findBill: function(json){
        const status = json[0].status
        const payee = json[0].payee
        const payment_date = json[0].payment_date
        const payment_amount = json[0].payment_amount
        const recurring_date= json[0].recurring_date
        var speech = ("You have one bill due. Your " + payee + " bill is due on "+ payment_date+" in the amount of $"+ payment_amount+". This bill reoccurs on the "+ recurring_date +"st of every month.")
       
        console.log("findBill hit")
        say.speak(speech)
        return speech;
    },
    payBill: function(json){
        const status = json[0].status
        const payee = json[0].payee
        const payment_date = json[0].payment_date
        const payment_amount = json[0].payment_amount
        const recurring_date= json[0].recurring_date
        var speech = "$" + payment_amount + ".00 has been applied to your Capital One Credit Card bill. Your amount due is now $0.00.";
       
        console.log("findBill hit")
        say.speak(speech)
        return speech;
    },

    replyToUser: function(request, response, assistant, speech) {
        if (request.body.originalRequest && request.body.originalRequest.source == "google") { //for google assistant
            assistant.ask(speech + ". What else can I help you with?"); //assistant.tell will end the conversation
        } else { //for slack
            return response.json({
                speech: speech,
                displayText: speech,
                source: "summit_bot"
            });
        }
    }
}

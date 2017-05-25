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
            return("Your last transaction was a purchase for "+ transDesc + " in the amout of $"+ transAmount+ " on "+transDate)
        }
        else{
            return("Your last transaction was a purchase for "+ transAmount + " " + "on" + " "+ transDate)
        }
        
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

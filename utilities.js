module.exports = {
    findBalance: function (json) {
        const balanceAmount = json.balance
        return ("Your balance is $x" + balanceAmount)
    },
    convertBalance: function (json) {
        const balanceAmount = json.balance
        return ("Your balance is $x" + balanceAmount)
    },
    findTransactions: function(json){
        transAmount = json.amount
        transDate = json.purchase_date
        transDesc = json.description
        if(transDesc != null){
            return("Your last transaction was a purchase for "+ transDesc+" in the amout of $"+ transAmount+ "on"+transDate)
        }
        else{
            return("Your last transaction was a purchase for $"+ transAmount + "on" + transDate)
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
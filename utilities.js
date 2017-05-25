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
            convertedBalance = parseFloat(balance*0.892295).toFixed(2)
            break;
          default:
            convertedBalance = balance
        }

        return ("Your converted balance from $ is: " + convertedBalance + currency)
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

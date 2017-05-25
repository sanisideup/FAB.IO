module.exports = {
    findBalance: function (json) {
        const balanceAmount = json.balance
        return ("Your balance is $x" + balanceAmount)
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
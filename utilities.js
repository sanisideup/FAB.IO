module.exports = {
    findBalance: function (json) {
        const balanceAmount = json[0].balance
        return ("Your balance is " + balanceAmount)
    }
}
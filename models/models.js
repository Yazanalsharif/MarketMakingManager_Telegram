let MODELS = {
  errors: {
    textInsteadOfInline: {
      text: "Please Choose From options Blow\n\n",
      description: "When user instead of selecting option write smt as text",
    },
  },
  pairs: {
    order: ["engine", "base", "quote", "limit"],
    base1: {
      name: "base",
    },
    base: {
      name: "Base",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      title: "Please write your base in your pair",
      description:
        "The base of your pair, for example in BTC-USDT ,BTC is base, You can write in lowercase or upper case",
      max: 8,
      min: 2,
      limitWarning: "Your Base should be between 2 and 8 character",
      validator: "engines/{engineId}/exchange-pairs",
    },
    quote: {
      name: "Quote",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      title: "Please write your quote in your pair",
      description:
        "The quote of your pair, for example in BTC-USDT ,BTC is base and USDT is quote, You can write in lowercase or upper case",
      max: 8,
      min: 2,
      limitWarning: "Your quote should be between 2 and 8 character",
      validator: "engines/{engineId}/exchange-pairs",
    },
    limit: {
      name: "Daily Limit",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title: "Please write your daily limit transaction per day",
      description:
        "Daily limit is amount of the volume per day that bot will make, For example fi you write 100 , bot will make 100 USDT transaction per day",
      max: 10000000,
      min: 10000,
      limitWarning:
        "Your limit should be more than 10000 and less than 10000000",
    },
    threshold: {
      name: "Limit Threshold",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title: "Please write your Limit Threshold transaction",
      description:
        "Limit Threshold is threshold of your limit, for example if your limit be 100 USDT and threshold be 5% bot will make daily volume randomly between 95 - 105 USDT (100 +/- 5%)\nYou can select a number between 0 and 100",
      max: 100,
      min: 0,
      limitWarning: "Your limit should be more than 0 and less than 100",
    },
    priceStrategyType: {
      name: "Price Strategy Type",
      mandatory: true,
      type: "options",
      shouldAsk: true,
      title: "Please select Price Strategy Type",
      description:
        "normally bot choose the price for trades around market price, the average of best asks and best bids\nIn Random strategy type bot will choose random price upper or lower than market price\nIn Up strategy type bot will choose random price upper than market price\nIn Down strategy type bot will choose random price lower than market price",
      max: 100,
      min: 0,
      options: [
        { id: "random", name: "Random" },
        { id: "up", name: "Up" },
        { id: "Down", name: "Down" },
      ],
    },
    priceStrategyThreshold: {
      name: "Price Strategy Threshold",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title: "Please write your Price Strategy Threshold ",
      description:
        "Price Strategy Threshold is Threshold from market price with that type you selected, for example with Random type and 5% Threshold bot will set the price randomly 5% upper or lower than market price and with Up type and 5% Threshold bot will set the price randomly around 5% upper than market price and best asks  ",
      max: 100,
      min: 0,
      limitWarning: "Your limit should be more than 0 and less than 100",
    },
    orderTimeout: {
      name: "Orders Timeout",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title: "Please write Orders Timeout (seconds) ",
      description:
        "The open order that doesnt fill will cancel automatically after Orders Timeout , for example if you write 5, after 5 seconds the opened order will cancel in a case that didnt fill.\nOrders Timeout can not be empty and should be a number  ",
      max: 1800,
      min: 2,
      limitWarning: "Your limit should be more than 2 and less than 1800",
    },
    buySellDiff: {
      name: "Buy and Sell Amount difference",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title: "Please write Buy and Sell Amount difference (Percent) ",
      description:
        "Bot opens buy and sell orders at the same time, by default sell orders and buy orders amount are exactly same,With Buy and Sell Amount difference you can control this, for example if you set 5  forBuy and Sell Amount difference bot will open Buy orders amount 5% higher than Sell orders, and if you set -5 , Bot will open Buy orders 5% lower than sell orders, please note it, the difference in the amount that doesnt match will cancel depends to Orders Timeout config  ",
      max: 100,
      min: -100,
      limitWarning: "Your limit should be more than -100 and less than 100",
    },
    confirmation: {
      name: "Confirmation",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation New Pair will add",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    editConfirmation: {
      name: "Confirmation The edition",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation The pair will be updated",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    engine: {
      name: "Exchange",
      refCollection: "engines",
      mandatory: true,
      type: "options",
      shouldAsk: true,
      title: "Please Choose the exchange you wanna make the operation with",
      description:
        "This exchange you select will be used to perform trading over it,\n\nYou have to add the pair from the exchange that you are choosing which the engine will trade on that pair\n\nYou have to add accounts to the exchange which those accounts will make the trading according to the bot commands",
      options: [{ id: "kucoin", name: "Kucoin", engineName: "kucoin" }],
    },
    display: {
      name: "Dispaly",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      title: "Display The pair infromation related to the choosen option\n",
      options: [{ id: "back_from_displayingInformation", name: "Back" }],
    },
    pairList: {
      name: "List pairs",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      description:
        "You have to choose one of your pair to complete your operation",
      title: "Please choose from one of the below pairs",
    },
    autoStart: {
      name: "Auto Start Engine",
      mandatory: true,
      type: "option",
      shouldAsk: true,
      title: "Please enable or disable the auto start trading",
      description:
        "Auto start feature give you a choise to let the engine work once you filled the balance after finishing\n\nExample: if the engine work on specific pair and the balance finish the engine will stop automaticaly, with this feature the engine will work auto once the balance send",
      options: [
        { id: "enable", name: "Enable" },
        { id: "disable", name: "Disable" },
      ],
    },
  },
  status: {
    reason: {
      name: "Reason",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      options: [{ id: "back_from_displayingInformation", name: "Back" }],
    },
    status: {
      name: "status",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      title: "Please choose one of the below options",
      description:
        "Pair status is referrence to the pair which if the status (working) then the engine is working to the pair, if the status stopped then the engine not working for the pair, you can check the reason by getting the status",
      options: [
        { id: "working", name: "Working" },
        { id: "stopped", name: "Stop" },
      ],
    },
  },
  activityReport: {
    order: ["type", "emails", "time", "telegram"],
    emails: {
      name: "Email",
      mandatory: true,
      type: "array",
      shouldAsk: true,
      title: "Please enter the email for receiving the trading activity report",
      description:
        "You can input your email address to receive the trading activity that made by  the Market maker bot, You can add more than email",
      verify:
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      warning: "Please enter a valid email",
    },
    enable: {
      name: "Enable",
      mandatory: true,
      type: "Boolean",
      shouldAsk: true,
      title: "Please select one of the below options",
      description:
        "The report must be enabled to be send, if enable is turn off the engine will not send the report",
      limitWarning: "Please enter a valid email",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    id: `The report doc Id`,
    time: {
      name: "Time",
      mandatory: true,
      type: "string",
      title: "Please Enter the trading activity report time",
      description:
        "The time format is 00:00, For example if the time 12:30 and the period is daily then the report will be send every day at choosen time",
      warning: "Please enter the time as 00:00 format",
    },
    type: {
      name: "Report period",
      mandatory: true,
      type: "string",
      title: "Please Select the Report period from the option below",
      description:
        "The report period is the period that the engine will send the activity report for example is the period daily, the engine will send report in a daily period",
      options: [
        { id: "daily", name: "Daily" },
        { id: "monthly", name: "Monthly" },
      ],
    },
    telegram: {
      name: "Telegram",
      mandatory: true,
      type: "array",
      shouldAsk: true,
      title:
        "Please choose if you want to receive the reports through the telegram app as well",
      description:
        "If you select yes then the report will send through the email and telegram, if you select no the report will send only through the email",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    confirmation: {
      name: "Confirmation",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation New report will add to the pair",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    updateConfirmation: {
      name: "Confirmation The edition",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation The report will be updated",
      options: [
        { id: "update", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    deleteConfirmation: {
      name: "Delete the report",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation The report will be deleted",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    deleteEmails: {
      name: "Deleted Emails",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title:
        "Please click on the email that you want to delete, when you finishing deleting the emails Please click Next",
      description:
        "You can remove one or more than one email in this step, click on the email that want to delete and then click Next",
    },
    reportList: {
      name: "List reports",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      description:
        "You have to choose one of your report to complete your operation",
      title: "Please choose from one of the below options",
    },
    display: {
      name: "Dispaly",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      title: "Display The report infromation related to the choosen option",
      options: [{ id: "back_from_displayingInformation", name: "Back" }],
    },
  },
  tradingAccount: {
    user: {
      name: "Account Name",
      mandatory: true,
      type: "Boolean",
      shouldAsk: true,
      title: "Please enter the account name",
      description:
        "Its the name of the account, The name length must be 5 - 15 characters",
      warning:
        "The name lenght must be more than 5 characters and less than 15 characters",
      minLenght: 5,
      maxLength: 15,
    },
    active: {
      name: "Active",
      mandatory: true,
      type: "Boolean",
      shouldAsk: true,
      title: "Please select one of the below options",
      description:
        "The Account must be active to let the engine use it and trade over it",
      options: [
        { id: "true", name: "Yes" },
        { id: "false", name: "No" },
      ],
    },
    id: {
      name: "Doc Id",
      description: "This value will be added automatically",
    },
    platform: {
      name: "Platform",
      description:
        "This value will be added automatically from the engine step",
    },
    key: {
      name: "Api Key",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title: "Please enter the api key",
      description:
        "The api key is the key generated from the exchange, you have first to create an api from your account in the exchange and then copy the key and insert it here",
      warning: "The key lenght must be 20 - 50 characters",
      minLenght: 20,
      maxLength: 50,
    },
    secret: {
      name: "Api secret",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title: "Please enter the api secret",
      description:
        "The api secret is the secret generated from the exchange, you have first to create an api from your account in the exchange and then copy the key and insert it here",
      warning: "The secret lenght must be 20 - 50 characters",
      minLenght: 20,
      maxLength: 50,
    },
    passphrase: {
      name: "Api passphrase",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title: "Please enter the api passphrase",
      description:
        "The api passphrase is the password that you entered when you created the api key from your exchagne account",
      warning: "The key lenght must be 7 - 32 characters",
      minLenght: 7,
      maxLength: 32,
    },
    accountList: {
      name: "List Accounts",
      mandatory: true,
      type: "string",
      shouldAsk: true,
      description:
        "You have to choose one of your account to complete your operation",
      title: "Please choose from one of the below accounts",
    },
    confirmation: {
      name: "Confirmation",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation New account will be added to the admin",
      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
    deleteConfirmation: {
      name: "Delete The Account",
      mandatory: true,
      type: "number",
      shouldAsk: true,
      title:
        "Please Check the settings and confirm,After confirmation The account will be deleted",

      options: [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ],
    },
  },

  user: {
    email: {
      name: "Email",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title: "Please Enter your email address",
      description:
        "Please use the email address that you register with it in the market making bot web app",
      verify:
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      warning: "The User doesn't Exist, Please enter your email address",
    },
    password: {
      name: "Password",
      mandatory: true,
      type: "String",
      shouldAsk: true,
      title: "Please Enter your password",
      description:
        "Please enter the password. The password must matches with your email",
      warning: "Invalid password",
    },
  },
};

module.exports = { MODELS };

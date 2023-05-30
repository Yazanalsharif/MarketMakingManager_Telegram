const { db } = require("../config/db");
let MODELS = {
    pairs:{
        order:['engine','base','quote','limit'],
        base1:{
            name:'base'
        },
        base:{
            name:'Base',
            mandatory:true,
            type:'string',
            shouldAsk:true,
            title:'Please write your base in your pair',
            description: 'The base of your pair, for example in BTC-USDT ,BTC is base, You can write in lowercase or upper case',
            max:8,
            min:2,
            limitWarning:'Your Base should be between 2 and 8 character',
            validator:'engines/{engineId}/exchange-pairs'

        },
        quote:{
            name:'Quote',
            mandatory:true,
            type:'string',
            shouldAsk:true,
            title:'Please write your quote in your pair',
            description: 'The quote of your pair, for example in BTC-USDT ,BTC is base and USDT is quote, You can write in lowercase or upper case',
            max:8,
            min:2,
            limitWarning:'Your quote should be between 2 and 8 character',
            validator:'engines/{engineId}/exchange-pairs'

        },
        limit:{
            name:'Daily Limit',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please write your daily limit transaction per day',
            description: 'Daily limit is amount of the volume per day that bot will make, For example fi you write 100 , bot will make 100 USDT transaction per day',
            max:10000000,
            min:10000,
            limitWarning:'Your limit should be more than 10000 and less than 10000000'

        },
        threshold:{
            name:'Limit Threshold',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please write your Limit Threshold transaction',
            description: 'Limit Threshold is threshold of your limit, for example if your limit be 100 USDT and threshold be 5% bot will make daily volume randomly between 95 - 105 USDT (100 +/- 5%)\nYou can select a number between 0 and 100',
            max:100,
            min:0,
            limitWarning:'Your limit should be more than 0 and less than 100'

        },
        priceStrategyType:{
            name:'Price Strategy Type',
            mandatory:true,
            type:'options',
            shouldAsk:true,
            title:'Please select Price Strategy Type',
            description: 'normally bot choose the price for trades around market price, the average of best asks and best bids\nIn Random strategy type bot will choose random price upper or lower than market price\nIn Up strategy type bot will choose random price upper than market price\nIn Down strategy type bot will choose random price lower than market price',
            max:100,
            min:0,
            options:[
                {id:'random',name:'Random'},
                {id:'up',name:'Up'},
                {id:'Down',name:'Down'},
            ]
        },
        priceStrategyThreshold:{
            name:'Price Strategy Threshold',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please write your Price Strategy Threshold ',
            description: 'Price Strategy Threshold is Threshold from market price with that type you selected, for example with Random type and 5% Threshold bot will set the price randomly 5% upper or lower than market price and with Up type and 5% Threshold bot will set the price randomly around 5% upper than market price and best asks  ',
            max:100,
            min:0,
            limitWarning:'Your limit should be more than 0 and less than 100'

        },
        orderTimeout:{
            name:'Orders Timeout',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please write Orders Timeout (seconds) ',
            description: 'The open order that doesnt fill will cancel automatically after Orders Timeout , for example if you write 5, after 5 seconds the opened order will cancel in a case that didnt fill.\nOrders Timeout can not be empty and should be a number  ',
            max:1800,
            min:2,
            limitWarning:'Your limit should be more than 2 and less than 1800'

        },
        buySellDiff:{
            name:'Buy and Sell Amount difference',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please write Buy and Sell Amount difference (Percent) ',
            description: 'Bot opens buy and sell orders at the same time, by default sell orders and buy orders amount are exactly same,With Buy and Sell Amount difference you can control this, for example if you set 5  forBuy and Sell Amount difference bot will open Buy orders amount 5% higher than Sell orders, and if you set -5 , Bot will open Buy orders 5% lower than sell orders, please note it, the difference in the amount that doesnt match will cancel depends to Orders Timeout config  ',
            max:100,
            min:-100,
            limitWarning:'Your limit should be more than -100 and less than 100'

        },
        confirmation:{
            name:'Confirmation',
            mandatory:true,
            type:'number',
            shouldAsk:true,
            title:'Please Check the settings and confirm,After confirmation New Pair will add',
            options:[
                {id:'yes',name:'Yes'},
                {id:'no',name:'No'},
            ]

        },
        engine:{
            name:'Exchange',
            refCollection:'engines',
            mandatory:true,
            type:'options',
            shouldAsk:true,
            title:'Please Choose the exchange you wanna add the pair',
            description: 'This exchange you select will be used to add the pair',
            options:[
                {id:'kucoin',name:'Kucoin',engineName:'kucoin'}
            ]
        }
    }
}



// getModels().then(result =>{MODELS = result})

// Get all models
async function getModels() {
    let models = {};
    console.log('getting models')
    try {
        const modelsSnapshot = await db
            .collection("model")
            .get();

        if (modelsSnapshot.empty) {
            throw new ErrorResponse(
                "There are no model"
            );
        }

        modelsSnapshot.forEach((doc) => {
            models[doc.id] = doc.data();
        });

        return models;
    } finally {
        // console.log(err);
    }
};


module.exports = { getModels,MODELS};

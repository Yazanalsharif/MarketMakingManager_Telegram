const {MODELS} = require('../models/models')
const {ENGINES} = require('../models/engines')
const {pairsList} = require("../view/marketMaker");

const { Scenes,Markup } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");

const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { addNewPair } = require("../models/Pairs");
const { mainMenu } = require("../view/main");
let addingPairScene

function engineStep(back = 'back') {
    let step = async (ctx) => {
        try {
            console.log('coming to engine')
            let query;
            let shouldEdit = true;
            let title = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    let id = ctx.update.message.message_id;
                    console.log('id',id)
                    await deleteMessage(ctx, bot, id);
                    ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                ctx.wizard.state.messageToEdit = ctx.update.callback_query.message.message_id
                query = ctx.update.callback_query.data;
                if (checkOptions(MODELS.pairs.engine.options,query))
                {
                    ctx.wizard.next();
                    if (ctx.wizard.state.data === undefined)ctx.wizard.state.data={};
                    ctx.wizard.state.data.engine = query
                    resetStage(ctx)
                    return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                }
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_engine") {
                console.log(back)
                if (back === 'back'){
                    ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                    resetStage(ctx)
                    return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                }else if(back === 'pairsList'){
                    console.log('going pairsList')
                    await pairsList(ctx, bot);
                    return ctx.scene.leave();
                }

            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.engine.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.engine.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.engine.title:ctx.wizard.state.message+MODELS.pairs.engine.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                for (let option of MODELS.pairs.engine.options){
                    keyboard_options[0].push({ text: option.name, callback_data: option.id });
                }
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_engine" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }
            const adminId = await getAdmin(ctx);
            //
            //  //   store the adminId to the session and pass it to the next middleware
            ctx.wizard.state.adminId = adminId;

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}

function baseStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to base')
            let query;
            let shouldEdit = true;
            let title = ''
            let base = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                    base = ctx.message.text
                    ctx.wizard.state.data.base = base
                    ctx.wizard.next();
                    resetStage(ctx)
                    return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_base") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.base.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.base.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.base.title:ctx.wizard.state.message+MODELS.pairs.base.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_base" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function quoteStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to quote')
            let query;
            let shouldEdit = true;
            let title = ''
            let quote = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                    quote = ctx.message.text
                    ctx.wizard.state.data.quote = quote
                    ctx.wizard.next();
                    resetStage(ctx)
                    return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_quote") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.quote.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.quote.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.quote.title:ctx.wizard.state.message+MODELS.pairs.quote.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_quote" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function limitStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to limit')
            let query;
            let shouldEdit = true;
            let title = ''
            let limit = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    if (isNumeric(ctx.message.text) && parseInt(ctx.message.text) <= MODELS.pairs.limit.max && parseInt(ctx.message.text) >= MODELS.pairs.limit.min){
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        limit = ctx.message.text
                        ctx.wizard.state.data.limit = parseInt(limit)
                        ctx.wizard.next();
                        resetStage(ctx)
                        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                    }else {
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        ctx.wizard.state.message = MODELS.pairs.limit.limitWarning + '\n'
                    }

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_limit") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.limit.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.limit.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.limit.title:ctx.wizard.state.message+MODELS.pairs.limit.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_limit" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function thresholdStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to threshold')
            let query;
            let shouldEdit = true;
            let title = ''
            let threshold = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    if (isNumeric(ctx.message.text) && parseInt(ctx.message.text) <= MODELS.pairs.threshold.max && parseInt(ctx.message.text) >= MODELS.pairs.threshold.min){
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        threshold = ctx.message.text
                        ctx.wizard.state.data.threshold = parseInt(threshold)
                        ctx.wizard.next();
                        resetStage(ctx)
                        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                    }else {
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        ctx.wizard.state.message = MODELS.pairs.threshold.limitWarning + '\n'
                    }

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_threshold") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.threshold.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.threshold.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.threshold.title:ctx.wizard.state.message+MODELS.pairs.threshold.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_threshold" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function priceStrategyTypeStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to priceStrategyType')
            let query;
            let shouldEdit = true;
            let title = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    let id = ctx.update.message.message_id;
                    console.log('id',id)
                    await deleteMessage(ctx, bot, id);
                    ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                if (checkOptions(MODELS.pairs.priceStrategyType.options,query))
                {
                    ctx.wizard.next();
                    ctx.wizard.state.data.priceStrategyType = query
                    resetStage(ctx)
                    return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                }
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_priceStrategyType") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.priceStrategyType.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.priceStrategyType.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.priceStrategyType.title:ctx.wizard.state.message+MODELS.pairs.priceStrategyType.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                for (let option of MODELS.pairs.priceStrategyType.options){
                    keyboard_options[0].push({ text: option.name, callback_data: option.id });
                }
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_priceStrategyType" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function priceStrategyThresholdStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to priceStrategyThreshold')
            let query;
            let shouldEdit = true;
            let title = ''
            let priceStrategyThreshold = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    if (isNumeric(ctx.message.text) && parseInt(ctx.message.text) <= MODELS.pairs.priceStrategyThreshold.max && parseInt(ctx.message.text) >= MODELS.pairs.priceStrategyThreshold.min){
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        priceStrategyThreshold = ctx.message.text
                        ctx.wizard.state.data.priceStrategyThreshold = parseInt(priceStrategyThreshold)
                        ctx.wizard.next();
                        resetStage(ctx)
                        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                    }else {
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        ctx.wizard.state.message = MODELS.pairs.priceStrategyThreshold.limitWarning + '\n'
                    }

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_priceStrategyThreshold") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.priceStrategyThreshold.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.priceStrategyThreshold.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.priceStrategyThreshold.title:ctx.wizard.state.message+MODELS.pairs.priceStrategyThreshold.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_priceStrategyThreshold" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function orderTimeoutStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to orderTimeout')
            let query;
            let shouldEdit = true;
            let title = ''
            let orderTimeout = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    if (isNumeric(ctx.message.text) && parseInt(ctx.message.text) <= MODELS.pairs.orderTimeout.max && parseInt(ctx.message.text) >= MODELS.pairs.orderTimeout.min){
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        orderTimeout = ctx.message.text
                        ctx.wizard.state.data.orderTimeout = parseInt(orderTimeout)
                        ctx.wizard.next();
                        resetStage(ctx)
                        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                    }else {
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        ctx.wizard.state.message = MODELS.pairs.orderTimeout.limitWarning + '\n'
                    }

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_orderTimeout") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.orderTimeout.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.orderTimeout.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.orderTimeout.title:ctx.wizard.state.message+MODELS.pairs.orderTimeout.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_orderTimeout" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function buySellDiffStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to buySellDiff')
            let query;
            let shouldEdit = true;
            let title = ''
            let buySellDiff = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    if (isNumeric(ctx.message.text) && parseInt(ctx.message.text) <= MODELS.pairs.buySellDiff.max && parseInt(ctx.message.text) >= MODELS.pairs.buySellDiff.min){
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        buySellDiff = ctx.message.text
                        ctx.wizard.state.data.buySellDiff = parseInt(buySellDiff)
                        ctx.wizard.next();
                        resetStage(ctx)
                        return ctx.wizard.steps[ctx.wizard.cursor](ctx)
                    }else {
                        let id = ctx.update.message.message_id;
                        await deleteMessage(ctx, bot, id);
                        ctx.wizard.state.message = MODELS.pairs.buySellDiff.limitWarning + '\n'
                    }

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_buySellDiff") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            if (query === "back_from_help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = false
                ctx.wizard.state.message = undefined
            }
            if (query === "help") {
                ctx.wizard.state.shouldEdit = true;
                ctx.wizard.state.helpMode = true
                title = MODELS.pairs.buySellDiff.description
                ctx.wizard.state.message = undefined
                ctx.wizard.state.title = title
            }
            if (ctx.wizard.state.helpMode){
                title = MODELS.pairs.buySellDiff.description

            }else {
                title = ctx.wizard.state.message === undefined?MODELS.pairs.buySellDiff.title:ctx.wizard.state.message+MODELS.pairs.buySellDiff.title
            }
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                keyboard_options.push([{ text: "Help", callback_data: "help" }]);
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_buySellDiff" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}
function confirmationStep() {
    let step = async (ctx) => {
        try {
            console.log('coming to confirmation Type')
            let query;
            let shouldEdit = true;
            let title = ''
            if (ctx.message){
                if (ctx.message.text && !ctx.wizard.state.firstEntry) {
                    let id = ctx.update.message.message_id;
                    console.log('id',id)
                    await deleteMessage(ctx, bot, id);
                    ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text

                }else if(ctx.wizard.state.helpMode){
                    let id = ctx.update.message.message_id;
                    await deleteMessage(ctx, bot, id);
                }
            }
            ctx.wizard.state.firstEntry = false


            // check if the ctx came from the inline keyboard
            if (ctx.update.callback_query) {
                query = ctx.update.callback_query.data;
                console.log(query);
            }

            if (query === "main") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "yes") {
                let priceStrategy = {
                    type:ctx.wizard.state.data.priceStrategyType,
                    threshold:ctx.wizard.state.data.priceStrategyThreshold
                }
                let dataToSave = {}
                dataToSave["base"] = ctx.wizard.state.data.base
                dataToSave["quote"] = ctx.wizard.state.data.quote
                dataToSave["limit"] = ctx.wizard.state.data.limit
                dataToSave["threshold"] = ctx.wizard.state.data.threshold
                dataToSave["orderTimeout"] = ctx.wizard.state.data.orderTimeout
                dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff
                dataToSave["priceStrategy"] = priceStrategy
                dataToSave["pair"] = ctx.wizard.state.data.base+'-'+ctx.wizard.state.data.quote
                dataToSave["symbol"] = ctx.wizard.state.data.base+ctx.wizard.state.data.quote
                dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff
                dataToSave["engineName"] = ctx.wizard.state.data.engine
                dataToSave["engine"] = ctx.wizard.state.data.engine
                dataToSave["sandbox"] = true
                dataToSave["enable"] = false


                await addNewPair(dataToSave,ctx.wizard.state.adminId)




                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "no") {
                await mainMenu(ctx, bot);
                return ctx.scene.leave();
            }
            if (query === "back_from_confirmation") {
                ctx.wizard.selectStep(ctx.wizard.cursor - 1)
                resetStage(ctx)
                return ctx.wizard.steps[ctx.wizard.cursor](ctx)
            }
            let dataToPrint = ''
            const dataKeys = Object.keys(ctx.wizard.state.data)
            for (let key of dataKeys){
                dataToPrint = dataToPrint + MODELS.pairs[key].name + ' : ' + ctx.wizard.state.data[key] + '\n'
            }

                title = ctx.wizard.state.message === undefined?MODELS.pairs.confirmation.title+dataToPrint:ctx.wizard.state.message+MODELS.pairs.confirmation.title+dataToPrint
            if (ctx.wizard.state.title !== title){
                ctx.wizard.state.shouldEdit = true
                ctx.wizard.state.title = title
            }
            shouldEdit = contentShouldEdit(ctx)


            let keyboard_options = [[]];
            if (ctx.wizard.state.helpMode){
                keyboard_options.push([{ text: "back", callback_data: "back_from_help" }]);

            }else{
                for (let option of MODELS.pairs.confirmation.options){
                    keyboard_options[0].push({ text: option.name, callback_data: option.id });
                }
                keyboard_options.push([{ text: "Back ", callback_data: "back_from_confirmation" }]);
                keyboard_options.push([{ text: "Back To Home", callback_data: "main" }]);
            }

            if (shouldEdit){
                await ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.messageToEdit, 0, {
                    text: title,
                    inline_message_id: ctx.wizard.state.messageToEdit,
                    reply_markup: {
                        inline_keyboard: keyboard_options,
                    },
                });
            }

            ctx.wizard.state.message = undefined
            return
        } catch (err) {
            // reply with the error
            console.log(err);
            ctx.reply(err.message, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
                },
            });
        }
    }
    return step
}

function checkOptions(options,query){
    for (let option of options){
        if (option.id === query){
            return true
        }
    }
    return false

}
function isNumeric(value) {
    return /^-?\d+$/.test(value);
}
function resetStage(ctx){
    ctx.wizard.state.message = undefined
    ctx.wizard.state.title = undefined
    ctx.wizard.state.shouldEdit = true
    ctx.wizard.state.firstEntry = true
    ctx.wizard.state.helpMode = false
}
function contentShouldEdit(ctx){
    let shouldEdit = false;
    if (ctx.wizard.state.shouldEdit){
        shouldEdit = true;
        ctx.wizard.state.shouldEdit = false
    }else if (ctx.wizard.state.shouldEdit === undefined){
        ctx.wizard.state.shouldEdit = false
        shouldEdit = true
    }else{
        shouldEdit = false
    }
    return shouldEdit;
}

 addingPairScene = new Scenes.WizardScene(
    "addingPairScene",
     engineStep('pairsList'),
     baseStep(),
     quoteStep(),
     limitStep(),
     thresholdStep(),
     priceStrategyTypeStep(),
     priceStrategyThresholdStep(),
     orderTimeoutStep(),
     buySellDiffStep(),
     confirmationStep()
);


module.exports = { addingPairScene };

const express = require('express');
const router = express.Router();
const knex = require('../knexConfig');
const { v4: uuid } = require('uuid')
const axios = require('axios')
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

require('dotenv').config()

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            'client_id': process.env.CLIENT_ID,
            'secret': process.env.CLIENT_SECRET,
        },
    },
});

const client = new PlaidApi(configuration)

router.post('http://localhost:8888/plaid_webhook', (req, res) => {
    console.log(req.body + ' OR ' + req)
})

router.post('/create_link_token', async (req, res) => {
    const { user_id } = req.body

    const clientUserId = uuid();
    const request = {
        client_id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        user: {
            client_user_id: clientUserId
        },
        client_name: "Stash Test App",
        language: "en",
        country_codes: ["US", "CA"],
        products: ["transactions", "auth"],
        webhook: "http://localhost:8888/plaid_webhook",
        redirect_uri: "https://localhost:3000/account/:userId"

    };
    try {
        const createTokenResponse = await client.linkTokenCreate(request)
        res.json(createTokenResponse.data.link_token)
    } catch (error) {
        console.log(error)
    }
})

router.post('/public_token_exchange', async (req, res, next) => {
    const { public_token } = req.body

    try {
        const response = await client.itemPublicTokenExchange({
            client_id: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
            public_token: public_token
        })

        const accessToken = response.data.access_token
        const itemId = response.data.item_id

        res.json(accessToken)

    } catch (error) {
        console.log(error)
    }
})

router.post('/transactions/recurring', async (req, res) => {

    //     const {user_id} = req.body


    // // creating new dates so PLAID input dates are dynamic to current date and 1 month ago
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prevMonth = String(today.getMonth()).padStart(2, '0')
    const year = String(today.getFullYear())

    const currentDate = year + '-' + month + '-' + day
    const prevDate = year + '-' + prevMonth + '-' + day

    try {
        const response = await client.transactionsGet({
            client_id: process.env.CLIENT_ID,
            access_token: req.body.access_token,
            secret: process.env.CLIENT_SECRET,
            // count: 5
            start_date: prevDate,
            end_date: currentDate
        })

        const categories = ['18061000', '17018000']

        allSubscriptions = response.data.transactions

        const filter = []

        filter.push(allSubscriptions.filter(sub => sub.category_id === '18061000'))
        filter.push(allSubscriptions.filter(sub => sub.category_id === '17018000'))
        filter.push(allSubscriptions.filter(sub => sub.category_id === '18060000'))
        filter.push(allSubscriptions.filter(sub => sub.category_id === '17001000'))

        // console.log(filter)
        console.log(filter)

    } catch (error) {
        console.log(error)
    }

    // filtering data to only return name, amount, date, and next date(next month) of the subscription
    //     const filteredData = res.data.added.map(info=> {

    //         const date = new Date(info.date.split('-'))
    //         const nextDay = String(date.getDate()).padStart(2, '0')
    //         const nextMonth = String(date.getMonth() + 2).padStart(2, '0')
    //         const year = String(date.getFullYear())
    //         const nextDate = year + '-' + nextMonth + '-' + nextDay

    //         return {
    //             id: uuid(),
    //             name: info.name,
    //             date: info.date,
    //             nextDate: nextDate,
    //             amount: info.amount,
    //         }
    //     })

    //     // adding filtered bank transactions to current user in DB
    //     knex('users')
    //     .where({user_id: user_id})
    //     .update({subscriptions: JSON.stringify(filteredData), connected: 'true'})
    //     .then(user => {
    //         resolve.status(201).json({Success: true, Message: 'Data Recieved'})
    //     })
    // .catch(err => {
    //     console.log(err)
    // })
})

module.exports = router;
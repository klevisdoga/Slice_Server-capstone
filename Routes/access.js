const express = require('express');
const router = express.Router();
const knex = require('../knexConfig');
const { v4: uuid } = require('uuid')
const axios = require('axios')

require('dotenv').config()

router.get('/create_link_token', (req, res) => {

    axios.post(`${process.env.CLIENT_URL}/link/token/create`, {
        client_id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        client_name: 'Stash Test App',
        language: 'en',
        country_codes: ['US', 'CA'],
        user: {
            client_user_id: uuid()
        },
        products: ["auth", "transactions"]

    }).then(resolve => {
        res.json(resolve.data.link_token)
    })
        .catch(err => {
            console.log(err)
        })
});

router.post('/public_token_exchange', (req, res) => {
    const { public_token } = req.body

    axios.post(`${process.env.CLIENT_URL}/item/public_token/exchange`, {
        client_id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        public_token: public_token

    })
        .then(resolve => {
            const accessToken = resolve.data.access_token
            res.json(accessToken)
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/transactions/recurring', (req, resolve) => {

    const {user_id} = req.body

// creating new dates so PLAID input dates are dynamic to current date and 1 month ago
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prevMonth = String(today.getMonth()).padStart(2, '0')
    const year = String(today.getFullYear())

    const currentDate = year + '-' + month + '-' + day
    const prevDate = year + '-' + prevMonth  + '-' + day

    axios.post(`${process.env.CLIENT_URL}/transactions/get`, {
        client_id: process.env.CLIENT_ID,
        access_token: req.body.access_token,
        secret: process.env.CLIENT_SECRET,
        start_date: prevDate,
        end_date: currentDate
    })
    .then(res => {

        // filtering data to only return name, amount, date, and next date(next month) of the subscription
        const filteredData = res.data.transactions.map(info=> {

            const date = new Date(info.date.split('-'))
            const nextDay = String(date.getDate()).padStart(2, '0')
            const nextMonth = String(date.getMonth() + 2).padStart(2, '0')
            const year = String(date.getFullYear())
            const nextDate = year + '-' + nextMonth + '-' + nextDay

            return {
                id: uuid(),
                name: info.name,
                date: info.date,
                nextDate: nextDate,
                amount: info.amount,
            }
        })

        // adding filtered bank transactions to current user in DB
        knex('users')
        .where({user_id: user_id})
        .update({subscriptions: JSON.stringify(filteredData), connected: 'true'})
        .then(user => {
            resolve.status(201).json({Success: true, Message: 'Data Recieved'})
        })
    })
    .catch(err => {
        console.log(err)
    })
})

module.exports = router;
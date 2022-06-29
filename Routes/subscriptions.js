const express = require('express');
const router = express.Router();
const knex = require('../knexConfig');
const { v4: uuid } = require('uuid')

router.post('/subscription/add', (req, res) => {
    const {user_id} = req.body

    const newSub = {
        id: uuid(),
        user_id: user_id,
        ...req.body
    }

    console.log(newSub)

    // knex('subscriptions')
    // .insert(newSub)
    // .then(data => {
    //     res.status(201).send({Success: true, Message: 'Subscription Added', Data: data})
    // })
})

module.exports = router
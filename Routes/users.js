const express = require('express');
const router = express.Router();
const knex = require('../knexConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid')
const authenticate = require("../middleware/authenticate");


//Creating route for signing up.
router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password, confirmPass } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10)


    //Creating a new user from the '/signup' page on the client side.
    const newUser = {
        user_id: uuid(),
        ...req.body,
        password: hashedPassword,
        subscriptions: '',
        connected: 'false'
    }

    // console.log(newUser)
    //Adding the new user to the DB(Database)
    knex('users')
        .insert(newUser)
        .then((user) => {

            const token = jwt.sign(
                { id: newUser.user_id, email: newUser.email },
                process.env.JWT_KEY,
                { expiresIn: "3h" }
            )
            res.status(201).send({ success: true, mesasge: "Account Created", userId: newUser.user_id, token: token });
        });
});

//Creating route for logging in.
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    knex('users')
        .where({ email: email })
        .first()
        .then((user) => {

            // Taking the password that was encrypted and making sure it matches as it did when they signed up.
            const isPasswordCorrect = bcrypt.compareSync(password, user.password)

            if (!isPasswordCorrect) {
                return res.status(400).send("Invalid Password/Email")
            }

            // creating a token and sending it back to the client side
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_KEY,
                { expiresIn: "3h" }
            )

            res.json({
                token: token,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                user_id: user.user_id
            })
        })
})

// finding the current user via unique email and retrieving their information
router.get('/account', authenticate, (req, res) => {

    knex('users')
        .where({ email: req.user.email })
        .then(user => {
            delete user[0].password,
                res.json(user)
        })
});

//updating the users personal information (first name, last name and/or email)
router.put('/user/update', (req, res) => {
    const { email, firstName, lastName, user_id } = req.body

    knex('users')
        .where({ user_id: user_id })
        .update({ email: email, firstName: firstName, lastName: lastName })
        .then(user => {
            res.status(201).send({ Success: true, Message: "User information updated" })
        })

})


// SUBSCRIPTIONS

//with the data being sent from the client side, we are looking for the user that matches the data, and updating their list of subscriptions

// adding a new subscription
router.post('/subscription/add', (req, res) => {
    const { user_id, subscriptions } = req.body

    knex('users')
        .where({ user_id: user_id })
        .update({ subscriptions: JSON.stringify(subscriptions) })
        .then(user => {
            res.status(201).json({ Success: true, Message: 'Subscription Added' })
        })
})
//deleting an exsisting subscription
router.delete('/subscription/delete', (req, res) => {
    const { subscriptions, user_id } = req.body

    knex('users')
        .where({ user_id: user_id })
        .update({ subscriptions: JSON.stringify(subscriptions) })
        .then(user => {
            res.status(201).json({ Success: true, Message: 'Subscription Deleted' })
        })
})



module.exports = router
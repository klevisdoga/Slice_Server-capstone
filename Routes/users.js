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
                user_id: user.user_id
            })
        })
})

// finding the current user via unique email and retrieving their information
router.get('/account', authenticate, (req, res) => {

    knex('users')
        .where({ email: req.user.email })
        .then(user => {

            // turning the users subcriptions into JS object for function below
            userSubscriptons = JSON.parse(user[0].subscriptions)

            // importing function which creates a current date in YYYY-MM-DD format
            const currentDateFunction = require('../CurrentDateFunction')
            const nextDateFunction = require('../CurrentDateFunction')
            const currentDate = currentDateFunction()

            // function that goes through every subscriptions 'next date' and finds the ones that are past the current date (if upcoming has just passed)
            // then replaces the already existing subscriptions list with the updated dates, and if not past the current date -- the origin dates
            const newDates = userSubscriptons.forEach(item => {

                if ((parseInt(item.nextDate.split('-').join(''))) < currentDate) {

                    const date = new Date(item.nextDate.split('-'))
                    const nextDay = String(date.getDate()).padStart(2, '0')
                    const nextMonth = String(date.getMonth() + 2).padStart(2, '0')
                    const year = String(date.getFullYear())
                    const nextDate = year + '-' + nextMonth + '-' + nextDay

                    item.date = item.nextDate
                    item.nextDate = nextDate

                    // new object containing the updated subscriptions with their new dates 
                    const newObj = {
                        id: item.id,
                        name: item.name,
                        date: item.date,
                        nextDate: item.nextDate,
                        amount: item.amount
                    }

                    // new array containing the orignal subscriptions and replacing any subscription with a past upcoming date, with the new object
                    const newSubsciptionArray = [...userSubscriptons.filter(obj => obj.name !== newObj.name), newObj]

                    // inserting the new subscription array back into the DB
                    knex('users')
                        .where({ email: req.user.email })
                        .update({ subscriptions: JSON.stringify(newSubsciptionArray) })
                        .then(() => {
                            res.status(201)
                        })
                }
            })

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
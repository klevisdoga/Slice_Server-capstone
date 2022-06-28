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
        password: hashedPassword
    }

    // console.log(newUser)
    //Adding the new user to the DB(Database)
    knex('users')
        .insert(newUser)
        .then((user) => {
                res.status(201).send({ success: true, mesasge: "Account Created", userId: newUser.user_id});
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
        // .catch(() => {
        //     res.status(400).send("Password/Email are invalid")
        // })

})


module.exports = router
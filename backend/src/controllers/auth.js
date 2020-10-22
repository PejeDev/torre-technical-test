'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require.main.require('./models');
const User = db.User;

module.exports = {
    register: async (req, res) => {
        try {
            let { email, password, torre_user } = req.body;
            let user = await User.findAll({ where: { email } });

            if (user.length) {
                return res.status(400).json({ email: "Email already exists!" });
            }

            let newUser = { email, password, torre_user };
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(newUser.password, salt);
            newUser.password = hash;
            let response = await User.create(newUser);
            response.password = undefined;
            return res.status(200).json({ data: response });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: `${e}` });
        }
    },

    login: async (req, res) => {
        try {
            let { email, password } = req.body;
            let user = await User.findAll({ where: { email } });

            if (!user.length) {
                errors.email = "User not found!";
                return res.status(404).json(errors);
            }

            let originalPassword = user[0].dataValues.password;
            let isMatch = await bcrypt.compare(password, originalPassword);

            if (isMatch) {
                console.log("matched!");
                const { id } = user[0].dataValues;
                console.log(id);
                const payload = { id, email };

                let token = jwt.sign(payload, __.JWT.SECRET_KEY, { expiresIn: 3600 });
                return res.json({
                    success: true,
                    token: "Bearer " + token
                });
            }

            return res.status(400).json({ error: "Password not correct" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: `${e}` });
        }
    },
};

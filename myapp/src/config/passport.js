const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');

// Serialize user for session storage
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    db.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length > 0) {
                done(null, result.rows[0]);
            } else {
                done(new Error('User not found'), null);
            }
        })
        .catch(err => {
            console.error('Error during deserialization:', err);
            done(err, null);
        });
});

// Local authentication strategy
passport.use(
    new LocalStrategy(
        { usernameField: 'email' }, 
        async (email, password, done) => {
            try {
                const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
                
                if (result.rows.length === 0) {
                    return done(null, false, { message: 'Incorrect email.' });
                }
                
                const user = result.rows[0];
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                
                return done(null, user);
            } catch (err) {
                console.error('Error during authentication:', err);
                return done(err);
            }
        }
    )
);

module.exports = passport;
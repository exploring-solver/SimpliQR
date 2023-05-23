const express = require("express");
const app = express();
const port = 1000;
const User = require("./src/models/user")
require("./src/comm");
const fetchuser = require('./src/middleware/fetchuser');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'wushangcl@n';

// const Message = require("./src/contact")
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//built in middleware
//  // For serving static files
//to set the view engine
app.use('/static', express.static('static'))
app.use('/img', express.static('img'))
app.use('/src', express.static('src'))
app.use('/views', express.static('views'))
// app.use(express.urlencoded())
// app.use(express.static(__dirname+'../static'));

app.set('view engine', 'hbs') // Set the template engine as pug
// Set the views directory



const checkAuth = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
      return res.redirect("/login"); // Redirect to the login page
    }
    try {
      const data = jwt.verify(token, JWT_SECRET);
      req.user = data.user;
      next();
    } catch (error) {
      res.redirect("/login"); // Redirect to the login page
    }
  };
  

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("signup", {
        error: "User already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.render("login", {
      success: "User registered successfully",
    });
  } catch (error) {
    res.render("signup", {
      error: "An error occurred",
    });
  }
});


// Login endpoint
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid password");
        }

        // Store user information in session or generate a token for authentication

        res.status(200).send("Login successful");
    } catch (error) {
        res.status(500).send("An error occurred");
    }
});
// ENDPOINTS


app.get('/', checkAuth, (req, res) => {
    res.render('index');
});

app.get('/header', checkAuth, (req, res) => {
    res.render('header');
});

app.get('/slider', checkAuth, (req, res) => {
    res.render('slider');
});

app.get('/content', checkAuth, (req, res) => {
    res.render('content');
});

app.get('/footer', checkAuth, (req, res) => {
    res.render('footer');
});

app.get('/cart', checkAuth, (req, res) => {
    res.render('cart');
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
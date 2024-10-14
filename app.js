if(process.env.NODE_ENV != "production"){
    require('dotenv').config(); 
}


const express = require("express");
const app= express();  //Create an Express application
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError =require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true
};
// app.get("/",(req,res)=>{
//     res.send("Hi, I am root.");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //A middleware that initializes passport
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
});

// app.get("/demouser", async(req, res)=>{
//     let fakeUser= new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter= require("./routes/user.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(()=>{
    console.log("Connected To Database");
})
.catch(err =>{
    console.log(err);
}); //Here, the main function is called, which returns a promise. If the promise is resolved, it logs "Connected To Database". If the promise is rejected, it catches the error and logs it.

async function main(){
    await mongoose.connect(MONGO_URL);  //Connect to the MongoDB database using Mongoose
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use( (err, req, res, next)=>{
    // res.send('Something went wrong!');
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{ message });
    // res.status(statusCode).send(message);
} )

app.listen(8090, ()=>{
    console.log("App is listening to port 8090.");
});
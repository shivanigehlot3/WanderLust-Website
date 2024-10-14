//This code sets up a Mongoose model for listings, which can be used to interact with listing documents in a MongoDB collection. 
//The schema defines the structure of the documents, specifying required fields, data types, default values, and custom logic for handling field values.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;  //This line creates a shorthand reference to the Schema constructor from Mongoose.
const Review = require("./review.js");

const listingSchema =  new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {

        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});     //This section defines the schema for a listing document. A schema defines the structure of the document and the types of data each field can hold.


listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});   //When a listing is deleted from the database, this middleware hook ensures that all reviews associated with that listing are also deleted. This helps maintain data integrity by removing orphaned reviews that no longer have an associated listing.


const Listing = mongoose.model("Listing", listingSchema);  // creates a model named "Listing"   ,   providing an interface to interact with the database

module.exports = Listing;     //This line exports the Listing model, allowing it to be imported and used in other parts of the application.
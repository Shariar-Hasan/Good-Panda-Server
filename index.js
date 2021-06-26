const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
const port = process.env.PORT || 5000

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7dhy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send('Hello World!')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    // food section 
    const foodsCollection = client.db(process.env.DB_NAME).collection("foods");
    app.post("/addfood", (req, res) => {
        const food = req.body;
        console.log(food);
        foodsCollection.insertOne(food)
            .then(res => res.send(res))

    })

    app.get('/getfood', (req, res) => {
        foodsCollection.find()
            .toArray((err, foods) => {
                res.send(foods)
            })
    })


    //                       admin section
    const adminsCollection = client.db(process.env.DB_NAME).collection("admins");
    app.post("/addadmin", (req, res) => {
        const admin = req.body;
        adminsCollection.insertOne(admin)
    })
    app.get('/getadmin/:email', (req, res) => {
        const email = req.params.email
        adminsCollection.find({ email: email })
            .toArray((err, orders) => {
                res.send(orders.length > 0)
            })
    })




    //                   order section
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
    app.post("/addorder", (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(res => res.send(res))
    })
    app.get('/getorder/:email', (req, res) => {
        adminsCollection.find({ email: req.params.email })
            .toArray((err, orders) => {
                if (orders.length > 0) {
                    ordersCollection.find()
                        .toArray((err, orders) => {
                            res.send(orders)
                        })
                }
                else {
                    ordersCollection.find({ email: req.params.email })
                        .toArray((err, orders) => {
                            res.send(orders)
                        })
                }
            })

    })
    app.patch('/updateStatus/:id', (req, res) => {
        const id = req.params.id;
        ordersCollection.updateOne({ _id: ObjectId(id) }, {
            $set: {
                status : req.body.status
            }
        })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })







        //                  reviews section
        const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
        app.post("/addreview", (req, res) => {
            const review = req.body;
            console.log(review);
            reviewsCollection.insertOne(review)
                .then(res => res.send(res))
        })

        app.get('/getreview', (req, res) => {
            reviewsCollection.find()
                .toArray((err, reviews) => {
                    res.send(reviews)
                })
        })


    });

    app.listen(port)
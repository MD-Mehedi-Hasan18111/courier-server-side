const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());


// Connection MongoDB database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yai2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();

        // database
        const database = client.db(process.env.DB_HOST);

        // database collections
        const serviceCollections = database.collection('services');
        const ordersCollections = database.collection('orders');

        // Get All Services from Database.
        app.get('/services', async(req, res) =>{
            const result = await serviceCollections.find({}).toArray();
            res.send(result);
        })

        // Post a Service to the database.
        app.post('/addService', async(req, res) => {
            const service = req.body;
            const result = await serviceCollections.insertOne(service);
            res.send(result);
            console.log(result);
        })

        // Get Specific Service by Id.
        app.get('/registration/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollections.findOne(query);
            res.send(result);
        })

        // Register Order service
        app.post('/registration', async(req, res) =>{
            const service = req.body;
            const result = await ordersCollections.insertOne(service);
            res.send(result);
        })

        // Get my Orders from orders collections
        app.get('/orders/:email', async(req, res) =>{
            ordersCollections.find({email: req.params.email})
            .toArray((err, results)  =>{
                res.send(results);
            })
        })

        // Get all orders
        app.get('/allOrders', async(req, res) =>{
            const result = await ordersCollections.find({}).toArray();
            res.send(result);
        })

        // Delete orders
        app.delete('/allOrders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollections.deleteOne(query);
            res.send(result);
        })

        // Get order for update
        app.get('/allOrders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollections.findOne(query);
        })

        // Update status
        app.put('/allOrders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await ordersCollections.updateOne(query, updateDoc, options);
            res.send(result);
        })

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send("RedX Server is Running...");
})

app.listen(port, () =>{
    console.log("RedX Server is running on port: ", port);
})
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k95s6zq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // client.connect();

        const toyCollection = client.db('toyMarketDB').collection('toys');

        app.get('/toys', async (req, res) => {
            const result = await toyCollection.find().toArray();
            res.send(result);
        })

        app.get('/toys/:text', async (req, res) => {
            console.log(req.params.text);
            if (req.params.text == 'sports' || req.params.text == 'truck' || req.params.text == 'regular') {
                const result = await toyCollection.find({ subCategory: req.params.text }).limit(3).toArray();
                return res.send(result);
            };
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { name: 1, price: 1, supplier: 1, subCategory: 1, email: 1, quantity: 1, rating: 1, photo: 1, details: 1 }
            };
            const result = await toyCollection.findOne(query, options);
            // console.log(result);
            res.send(result);
        })

        app.get('/myToys', async (req, res) => {
            // console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/toys', async (req, res) => {
            const newToy = req.body;
            // console.log(newToy);
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        })

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    details: updatedToy.details
                }
            }
            const result = await toyCollection.updateOne(filter, toy, options);
            res.send(result);
        })

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy Marketplace is running');
})

app.listen(port, () => {
    console.log(`Toy Marketplace server is running port ${port}`)
})
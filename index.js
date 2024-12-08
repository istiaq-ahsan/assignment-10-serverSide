const express = require('express');
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1pvay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const cfProjectCollection = client.db("cfProjectDB").collection("project");
        const userCollection = client.db("cfUserDB").collection("users");
        const cfDonatedCollection = client.db("cfDonatedDB").collection("donations");


        app.get('/project', async (req, res) => {
            const cursor = cfProjectCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/project', async (req, res) => {
            const newProjectInfo = req.body;
            const result = await cfProjectCollection.insertOne(newProjectInfo);
            res.send(result);
        })

        app.get('/project/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cfProjectCollection.findOne(query);
            res.send(result);
        })

        app.post('/project/:id', async (req, res) => {
            const newProjectInfo = req.body;
            const result = await cfProjectCollection.insertOne(newProjectInfo);
            res.send(result);
        })

        //update
        app.put('/project/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: req.body
            };

            const result = await cfProjectCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        //delete
        app.delete('/project/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cfProjectCollection.deleteOne(query);
            res.send(result);
        })


        //my campaign part
        app.get('/project/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await cfProjectCollection.find(query).toArray();
            res.send(result);
        });

        //my Donation part 
        app.get('/donations', async (req, res) => {
            const cursor = cfDonatedCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.post('/donations', async (req, res) => {
            const newDonatedProjectInfo = req.body;
            const result = await cfDonatedCollection.insertOne(newDonatedProjectInfo);
            res.send(result);
        })





        //user part
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser)
            res.send(result);
        })

        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Crowdcube server');
})

app.listen(port, () => {
    console.log(`Simple CRUD is running on port ${port}`);
})
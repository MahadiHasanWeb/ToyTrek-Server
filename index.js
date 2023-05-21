const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qwzfeis.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const ToysCollection = client.db('ToyTrek').collection('Toys')


    // Next 3 line Comment For Vercel Deploy Problem

    // const indexKeys = { ToyName: 1 };
    // const indexOptions = { name: "toyName" }
    // const CreateNewIndex = await ToysCollection.createIndex(indexKeys, indexOptions);



    app.post('/allToys', async (req, res) => {
      const AllToys = req.body;
      // console.log(AllToys);
      const result = await ToysCollection.insertOne(AllToys);
      res.send(result);
    })

    // Get All Toys
    app.get('/allToys', async (req, res) => {
      const Cursor = ToysCollection.find();
      const result = await Cursor.toArray();
      // console.log(result)
      res.send(result);
    })

    // Get Single Toy
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const user = await ToysCollection.findOne(query)
      res.send(user)
    })

    // Get My Toys
    app.get('/myToys/:email', async (req, res) => {
      // console.log(req.params.email)
      const Toys = await ToysCollection.find({ SellerEmail: req.params.email }).toArray();
      res.send(Toys)
    })

    // Get Toy Name Search
    app.get('/toySearch/:text', async (req, res) => {
      const searchText = req.params.text;
      // console.log(searchText)
      const result = await ToysCollection.find({
        $or: [
          { ToyName: { $regex: searchText, $options: "i" } }
        ]
      })
        .toArray();
      res.send(result)
    })

    // Update Single Data
    app.put('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      console.log(updatedToy)
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true }
      const ToyUpdated = {
        $set: {
          ToyName: updatedToy.ToyName,
          quantity: updatedToy.quantity,
          ToyPicture: updatedToy.ToyPicture,
          details: updatedToy.details,
          Price: updatedToy.Price,
          rating: updatedToy.rating,
          subCategory: updatedToy.subCategory
        }
      }
      const result = await ToysCollection.updateOne(filter, ToyUpdated, option);
      res.send(result);
    })

    // Delete Single Data
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      console.log('Plz Delete kar do muje', id)
      const query = { _id: new ObjectId(id) }
      const user = await ToysCollection.deleteOne(query)
      res.send(user)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Toys World Running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
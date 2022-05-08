const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

// midddleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t8joe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("wareHouse")
      .collection("inventories");
    //    get all the data in api
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
      //   get a single data
      app.get("/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const inventory = await inventoryCollection.findOne(query);
        res.send(inventory);
      });

      //   Post added data

      app.post("/inventory", async (req, res) => {
        const newInventory = req.body;
        const result = await inventoryCollection.insertOne(newInventory);
        res.send(result);
      });

      //   Update the quantity
      app.put("/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;

        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            quantity: updatedUser.quantity,
          },
        };
        const result = await inventoryCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });

      //   Delete Inventory
      app.delete("/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await inventoryCollection.deleteOne(query);
        res.send(result);
      });

      //  GetMYItems
      app.get("/myitem", async (req, res) => {
        const email = req.query;
        const query = { email: email };
        const cursor = inventoryCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("It is running");
});

app.listen(port, () => {
  console.log("port is", port);
});

const express = require("express");
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

// midddleware
app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!auth) {
    return res.status(401).send({ message: "unaothorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403), send({ message: "forbodden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
  });
  console.log("inside verifyJWT", authHeader);
  next();
}

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

    //   AUTH
    app.get("/login", async (req, res) => {
      const user = req.body;

      console.log(user);
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send(accessToken);
    });

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
      //  GetMYItems
      app.get("/myitems", verifyJWT, async (req, res) => {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        const decodedEmail = req.query.email;
        const email = req.query.email;

        if (email == decodedEmail) {
          const query = { email: email };

          const cursor = inventoryCollection.find(query);
          const items = await cursor.toArray();
          res.send(items);
        } else {
          res.status(403).send({ message: "forbidden access" });
        }
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
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("It is running");
});

app.listen(port, () => {
  console.log("port", port);
});

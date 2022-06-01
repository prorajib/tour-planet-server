const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
//const { application } = require('express');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

//Database Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpx5h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('tourMaster');
    const destinationCollection = database.collection('destinations');
    const bookingCollection = database.collection('placeOrder');

    // showing all bookings using get api
    app.get('/allbookings', async (req, res) => {
      const cursor = destinationCollection.find({});
      const destinations = await cursor.toArray();
      res.send(destinations);
    });

    // showing single booking using get api
    app.get('/allbookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const singleBookingInfo = await destinationCollection.findOne(query);
      res.send(singleBookingInfo);
    });
    // insert new destination using POST api
    app.post('/allbookings', async (req, res) => {
      const destination = req.body;
      const result = await destinationCollection.insertOne(destination);
      res.json(result);
    });

    // insert new booking confirmation using POST api
    app.post('/placebooking', async (req, res) => {
      const bookingInfo = req.body;
      const result = await bookingCollection.insertOne(bookingInfo);
      //console.log('a document was inserted by id', result);
      res.json(result);
    });

    // show all confirmed booking
    app.get('/mybooking/:email', async (req, res) => {
      const email = req.params.email;

      const mybookings = await bookingCollection.find({ email }).toArray();

      res.send(mybookings);
    });

    // Delete single booked information
    app.delete('/mybooking/:id', async (req, res) => {
      const bookingId = req.params.id;
      const query = { _id: ObjectId(bookingId) };
      const deleteBooking = await bookingCollection.deleteOne(query);
      res.json(deleteBooking);
    });

    // update api for status
    app.put('/mybooking/:id', async (req, res) => {
      const updateId = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(updateId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const updatedBooking = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(updatedBooking);
    });

    app.get('/manageallorders', async (req, res) => {
      const cursor = bookingCollection.find({});
      const manageBookings = await cursor.toArray();
      res.send(manageBookings);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Tour planet Server is running');
});

app.listen(port, () => {
  console.log('listening port', port);
});

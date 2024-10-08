const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const PORT = process.env.PORT || 5000;
// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.unjawmb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri)
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
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const serviceCollection = client.db('RepairDb').collection('services')
    const bookedServicesCollection =client.db('RepairDb').collection('Booked')

    app.get('/services', async (req, res) => {
      const result = await serviceCollection.find().toArray()
      res.send(result)
    })
    app.post('/services',async(req,res)=>{
      const services =req.body
      // console.log(services)
      const result =await serviceCollection.insertOne(services)
      res.send(result) 
    })
app.get("/services/:id",async(req,res)=>{
   const id = req.params.id
   const query={_id:new ObjectId(id)}
   const result = await serviceCollection.findOne(query)
   res.send(result)
   
})
app.post("/purchaseServices",async(req,res)=>{
  const purchase_services =req.body;
  // console.log(purchase_services)
  const result =await bookedServicesCollection.insertOne(purchase_services)
  res.send(result)

})

app.get("/myService",async(req,res)=>{
  //  const userEmail =req.query?.email
  //  console.log(userEmail)
 if(req.query?.email){
   query ={email:req.query.email}
 }
  //  const query ={email:userEmail}
   const result =await serviceCollection.find(query).toArray()
   res.send(result)
  
})
app.put("/services/:id",async(req,res)=>{
  const id =req.params.id
  const upDoc = req.body
  const {service_image,
    service_name,
    service_price,
    service_area,
    service_description,
    service_provider_image,
    service_provider_name,email}=upDoc
  const updatedDoc ={
    $set:{service_image:service_image,
      service_name:service_name,
      service_price:service_price,
      service_area:service_area,
      service_description:service_description,
      service_provider_image:service_provider_image,
      service_provider_name: service_provider_name,
      email:email
    }
  }
  const filter ={_id:new ObjectId(id)}
  const options = { upsert: true }
  const result =await serviceCollection.updateOne(filter,updatedDoc,options)
  res.send(result)
})

app.delete('/services/:id',async(req,res)=>{
 const id =req.params.id;
 const query ={_id:new ObjectId(id)}
 const result =await serviceCollection.deleteOne(query) 
  res.send(result)
})
app.get('/booked',async(req,res)=>{
  // console.log(req.query.email)
  if(req.query?.email){
     query = {currentUserEmail:req.query.email}
  }
  const result =await bookedServicesCollection.find(query).toArray()
  // console.log(result)
  res.send(result)
})

app.get('/servicestodo',async(req,res)=>{
 
  if(req.query?.email){
    query ={provider_email:req.query.email}
  }
  const result =await bookedServicesCollection.find(query).toArray()
  res.send(result)
})
app.patch('/servicestodo/:id',async(req,res)=>{
  const upStatus =req.query.status
  console.log(upStatus,"yes")

  const id =req.params.id
  // // console.log(upStatus)
  //  console.log(req.params)
   const filter ={_id:new ObjectId(id)}
   const options ={ upsert: true }
   const upDoc ={
    
    $set:{
      service_status:upStatus
    }
   }
   const result =await bookedServicesCollection.updateOne(filter,upDoc,options)
   res.send(result)
})
app.get('/popularServices',async(req,res)=>{
 
  const result =await serviceCollection.find().limit(4).toArray()
  // console.log(result)
  res.send(result)
})

    
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Electronic item is running')
})
app.listen(PORT, () => {
  console.log(`server is running on port${PORT}`)
})
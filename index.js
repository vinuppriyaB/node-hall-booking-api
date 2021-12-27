import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import assert from "assert"


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
// mongodb+srv://vinuppriya:<password>@cluster0.xu3bs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
app.use(express.json());
app.use(cors());

export async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongodb connected");
    
    return client;
  }
  
  export const client = await createConnection();

 
app.get("/", (request, response) => {
   response.send("hai")
});
app.get("/hallbooking/customerlist", async(request, response) => {
  console.log("customername  "+"roomname     "+ "date        "+"starttime  "+"endtime  ")
  const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .find({}).toArray((err,data)=>{
          data.forEach(res=>{
            if(res.bookingstatus.length>0)
            {
            res.bookingstatus.forEach(status=>{
              console.log(status.customername+"          "+res.roomname +"    "+ 
              status.date+"      "
              +status.startTime+"      "+status.endTime)
              })
            }
           
           })
        });
        
  response.send(result)
});


app.get("/hallbooking/roomlist", async(request, response) => {
  console.log("roomname   "+"booking status"+ "customername   "+"date        "+"starttime  "+"endtime  ")
  const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .find({}).toArray((err,data)=>{
          data.forEach(res=>{
            if(res.bookingstatus.length>0)
            {
              res.bookingstatus.forEach(status=>{
             
                console.log(res.roomname +"      "+ 
                "booked"+"            "+status.customername+"         "+
                status.date+"      "
                +status.startTime+"      "+status.endTime)
                })

            }
            else {
              console.log(res.roomname +"      "+ "none"+"              "+
              "none"+"           "
              +"none"+"        "+"none"+"    "+"none")

            }
           
           
           })
        });
        
  response.send(result);
});
app.get("/hallbooking/createroom", async(request, response) => {

  const data={
    "roomname":"hall6",
    "seats":"150",
    "ac":"available",
    "restroom":"5",
    "price":"3000",
    "bookingstatus":[]
    
}
    // const {roomname}=request.body;
    const roomavail= await client
              .db("B27rwd")
              .collection("hallbooking")
              .findOne({roomname:data.roomname});
    console.log(roomavail) 
   if(roomavail==null)
   {
    const result = await client
    .db("B27rwd")
    .collection("hallbooking")
    .insertMany([data]);
    
    response.send(result);

   }
   else{
    response.send({message:"room already avail"});
   }           
    
 });
 app.get("/hallbooking/bookingroom", async(request, response) => {
    const data={
      "roomname":"hall5",
     "customername":"john",
     "date":"2022-01-29",
     "starttime":7,
     "endtime":10
      
  }
    // const {roomname,customername,date,starttime,endtime} =request.body;

    
let isbooked=null;
    const agg = [
        {
          '$match': {
            'roomname': data.roomname,
          }
        }, {
          '$unwind': {
            'path': '$bookingstatus'
          }
        }, {
          '$match': {
            'bookingstatus.date': data.date,
          }
        },{
          '$match': {
            "$or":[{"$and":[{'bookingstatus.startTime': {
              '$gte': data.endtime,
            }},{
              'bookingstatus.endTime': {
                '$lte':data.starttime,
              }
            }]},{"$and":[{'bookingstatus.startTime': {
              '$gte': data.starttime,
            }},{
              'bookingstatus.endTime': {
                '$lte':data.endtime,
              }
            }]},{"$and":[{'bookingstatus.startTime': {
              '$lte': data.endtime,
            }},{
              'bookingstatus.endTime': {
                '$gte':data.starttime,
              }
            }]}
            
          
          ]}
        }
        
      ];
      const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .aggregate(agg);

        await result.forEach(res=>{
          isbooked=res;
        })
            
     

if(isbooked==null)
{
  const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .updateOne({roomname:data.roomname },
            { $push: { bookingstatus:{customername:data.customername,date:data.date,startTime:data.starttime,endTime:data.endtime}} });
        response.send(result);

}
else{
  response.send("not avail");
}
    
   
 });
 

app.listen(PORT, () => console.log("the server is started in", PORT));


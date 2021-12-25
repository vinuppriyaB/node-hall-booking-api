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
              status.startTime.getDate()+"-"+status.startTime.getMonth()+1+"-"+status.startTime.getFullYear()+"      "
              +status.startTime.getHours()+"      "+status.endTime.getHours())
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
                status.startTime.getDate()+"-"+status.startTime.getMonth()+1+"-"+status.startTime.getFullYear()+"      "
                +status.startTime.getHours()+"      "+status.endTime.getHours())
                })

            }
            else {
              console.log(res.roomname +"      "+ "none"+"              "+
              "none"+"           "
              +"none"+"        "+"none"+"    "+"none")

            }
           
           
           })
        });
        
  response.send(rresult)
});
app.post("/hallbooking/createroom", async(request, response) => {
    
    
    const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .insertMany([request.body]);
        
    response.send(result)
 });
 app.post("/hallbooking/bookingroom", async(request, response) => {
    
    const {roomname,customername,date,starttime,endtime} =request.body;

    const startTime=new Date(date+"T"+starttime+":00:00");
    const endTime=new Date(date+"T"+endtime+":00:00");
    console.log(startTime,endTime);
console.log(new Date);
let data=null;
    const agg = [
        {
          '$match': {
            'roomname': roomname
          }
        }, {
          '$unwind': {
            'path': '$bookingstatus'
          }
        }, {
          '$match': {
            "$or":[{
            'bookingstatus.startTime': {
              '$lte': new Date(date+"T"+endtime+":00:00")
            }
          },
          {
            'bookingstatus.endTime': {
              '$gte': new Date(date+"T"+starttime+":00:00")
            }
          }
          ]}
        }
        
      ];
      const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .aggregate(agg);

        await result.forEach(res=>{
         data=res;
        })
        console.log(data);    
     

if(data==null)
{
  const result = await client
        .db("B27rwd")
        .collection("hallbooking")
        .updateOne({roomname:roomname, },
            { $push: { bookingstatus:{customername:customername,startTime:startTime,endTime:endTime}} });
        response.send(result);

}
else{
  response.send("not avail");
}
    
   
 });
 app.post("/hallbooking/check", async(request, response) => {
   const date=new Date();
   console.log(date);
   console.log(date.toUTCString());
  const result = await client
      .db("B27rwd")
      .collection("hallbooking")
      .insertOne({date:new Date()})
        response.send(result);

 });

app.listen(PORT, () => console.log("the server is started in", PORT));


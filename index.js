const express=require("express");
const cors=require("cors");
const bcrypt=require("bcrypt");
const app=express();
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.get("/",(req,res)=>{
    console.log(req);
    res.status(200).json({
        message: "Welcome to the server!"
    });
});
app.post("/register",(req,res)=>{
    //console.log(req.body);
    const {Email, Password} = req.body;
    console.log(`Email: ${Email}, Password: ${Password}`);
    res.status(200).json({message:"User registered"});
})

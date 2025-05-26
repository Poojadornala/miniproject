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
app.post("/register",async(req,res)=>{
    //console.log(req.body);
    const {Email, Password} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(Password, 10);
        console.log('user data',
            {Email, Password: hashedPassword});
        res.status(200).send({
            message: "User registered successfully",})
        }catch(error){
            console.error("Error hashing password:", error);
            res.status(500).send({
                message: "Error registering user"
            });
        }
    });
app.post("/login",async(req,res)=>{
    console.log("user logged in",req.body)
    const {email, password} = req.body;
    let hashedPassword = "Sample"; 
    let response=await bcrypt.compare(password, "hashedPassword");
    console.log("is same?",response);
    res.send(200).send('matched');

})
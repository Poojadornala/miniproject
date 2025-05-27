const express=require("express");
const cors=require("cors");
const bcrypt=require("bcrypt");
const mysql=require("mysql2");
const app=express();
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json());
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Pooja@123",    
    database:"krishnatemples"
});
connection.connect((err)=>{
    if(err){
        console.error("Error connecting to the database:", err);
    }else{
        console.log("Connected to the database");
    }
});
app.get("/",async (req,res)=>{
    console.log(req);
    res.status(200).json({
        message: "Welcome to the server!"
    });
});
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    console.log(res.status);
    if(!email||!password){
        return res.status(400).json({ message: "Email and Password are required" });
    }
    if (password.length < 6){
        return res.status(403).json({ message: "Password must be at least 6 characters long" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        connection.query(
            `INSERT INTO Users (EmailId, HashedPassword) VALUES (?, ?)`, 
            [email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ message: "Error registering user" });
                }
            
                res.status(200).json({ message: "User registered successfully" });
            }
        );
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});

app.post("/login", async (req, res) => {
    console.log("User logged in:", req.body);
    const { email, password } = req.body;

    connection.query(
        `SELECT HashedPassword FROM Users WHERE EmailId = ?`,
        [email],
        async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (!result.length) {
                return res.status(401).json({ message: "User not found" });
            }
            if(!email || !password){
                return res.status(400).json({ message: "Email and Password are required" });
            }

            const hashedPassword = result[0].HashedPassword;
            console.log("Hashed Password from DB:", hashedPassword);

            const isMatch = await bcrypt.compare(password, hashedPassword); 
            console.log("Password match status:", isMatch);

            if (isMatch) {
                console.log("Password matched");
                return res.status(200).json({ message: "Login successful" });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        }
    );
});

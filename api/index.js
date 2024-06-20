import express from "express" ; 
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from 'cors';




dotenv.config();
const app = express() ; 
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

const users = [
    {
        id: "1",
        username: "ashwin",
        password: "ash04",
        isAdmin: true,
    },
    {
        id: "2",
        username: "harsh",
        password: "ash04",
        isAdmin: false,
    },
]

let refreshTokens = [];

app.post("/api/refresh",(req,res)=>{
    // takes the refresh token from the user
    const refresh_token = req.body.token;

    if(!refresh_token){
       return res.status(401).json("You are not Authenticated")
    }
    if(!refreshTokens.includes(refresh_token)){
        return res.status(401).json("Refresh token is not valid")
    }
    
    jwt.verify(refresh_token,"refreshsecretKey",(err,user)=>{
        if(err) console.log(err);
        refreshTokens = refreshTokens.filter (token => token !== refresh_token) 

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.push(newRefreshToken);

        res.status(200).json(
            {
                accessToken : newAccessToken,
                refresh_token : newRefreshToken,

            }
        )
    })

})

const verify = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token,"secretKey",(err,payload) =>{
            if(err){
                return res.status(403).json("The Token is not valid ")
            }

            req.user = payload ; // attach it to req so that in can be used out of the scope everywhere in any middleware
            // console.log(payload);
            next();
        })
    }else{
        res.status(400).json("You are not authenticated")
    }

}   

app.delete("/api/users/:userId",verify ,(req,res) => {
    if (req.user.id === req.params.userId || req.user.isAdmin ) {
        res.status(200).json("User has been deleted ");
    } else {
        res.status(403).json("You are not allowed to delete this account since you are not an admin")
    }
})

const generateAccessToken = (user) => {
    return jwt.sign({id : user.id , isAdmin: user.isAdmin},"secretKey",{expiresIn : "5s"});
}
const generateRefreshToken = (user) => {
    return jwt.sign({id : user.id , isAdmin: user.isAdmin},"refreshsecretKey");
}

app.post('/api/login',(req,res)=>{
    const {username,password} = req.body;
    const user = users.find (u => {
        return u.username===username && u.password===password;
    })

    if(user) {
        //generate access token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.json({
            username : user.username,
            isAdmin:user.isAdmin,
            accessToken,
            refreshToken,
            id:user.id,
        })
    }else{
        res.status(400).json("Username or password is incorrect")
    } 

})

app.post("/api/logout",verify,(req,res)=>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter (  (token ) => token!== refreshToken);
    res.status(200).json("You logged out successfully");
})

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`)
})
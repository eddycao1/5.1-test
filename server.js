const mongoose = require('mongoose')
const express = require("express")
const https = require("https")
const bodyParser=require("body-parser")
const validator = require("validator")
const bcrypt = require('bcryptjs')
mongoose.connect("mongodb://localhost:27017/taskDB", { useNewUrlParser: true })
const PORT = process.env.PORT || 8080
const ip = "127.0.0.1";

const userSchema = new mongoose.Schema({
    Country: {
        type: String,
        require: true,
        minlength: [1,"country is required"]

    },
    FirstName: {
        type: String,
        require: true,
        minlength: [1,"first name is required"]

    },
    LastName: {
        type: String,
        require: true,
        min: [1,"last name is required"]
    },
    Email: {
        type: String,
        require: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("The format of the Email is incorrect")
            }
        }
    },
    Password: {
        type: String,
        require: true,
        minlength:8
    },
    RePassword: {
        type: String,
        require: true,
        minlength: 8,
        validate(value){
            if(!validator.equals(value, this.Password)){
                throw new Error("The comfirm password should be same with passward")
            }
        }
    },
    AddressOne: {
        type: String,
        require: true,
        minlength: [1,"road name is required"]
    },
    AddressTwo: {
        type: String,
        require: true,
        minlength: [1,"street name is required"]
    },
    City: {
        type: String,
        require: true,
        minlength: [1,"city name is required"]
    },
    State: {
        type: String,
        require: true,
        minlength: [1,"state name is required"]
    },
    Zip: {
        type: String,
        require: false
    },
    MobileNum: {
        type: Number,
        require: false
    }
})

const data = mongoose.model('data', userSchema)

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/registration.html")
})

app.post('/',(req,res)=>{
        const Country= req.body.country
        const FirstName= req.body.firstName
        const LastName= req.body.lastName
        const Email= req.body.email
        const Password= req.body.password
        const RePassword= req.body.rePassword
        const AddressOne= req.body.addressOne
        const AddressTwo= req.body.addressTwo
        const City= req.body.city
        const State= req.body.state
        const Zip= req.body.zip
        const MobileNum= req.body.phone

        const saltRounds = 10
        bcrypt.genSalt(saltRounds, function (err, salt){
            bcrypt.hash(Password, salt, function(err, hash){
                    Password == hash;
            })      
        })

        
        const accountdata = new data({
            Country: Country,
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Password: Password,
            RePassword: RePassword,
            AddressOne: AddressOne,
            AddressTwo: AddressTwo,
            City: City,
            State: State,
            Zip: Zip,
            MobileNum: MobileNum
        })

        accountdata.save((err) =>{
            if(err){
               console.log(err)
            }
            else{
                console.log(" New account for new user is added!!!")
            }
        })
        const ApiData = {
            members:[{
                email_address: Email,
                status: "subscribed",
                merge_fields:{
                    FNAME:FirstName,
                    LNAME:LastName
                }
            }]
        }

        jsonData = JSON.stringify(ApiData)

        const url = "https://us5.api.mailchimp.com/3.0/lists/4c18d9549a"
        const options={
            method:"POST",
            auth:"azi:7d245a7c3c3e869cda03c035a4d19ce1"
        }

        const request = https.request(url,options,(response) =>{
            response.on("apidata",(ApiData)=>{
                Console.log(JSON.parse(ApiData))
            })
        })

        request.write(jsonData)
        request.end()
        console.log(Email)
})

app.listen(process.env.PORT);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

 app.listen(8080, (req,res)=>{
     console.log(`server is running at http://${ip}:${PORT}`);
     
})


app.get('/login.html', (req,res)=>{
    res.sendFile(__dirname + "/login.html")
})

app.post('/login.html', (req,res)=>{
    const email = req.body.email
    const password = req.body.password

    data.findOne({Email: email}, function(error, foundUser){
        if(!error){
            if(foundUser){
                if(foundUser.Password == password){
                    res.sendFile(__dirname + "/custtask.html")
                }
            }
            else{
                res.sendFile(__dirname + "/404.html")
            }
        }
    })
})



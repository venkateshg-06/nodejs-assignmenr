
const express = require("express");
const User = require("./models/userSchema")
const Todo = require("./models/todoSchema")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express();
app.use(express.json())

async function intializeTheServerAndDatabase() {
    try{
        await mongoose.connect("mongodb+srv://venkateshgolla134:Venki06@cluster0.yt6xvgt.mongodb.net/TodolistProject?retryWrites=true&w=majority").then(() =>{
            console.log("connected successfully to mongodb")
        }).catch((e) => {
            console.log(e)
        })
        await app.listen(3000, () => {
            console.log("server connected to http://localhost:3000")
        })
    }catch(e){
        console.log(e)
    }
}


intializeTheServerAndDatabase()

//register APi 

app.post("/api/register/", async (req, res)=> {
    const {username, password} = req.body
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userDetails = await User.findOne({ username });

    if (!userDetails) {
        const user = new User({
            username,
            password: hashedPassword,
          });
      
          await user.save().then(() => {
            res.status(200).json("user created successfully")
          }).catch((e) => {
            res.send(e)
          })
    }else {
        res.status(400);
        res.send("user already exists")
    }


})

//login api 

app.post("/api/login/", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
    
        if (!user) {
            res.status(400);
            res.send("Invalid Username");
        }else {
            const isValidPassword = await bcrypt.compare(password, user.password);
    
            if (!isValidPassword) {
                res.status(400);
                res.send("Invalid Password");
            } else {
                const payload = {username}
                const jwtToken = await jwt.sign(payload, "Venkatesh")
                res.send({jwtToken})
            }

        }

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }

})

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    const tokenCode = token.split(" ")[1];
    if (tokenCode === undefined){
        res.status.json("unAuthorized")
    }
    else {
        jwt.verify(tokenCode, "Venkatesh", async (error, payload) => {
            if (error) {
              res.status(401);
              res.send("Invalid JWT Token");
            } else {
                const username = payload.username;
                const { _id} = await User.findOne({username})
                req._id = _id
              next();
            }
          });
    }
    
  };


app.post('/api/todos',authMiddleware,  async (req, res) => {
    try {
      const { title, description } = req.body;
      const _id = req._id
      const todo = new Todo({
        title,
        description,
        user_id: _id,
      });
      await todo.save();
  
      res.json({ message: 'Todo created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // get api for todos 

 app.get("/api/todos", authMiddleware , async (req, res) => {
    try{
        const _id = req._id 
        const totalTodos = await Todo.find({user_id:_id})
        res.status(200)
        res.send(totalTodos)


    }catch(err){
        res.status(400)
        res.send(err)
    }
 })

 //delete api for todos 

 app.delete("/api/todos/:todoId", authMiddleware, async (req, res) => {
    try {
        const {todoId} = req.params
        const user = req._id
        const details = await Todo.findByIdAndDelete({_id: todoId})
        res.send("deleted successfully")
    }catch (err){
        res.status(400)
        res.send(err)
    }
      
 })

 // api to update the todo 

 app.put("/api/todos/:todoId", authMiddleware, async (req, res) => {
    try {
        const {todoId} = req.params
        const _id = req._id
        const {title, description} = req.body 
        const updatedTodo = {title, description, user_id:_id }
        await Todo.findByIdAndUpdate({_id:todoId}, updatedTodo)
        res.send("Todo updated successfully")
    }catch (err){
        res.status(400)
        res.send(err)
    }
      
 })
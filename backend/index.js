import express from 'express'
import dotenv from 'dotenv'
import connectDB from './src/lib/db.js'
import userRoute from './src/routes/user.routes.js'

dotenv.config()
const app = express()
app.use(express.json())
app.use(`/api/user`, userRoute)

const port = process.env.PORT



app.listen(port, ()=>{
    connectDB();
    console.log(`Server is running on ${port}`)
})
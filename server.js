const express= require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const cors = require('cors')

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())


// Routes
app.use('/api/employee', require('./routes/employeeRoutes'))
app.use('/api/leaves',require('./routes/leaveRoutes'))
app.use('/api/attendance',require('./routes/attendanceRoutes'))

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))
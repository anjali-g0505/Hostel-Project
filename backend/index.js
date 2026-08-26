const express = require('express');
const app = express();
// Trust the reverse proxy (nginx locally, load balancer/CDN on AWS) so req.ip reflects
// the original client's address (via X-Forwarded-For) instead of the proxy hop - used
// by the OTP rate limiter's per-IP fallback key.
app.set('trust proxy', true);
const http = require('http');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const cors = require('cors');
const { initSocket } = require('./socket/socketServer.js');
const AuthRouter = require('./routes/AuthRouter.js');
//Role-based Routers
const StudentRouter=require('./routes/StudentRouter.js');
const MessRouter=require('./routes/MessRouter.js');
const WardenRouter=require('./routes/WardenRouter.js');
//Resource-based Routers
const AnnouncementRouter=require('./routes/AnnouncementRouter.js');
const MenuRouter=require('./routes/MenuRouter.js');
const OrderRouter=require('./routes/OrderRouter.js');
const PaymentRouter=require('./routes/PaymentRouter.js')

require('dotenv').config(); //to load the env variables
require('./models/db.js');

const PORT=process.env.PORT || 8080; //load the PORT from env or use hard-coded port

// const instance=new Razorpay({
//     key_id:process.env.RAZORPAY_API_KEY,
//     key_secret:process.env.RAZORPAY_API_SECRET
// })

app.get('/ping', (req,res) => {
    res.send('PONG');
})
app.use(express.json()); 

// Required for Razorpay callback_url
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors());//will take requests from any ports
app.use('/api/auth', AuthRouter);
app.use('/api/student', StudentRouter);
app.use('/api/mess', MessRouter);
app.use('/api/warden', WardenRouter);
app.use('/api', AnnouncementRouter);
app.use('/api', MenuRouter);
app.use('/api', OrderRouter);
app.use('/api', PaymentRouter);


const server = http.createServer(app);
initSocket(server);

server.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})

// module.exports = instance;
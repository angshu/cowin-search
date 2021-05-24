// Imports needed modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const Cowin = require('./utils/cowin')
const { createHash,} = require('crypto')

// Loads env variables
require('dotenv').config()

// Creates app
const app = express();

// Adds json parsing middleware
app.use(express.json());

// Initializes application port
const port = process.env.PORT || 3000;

// Define paths for Express config
const viewsPath = path.join(__dirname,'./templates/views');
const partialsPath = path.join(__dirname, './templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Setup static directory to serve
app.use(express.static(path.join(__dirname, '../public')));

// Creates base URL route "/" and renders index view
app.get('', (req,res) => {
    res.render('index', {
        title: 'COWIN SEARCH',
    })
})

app.get('/states', async (req,res) => {
    const result = await Cowin.getStates()
    try {
        return res.json({
            result: result.data, 
            message: "Fetched states"
        })
    } catch(e) {
        console.log(e)
        return res.status(500).json({
            error: "error getting state list"
        })
    }
})

app.get('/districts/:stateId', async (req,res) => {
    const stateId = req.params.stateId;
    const result = await Cowin.getDistricts(stateId)
    try {
        return res.json({
            result: result.data, 
            message: "Fetched District list"
        })
    } catch(e) {
        console.log(e)
        return res.status(500).json({
            error: "error getting district list"
        })
    }
})


app.post('/searchForCenters', async (req, res) => {
    const { 
        districtId,
        appDate,
        ageGroup,
        pincode, 
        searchBy,
        token
    } = req.body

    if (!searchBy || !appDate) {
        return res.status(404).send({
            error: "Please provide Date"
        })
    }

    if (searchBy === 'district' && !districtId) {
        return res.status(404).send({
            error: "Please provide district id"
        })
    } 

    if (searchBy === 'pincode' && !pincode) {
        return res.status(404).send({
            error: "Please provide pincode"
        })
    } 

    try {
        console.log("token => ", token)
        const schedules = searchBy === 'pincode' ? await Cowin.getByPincode(pincode, appDate, token) : await Cowin.getByDistrict(districtId, appDate, token)
        const centers = schedules.data.centers
        console.log("unfiltered count:" + centers.length)
        const ageLimit = ageGroup || 0;
        const filterAgeGroup = parseInt(ageLimit)
        const availableCenters = centers.filter(function(c)  {
            if (c.sessions.length === 0)  {
               return false;
            }
            return c.sessions.find(function(session) {
                if (filterAgeGroup > 0) {
                    return session.available_capacity > 0 && session.min_age_limit === filterAgeGroup && session.available_capacity_dose1 > 0;  
                } else {
                    return session.available_capacity > 0;
                }
            });
        })
        console.log("filtered count:" + availableCenters.length)
        return res.json({
            centers: availableCenters,
            message: "COWIN API call succeeded"
        })

    } catch(e) {
        console.log(e)
        var statusCode = e.response.status || "unknown";
        return res.status(500).json({
            error: "Something went wrong. Http Status: " + statusCode
        })
    }
})


app.post('/generateOTP', async (req, res) => {
    const { mobileNumber } = req.body

    if (!mobileNumber) {
        return res.status(404).send({
            error: "Please provide Mobile Number"
        })
    }

    const result = await Cowin.generateOTP(mobileNumber)
    try {
        return res.json({
            txnId: result.data.txnId, //"TXN1", //result.data.txnId,
            message: "COWIN API call succeeded"
        })

    } catch(e) {
        console.log(e)
        return res.status(500).json({
            error: "error generating otp"
        })
    }
})

app.post('/confirmOTP', async (req, res) => {
    const { otptxnId, otpValue } = req.body
    
    if (!otptxnId || !otpValue) {
        return res.status(404).send({
            error: "Please provide OTP"
        })
    }
    const otphash = createHash('sha256').update(otpValue).digest('hex')
    const result = await Cowin.confirmOTP(otphash, otptxnId)
    try {
        return res.json({
            token: result.data.token,//otphash, //result.data.token,
            message: "COWIN API call succeeded"
        })

    } catch(e) {
        console.log(e)
        return res.status(500).json({
            error: "error confirming otp"
        })
    }
})  

// Catch all route, renders 404 page
app.get('*', (req, res) => {
    res.render('404',
        {
            search: 'page'
        }
    )
})

// Directs app to listen on port specified previously
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
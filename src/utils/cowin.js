const axios = require("axios");

const APP_BASE_URL = `https://cdn-api.co-vin.in/api/v2`

module.exports = {
    getByDistrict: (districtId, apptDate, authToken) => {
        const headers = authToken ? {
            "content-type":"application/x-www-form-urlencoded",
            "Authorization":"Bearer " + authToken,
        } : {
            "content-type":"application/x-www-form-urlencoded"
        };

        return axios({
            method:"GET",
            url : APP_BASE_URL + `/appointment/sessions/calendarByDistrict`,
            headers: headers,
            params: {
                district_id:districtId,
                date:apptDate
            }
        });
    },
    getByPincode: (pincode, apptDate, authToken) => {
        const headers = authToken ? {
            "content-type":"application/x-www-form-urlencoded",
            "Authorization":"Bearer " + authToken,
        } : {
            "content-type":"application/x-www-form-urlencoded"
        };
        
        return   axios({
            method:"GET",
            url : APP_BASE_URL + `/appointment/sessions/calendarByPin`,
            headers: headers,
            params: {
                pincode:pincode,
                date:apptDate
            }
        });
    },
    generateOTP: ( mobileNumber ) => {
        const data =  { mobile:mobileNumber };
        return axios({
            method:"POST",
            url : APP_BASE_URL + `/auth/public/generateOTP`,
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            },
            data: data
        })  
    },
    confirmOTP: ( otphash, txnId ) => axios({
        method:"POST",
        url : APP_BASE_URL + `/auth/public/confirmOTP`,
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        },
        data: {
            otp:otphash, 
            txnId:txnId
        }
    })
}

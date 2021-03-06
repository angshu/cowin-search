const axios = require("axios");

const APP_BASE_URL = `https://cdn-api.co-vin.in/api/v2`
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0"

module.exports = {
    getByDistrict: (districtId, apptDate, authToken) => {
        const headers = authToken ? {
            "content-type":"application/x-www-form-urlencoded",
            "Authorization":"Bearer " + authToken,
            "user-agent": USER_AGENT
        } : {
            "content-type":"application/x-www-form-urlencoded",
            "user-agent": USER_AGENT
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
            "user-agent": USER_AGENT,
            "Authorization":"Bearer " + authToken,
        } : {
            "content-type":"application/x-www-form-urlencoded",
            "user-agent": USER_AGENT
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
                "content-type": "application/json",
                "user-agent": USER_AGENT
            },
            data: data
        })  
    },
    confirmOTP: ( otphash, txnId ) => axios({
        method:"POST",
        url : APP_BASE_URL + `/auth/public/confirmOTP`,
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "user-agent": USER_AGENT
        },
        data: {
            otp:otphash, 
            txnId:txnId
        }
    }),
    getStates: () => axios({
        method:"GET",
        url : APP_BASE_URL + `/admin/location/states`,
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "user-agent": USER_AGENT
        }
    }),
    getDistricts: (stateId) => axios({
        method:"GET",
        url : APP_BASE_URL + `/admin/location/districts/` + stateId,
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "user-agent": USER_AGENT
        }
    })
}

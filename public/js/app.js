
const btnSearchByDistrict = document.querySelector('#btnSearchByDistrict');
const districtIdInput = document.querySelector('#districtId');
const appDateInput = document.querySelector('#appDate');
const ageGroupInput = document.querySelector('#ageGroup');
const messageOne = document.querySelector('.message-1');
const messageTwo = document.querySelector('.message-2');
document.querySelector('#btnSearchByDistrict');

btnSearchByDistrict.addEventListener('click', (e) => {
    e.preventDefault();

    const districtId = districtIdInput.value;
    const appDate = appDateInput.value;
    const ageGroup = ageGroupInput.value;
    
    messageOne.textContent = 'Loading..';

    const data = {
        districtId,
        appDate,
        ageGroup
    }

    fetch('/searchByDistrict', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                messageOne.textContent = data.error;
            } else {
                messageOne.textContent = "Results";
                renderSearchResultForDistrict(data.centers);
                messageTwo.textContent = data.message;
            }
        })
    })
})

const renderSearchResultForDistrict = function(centers) {
    var tbody = document.getElementById("districtSearchResultTable").getElementsByTagName('tbody')[0];
    while (tbody.rows.length > 0) {
        tbody.deleteRow(0);
    }
    
    if (centers) {
        centers.forEach(c => {
            var row = tbody.insertRow();
            var nameCell = row.insertCell(0);
            nameCell.innerHTML = c.name;
            var pinCell = row.insertCell(1);
            pinCell.innerHTML = c.pincode;
            var districtCell = row.insertCell(2);
            districtCell.innerHTML = c.district_name;
        });
    }           
}

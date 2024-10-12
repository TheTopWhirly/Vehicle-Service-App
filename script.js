const baseUrl = 'http://localhost:3000/api';

// Mock login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'admin') {
        window.location.href = 'home.html';
    } else {
        document.getElementById('login-status').textContent = 'Invalid credentials';
    }
}

// Add activity function for Create Job Card
function addActivity() {
    const activityList = document.getElementById('activity-list');
    const activityDiv = document.createElement('div');
    activityDiv.innerHTML = `
        <input type="text" name="activity" placeholder="Activity" required>
        <input type="number" name="cost" placeholder="Cost" required>`;
    activityList.appendChild(activityDiv);
}

// Submit Job Card to backend
document.getElementById('job-card-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const jobCard = {
        jobCardNumber: document.getElementById('jobCardNumber').value,
        customerName: document.getElementById('customerName').value,
        address: document.getElementById('address').value,
        mobileNo: document.getElementById('mobileNo').value,
        carModel: document.getElementById('carModel').value,
        chassisNo: document.getElementById('chassisNo').value,
        serviceType: document.getElementById('serviceType').value,
        mileage: document.getElementById('mileage').value,
        activities: Array.from(document.querySelectorAll('#activity-list div')).map(div => ({
            activity: div.querySelector('input[name="activity"]').value,
            cost: div.querySelector('input[name="cost"]').value,
            completed: false
        }))
    };

    fetch(`${baseUrl}/jobcard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobCard)
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
});

// Fetch Job Card and display for update
function fetchJobCard() {
    const jobCardNumber = document.getElementById('searchJobCardNumber').value;
    
    fetch(`${baseUrl}/jobcard/${jobCardNumber}`)
        .then(response => response.json())
        .then(jobCard => {
            if (!jobCard) {
                alert('Job card not found');
                return;
            }
            const activitiesHTML = jobCard.activities.map((activity, index) => `
                <label>
                    <input type="checkbox" ${activity.completed ? 'checked' : ''} id="activity${index}">
                    ${activity.activity} (₹${activity.cost})
                </label><br>
            `).join('');
            document.getElementById('jobCardDetails').innerHTML = activitiesHTML;
            document.getElementById('saveJobCard').style.display = 'inline';
        })
        .catch(err => console.error('Error fetching job card:', err));
}

// Update Job Card
function updateJobCard() {
    const jobCardNumber = document.getElementById('searchJobCardNumber').value;
    const activities = Array.from(document.querySelectorAll('#jobCardDetails label')).map((label, index) => ({
        activity: label.textContent.split(' (')[0],
        cost: parseFloat(label.textContent.match(/\₹(\d+)/)[1]),
        completed: document.getElementById(`activity${index}`).checked
    }));

    fetch(`${baseUrl}/jobcard/${jobCardNumber}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activities })
    })
    .then(response => response.json())
    .then(data => {
        alert('Job card updated successfully!');
        document.getElementById('saveJobCard').style.display = 'none';
        document.getElementById('jobCardDetails').innerHTML = '';
    })
    .catch(error => console.error('Error updating job card:', error));
}

// Fetch Job Card for invoice generation
function fetchInvoice() {
    const jobCardNumber = document.getElementById('invoiceJobCardNumber').value;

    fetch(`${baseUrl}/jobcard/${jobCardNumber}`)
        .then(response => response.json())
        .then(jobCard => {
            if (!jobCard) {
                alert('Job card not found');
                return;
            }

            // Check if all activities are completed
            const allCompleted = jobCard.activities.every(activity => activity.completed);
            if (!allCompleted) {
                document.getElementById('invoiceDetails').innerHTML = 'Activities are not finished';
                document.getElementById('createInvoiceBtn').style.display = 'none';
                return;
            }

            // Display job card details for invoice
            const activitiesHTML = jobCard.activities.map(activity => `
                <p>${activity.activity}: ₹${activity.cost}</p>
            `).join('');
            document.getElementById('invoiceDetails').innerHTML = `
                <h3>Invoice for Job Card: ${jobCard.jobCardNumber}</h3>
                <p>Customer Name: ${jobCard.customerName}</p>
                <p>Address: ${jobCard.address}</p>
                <p>Mobile No: ${jobCard.mobileNo}</p>
                <p>Car Model: ${jobCard.carModel}</p>
                <p>Chassis No: ${jobCard.chassisNo}</p>
                <p>Service Type: ${jobCard.serviceType}</p>
                <p>Mileage: ${jobCard.mileage}</p>
                <h4>Activities:</h4>
                ${activitiesHTML}
                <h4>Total Cost: ₹${jobCard.activities.reduce((sum, activity) => sum + activity.cost, 0)}</h4>
            `;
            document.getElementById('createInvoiceBtn').style.display = 'inline';
        })
        .catch(err => console.error('Error fetching job card:', err));
}

// Generate Invoice and delete job card
function generateInvoice() {
    const jobCardNumber = document.getElementById('invoiceJobCardNumber').value;

    // Make a DELETE request to remove job card after creating invoice
    fetch(`${baseUrl}/jobcard/${jobCardNumber}`, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => {
        alert('Invoice generated and job card deleted!');
        document.getElementById('invoiceDetails').innerHTML = ''; // Clear invoice details after creation
        document.getElementById('createInvoiceBtn').style.display = 'none';
    })
    .catch(error => console.error('Error deleting job card:', error));
}


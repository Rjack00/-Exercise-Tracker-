const responseOutputJson = document.getElementById('response-output-json');
const responseOutputUX = document.getElementById('response-output-ux');
const createUserForm = document.getElementById('create-user-form');
const exerciseForm = document.getElementById('exercise-form');
const logForm = document.getElementById('log-form');


createUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
        console.log('Form intercepted');
    
        const username = document.getElementById('uname').value;

        console.log(username);

        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username
            })
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        responseOutputJson.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        responseOutput.textContent = `Error: ${error.message}`;
    }
    

});


exerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = document.getElementById("uid").value;
    const description = document.getElementById('desc').value;
    const duration = document.getElementById('dur').value;
    const date = document.getElementById('date').value;
    
    try {

        const response = await fetch(`/api/users/${userId}/exercises`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description,
                duration,
                date
            })
        });

        const data = await response.json();
        
        if(!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        responseOutputJson.textContent = JSON.stringify(data, null, 2);

        responseOutputUX.innerHTML = `
        <div class="exercise-card">
            <h3>Exercise Added</h3>
            <p><strong>User:</strong> ${data.username}</p>
            <p><strong>Exercise:</strong> ${data.description}</p>
            <p><strong>Duration:</strong> ${data.duration} min</p>
            <p><strong>Date:</strong> ${data.date}</p>
        </div>
        `;

    } catch {
        responseOutput.textContent = `Error: ${error.message}`;
        
    }
    
});

logForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('log-user-id').value;
    const from = document.getElementById('log-from').value;
    const to = document.getElementById('log-to').value;
    const limit = document.getElementById('log-limit').value;

    const params = new URLSearchParams();

    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', limit);

    const url = `/api/users/${userId}/logs?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        responseOutputJson.textContent = JSON.stringify(data, null, 2);

        responseOutputUX.innerHTML = `
        <div class="ux-response-head">
            <h3>${data.username}</h3>
            <p>ID: ${data._id}</p>
            <p>Total Exercises: ${data.count}</p>
        </div>
            `;

        data.log.forEach(exercise => {
            responseOutputUX.innerHTML += `
            <div class="exercise-card">
                <h4>${exercise.description}</h4>
                <p>Duration: ${exercise.duration}</p>
                <p>Date: ${exercise.date}</p>
            </div>
            `
        });

    } catch (error) {
        console.error(error)
    }
});


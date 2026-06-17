const responseOutput = document.getElementById('response-output');
const createUserForm = document.getElementById('create-user-form');
const exerciseForm = document.getElementById("exercise-form");



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

        responseOutput.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        responseOutput.textContent = `Error: ${error.message}`;
    }
    

});


exerciseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const userId = document.getElementById("uid").value;
    exerciseForm.action = `/api/users/${userId}/exercises`;

    exerciseForm.submit();
});


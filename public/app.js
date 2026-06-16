console.log('app.js loaded');
const createUserForm = document.getElementById('create-user-form');
const exerciseForm = document.getElementById("exercise-form");



createUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
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

    console.log(data);

});


exerciseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const userId = document.getElementById("uid").value;
    exerciseForm.action = `/api/users/${userId}/exercises`;

    exerciseForm.submit();
});


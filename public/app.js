const responseOutputJson = document.getElementById('response-output-json');
const responseOutputUX = document.getElementById('response-output-ux');
const createUserForm = document.getElementById('create-user-form');
const exerciseForm = document.getElementById('exercise-form');
const logForm = document.getElementById('log-form');
const exerciseUserSelect = document.getElementById('exercise-user-select');
const logUserSelect = document.getElementById('log-user-select');
const modal = document.getElementById("response-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalJson = document.getElementById("modal-json");
const modalJsonSection = document.querySelector("#response-modal details");
const modalButtons = document.getElementById("modal-buttons");
const closeBtn = document.getElementById('close-btn');
let currentLog = [];

// ───────────────── HELPER FUNCTIONS ──────────────────────

const exerciseAddedHTML = (data) => {
    return `
        <div class="exercise-card">
            <h3>Exercise Added</h3>
            <p><strong>User:</strong> ${data.username}</p>
            <p><strong>Exercise:</strong> ${data.description}</p>
            <p><strong>Duration:</strong> ${data.duration} min</p>
            <p><strong>Date:</strong> ${data.date}</p>
        </div>
    `;
}

const exerciseCardHTML = (exercise) => {
     
     return `
        <div class="exercise-card" data-id="${exercise._id}">
            <h4>${exercise.description}</h4>
            <p>Duration: ${exercise.duration}</p>
            <p>Date: ${exercise.date}</p>
            <button class="delete-btn" data-id="${exercise._id}">Delete</button>
        </div>
        `;
}

const exerciseLogHTML = (data) => {
    let html = `
        <div class="ux-response-head">
            <h3>${data.username}</h3>
            <p>ID: ${data._id}</p>
            <p>Total Exercises: ${data.count}</p>
        </div>
            `;
    data.log.forEach(exercise => {
        html += exerciseCardHTML(exercise);
    });

    return html;
}

const getExercise = (id) => {
    return currentLog.find(ex => ex._id === id);
}

const deleteExerciseCardHTML = (exercise) => {
    return `
        <h4>${exercise.description}</h4>
        <p>Duration: ${exercise.duration}</p>
        <p>Date: ${exercise.date}</p>
        <p><strong>Delete this exercise?</strong></p>
        <button class="cancel-delete-btn" value="cancel" data-id="${exercise._id}">Cancel</button>
        <button class="confirm-delete-btn" value="yesDelete" data-id="${exercise._id}">Yes</button>
    `;
} 

const originalExerciseCardHTML = (exercise) => {
    return `
        <h4>${exercise.description}</h4>
        <p>Duration: ${exercise.duration}</p>
        <p>Date: ${exercise.date}</p>
        <button class="delete-btn" data-id="${exercise._id}">Delete</button>
    `;
}

const deleteExercise = async (exerciseId) => {
    const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
    }

    return response.json();
}


function showModal({
    title,
    content,
    json = '',
    buttons = [
        { text: "OK", value: "ok" }
    ],
    showJson = true
}) {
    modalTitle.textContent = title;

    modalContent.innerHTML = content;

    modalJson.textContent = 
        typeof json === 'string'
            ? json
            : JSON.stringify(json, null, 2);

    modalJsonSection.hidden = !showJson;
    
    modalButtons.innerHTML = '';

    buttons.forEach(buttonConfig => {
        const btn = document.createElement("button");
        btn.textContent = buttonConfig.text;

        btn.addEventListener("click", (e) => {
            modal.close(buttonConfig.value);
        });

        modalButtons.appendChild(btn);
    });
    
    modal.showModal();

    return new Promise((resolve) => {
        modal.addEventListener("close", () => {
            resolve(modal.returnValue);
        }, { once: true });
    });
};

function showError(message) {
    return showModal({
        title: "Error",
        content: message,
        showJson: false
    });
};


const loadUsers = async () => {
    
    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        for (let i = exerciseUserSelect.options.length - 1; i >= 1; i--) {
            exerciseUserSelect.remove(i);
            logUserSelect.remove(i);
        }

        users.forEach(user => {
            const exerciseSelectOption = document.createElement('option');
            exerciseSelectOption.value = user._id;
            exerciseSelectOption.textContent = user.username;

            const logSelectOption = document.createElement('option');
            logSelectOption.value = user._id;
            logSelectOption.textContent = user.username;

            exerciseUserSelect.appendChild(exerciseSelectOption);
            logUserSelect.appendChild(logSelectOption);
        });

    } catch (error) {
        console.error('Failed to load users: ', error);
    }
}
// ────────────────────── BUTTON LISTENERS ──────────────────────


modalContent.addEventListener("click", async (e) => {
        console.log("Delete button target: ", e.target);
        
        if(e.target.classList.contains("delete-btn")) {

            console.log("Delete button clicked!", e.target.dataset.id);
            console.log("e.target.dataset: ", e.target.dataset);

            const clickedID = e.target.dataset.id;

            const exercise = getExercise(clickedID);

            const card = e.target.closest(".exercise-card");
            card.innerHTML = deleteExerciseCardHTML(exercise);
            return;
        }

        if(e.target.classList.contains("confirm-delete-btn")) {
            console.log("Delete-confirmation: ", e.target);
            

            const clickedID = e.target.dataset.id;
            console.log("clickedID: ", e.target.dataset.id);
            const exercise = getExercise(clickedID);
            const card = e.target.closest(".exercise-card");

            card.innerHTML = originalExerciseCardHTML(exercise);
            return;
        }

        if(e.target.classList.contains("cancel-delete-btn")) {
            console.log("Cancel Delete: ", e.target);

            const clickedID = e.target.dataset.id;
            const exercise = getExercise(clickedID);
            const card = e.target.closest(".exercise-card");

            card.innerHTML = originalExerciseCardHTML(exercise);
            return;
        }
    });

// closeBtn.addEventListener("click", () => {
//     modal.close();
// });
// ─────────────────── end modal testing ──────────────────────

createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
    
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

        await loadUsers();

        exerciseUserSelect.value = data._id;
        logUserSelect.value = data._id;

        if(!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        const result = await showModal({
            title: "User Created",
            content: `
            <div class="ux-response-head">
                <p>New user "${data.username}" created successfully!</p>
            </div>
            `,
            json: data
        });

        console.log("result: ", result);

        e.target.reset();

    } catch (error) {
        await showError(error.message);
    }
    

});


exerciseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!exerciseUserSelect.value) {
        await showError('Please select a user.');
        return;
    }

    const userId = exerciseUserSelect.value;
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

        // responseOutputJson.textContent = JSON.stringify(data, null, 2);

        // responseOutputUX.innerHTML = `
        // <div class="exercise-card">
        //     <h3>Exercise Added</h3>
        //     <p><strong>User:</strong> ${data.username}</p>
        //     <p><strong>Exercise:</strong> ${data.description}</p>
        //     <p><strong>Duration:</strong> ${data.duration} min</p>
        //     <p><strong>Date:</strong> ${data.date}</p>
        // </div>
        // `;

        const result = await showModal({
            title: "Exercise Added",
            content: exerciseAddedHTML(data),
            json: data
        });

        console.log("result: ", result);

        e.target.reset();

    } catch (error) {
        await showError(error.message);
        
    }
    
});

logForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!logUserSelect.value) {
        await showError("Please select a user.");
        return;
    }

    const userId = logUserSelect.value;
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

        // responseOutputJson.textContent = JSON.stringify(data, null, 2);

        console.log('Data: ', data);

        currentLog = data.log;

        // let html = `
        // <div class="ux-response-head">
        //     <h3>${data.username}</h3>
        //     <p>ID: ${data._id}</p>
        //     <p>Total Exercises: ${data.count}</p>
        // </div>
        //     `;

        // data.log.forEach(exercise => {
        //     html += `
        //     <div class="exercise-card">
        //         <h4>${exercise.description}</h4>
        //         <p>Duration: ${exercise.duration}</p>
        //         <p>Date: ${exercise.date}</p>
        //     </div>
        //     `
        // });

        const result = await showModal({
            title: "Exercises Logged",
            content: exerciseLogHTML(data),
            json: data,
            buttons: [
                { text: "Cancel", value: "cancel"},
                { text: "Delete", value: "delete"}
            ]
        });

        console.log("result: ", result);

        e.target.reset();

    } catch (error) {
        console.error(error)
    }
});

loadUsers();

// ==========================================
// STUDYSPACE - COMPLETE JAVASCRIPT
// ==========================================


// ==========================================
// 1. TO-DO LIST
// ==========================================

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.onchange = function() {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        };

        const span = document.createElement("span");
        span.textContent = task.text;

        const del = document.createElement("button");
        del.textContent = "×";
        del.className = "delete-btn";

        del.onclick = function() {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        };

        li.append(checkbox, span, del);
        taskList.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("taskInput");
    if (!input) return;

    const text = input.value.trim();

    if (!text) {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        text: text,
        completed: false
    });

    input.value = "";
    saveTasks();
    renderTasks();
}

renderTasks();


// ==========================================
// 2. MONTHLY CALENDAR
// ==========================================

let calendarDate = new Date();

let calendarEvents = JSON.parse(
    localStorage.getItem("studyCalendarEvents")
) || {};

function saveCalendarEvents() {
    localStorage.setItem(
        "studyCalendarEvents",
        JSON.stringify(calendarEvents)
    );
}

function renderCalendar() {
    const monthTitle = document.getElementById("monthTitle");
    const grid = document.getElementById("calendarGrid");

    if (!monthTitle || !grid) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    monthTitle.textContent = new Date(year, month).toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );

    const weekdays = [
        "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    ];

    grid.innerHTML = "";

    weekdays.forEach(function(day) {
        const heading = document.createElement("div");
        heading.className = "weekday";
        heading.textContent = day;
        grid.appendChild(heading);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const cell = document.createElement("button");
        cell.className = "calendar-day";
        cell.type = "button";

        const today = new Date();

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            cell.classList.add("today");
        }

        const number = document.createElement("span");
        number.className = "day-number";
        number.textContent = day;

        cell.appendChild(number);

        const events = calendarEvents[dateKey] || [];

        events.forEach(function(event) {
            const eventElement = document.createElement("span");
            eventElement.className = "event " + event.category;
            eventElement.textContent = event.title;
            cell.appendChild(eventElement);
        });

        cell.onclick = function() {
            manageCalendarDate(dateKey);
        };

        grid.appendChild(cell);
    }
}


// MANAGE EVENTS ON A DATE

function manageCalendarDate(dateKey) {
    const events = calendarEvents[dateKey] || [];

    if (events.length === 0) {
        addCalendarEvent(dateKey);
        return;
    }

    let eventList = "Events on " + dateKey + ":\n\n";

    events.forEach(function(event, index) {
        eventList += (index + 1) + ". " +
            event.title + " (" + event.category + ")\n";
    });

    eventList +=
        "\nEnter an event number to delete it.\n" +
        "Type A to add another event.\n" +
        "Press Cancel to go back.";

    const choice = prompt(eventList);

    if (choice === null) return;

    if (
        choice.trim().toLowerCase() === "a" ||
        choice.trim().toLowerCase() === "add"
    ) {
        addCalendarEvent(dateKey);
        return;
    }

    const eventNumber = Number(choice);

    if (
        !Number.isInteger(eventNumber) ||
        eventNumber < 1 ||
        eventNumber > events.length
    ) {
        alert("Please enter a valid event number or A.");
        return;
    }

    const eventIndex = eventNumber - 1;
    const selectedEvent = events[eventIndex];

    const confirmed = confirm(
        'Delete "' + selectedEvent.title + '"?'
    );

    if (!confirmed) return;

    calendarEvents[dateKey].splice(eventIndex, 1);

    if (calendarEvents[dateKey].length === 0) {
        delete calendarEvents[dateKey];
    }

    saveCalendarEvents();
    renderCalendar();

    alert("Event deleted successfully!");
}


// ADD EVENT

function addCalendarEvent(dateKey) {
    const title = prompt("What event would you like to add?");

    if (!title || !title.trim()) return;

    const category = prompt(
        "Choose a category:\nPhysics, Chemistry, Math, Test, Deadline, Other"
    );

    if (!category) return;

    const validCategories = [
        "physics",
        "chemistry",
        "math",
        "test",
        "deadline",
        "other"
    ];

    const selected = category.trim().toLowerCase();

    if (!validCategories.includes(selected)) {
        alert("Please enter a valid category!");
        return;
    }

    if (!calendarEvents[dateKey]) {
        calendarEvents[dateKey] = [];
    }

    calendarEvents[dateKey].push({
        title: title.trim(),
        category: selected
    });

    saveCalendarEvents();
    renderCalendar();
}

function changeMonth(amount) {
    calendarDate.setMonth(calendarDate.getMonth() + amount);
    renderCalendar();
}

function goToday() {
    calendarDate = new Date();
    renderCalendar();
}

renderCalendar();


// ==========================================
// 3. UPCOMING TEST
// ==========================================

let savedTest = JSON.parse(
    localStorage.getItem("studyTest")
) || null;

function saveTest() {
    const name = document.getElementById("testName").value.trim();
    const date = document.getElementById("testDate").value;
    const subjects = document.getElementById("testSubjects").value.trim();

    const completed = document.getElementById("completedChapters").value;
    const pending = document.getElementById("pendingChapters").value;

    if (!name || !date) {
        alert("Please enter a test name and date!");
        return;
    }

    savedTest = {
        name: name,
        date: date,
        subjects: subjects,
        completed: completed || 0,
        pending: pending || 0
    };

    localStorage.setItem("studyTest", JSON.stringify(savedTest));

    renderTest();
}

function deleteTest() {
    if (!savedTest) return;

    const confirmed = confirm(
        "Are you sure you want to delete this test?"
    );

    if (!confirmed) return;

    savedTest = null;

    localStorage.removeItem("studyTest");

    document.getElementById("testName").value = "";
    document.getElementById("testDate").value = "";
    document.getElementById("testSubjects").value = "";
    document.getElementById("completedChapters").value = "";
    document.getElementById("pendingChapters").value = "";

    renderTest();
}

function renderTest() {
    const display = document.getElementById("testDisplay");
    if (!display) return;

    display.innerHTML = "";

    if (!savedTest) {
        display.textContent = "No upcoming test added yet.";
        return;
    }

    const daysLeft = Math.ceil(
        (
            new Date(savedTest.date + "T00:00:00") -
            new Date(new Date().toDateString())
        ) / (1000 * 60 * 60 * 24)
    );

    const heading = document.createElement("h3");
    heading.textContent = savedTest.name;

    const date = document.createElement("p");
    date.textContent = "📅 " + savedTest.date;

    const subjects = document.createElement("p");
    subjects.textContent =
        "📚 " + (savedTest.subjects || "Subjects not added");

    const completed = document.createElement("p");
    completed.textContent =
        "✅ Completed: " + savedTest.completed + " chapters";

    const pending = document.createElement("p");
    pending.textContent =
        "⏳ Pending: " + savedTest.pending + " chapters";

    const countdown = document.createElement("h2");

    countdown.textContent =
        daysLeft > 0
            ? daysLeft + " days remaining"
            : daysLeft === 0
                ? "Test is today!"
                : "Test date passed";

    const total =
        Number(savedTest.completed) + Number(savedTest.pending);

    const percentage = total > 0
        ? Math.round(
            (Number(savedTest.completed) / total) * 100
        )
        : 0;

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.style.width = percentage + "%";

    const progressText = document.createElement("p");
    progressText.textContent =
        percentage + "% syllabus completed";

    progressContainer.appendChild(progressBar);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Test";
    deleteButton.className = "delete-test-button";
    deleteButton.onclick = deleteTest;

    display.append(
        heading,
        date,
        subjects,
        completed,
        pending,
        progressText,
        progressContainer,
        countdown,
        deleteButton
    );
}

function loadTest() {
    if (!savedTest) {
        renderTest();
        return;
    }

    document.getElementById("testName").value = savedTest.name;
    document.getElementById("testDate").value = savedTest.date;
    document.getElementById("testSubjects").value = savedTest.subjects;
    document.getElementById("completedChapters").value = savedTest.completed;
    document.getElementById("pendingChapters").value = savedTest.pending;

    renderTest();
}

loadTest();


// ==========================================
// 4. SUBJECT CHAPTER TRACKER
// ==========================================

let subjectChapters = JSON.parse(
    localStorage.getItem("subjectChapters")
) || {
    physics: [],
    chemistry: [],
    math: []
};

subjectChapters.physics = subjectChapters.physics || [];
subjectChapters.chemistry = subjectChapters.chemistry || [];
subjectChapters.math = subjectChapters.math || [];

function saveChapters() {
    localStorage.setItem(
        "subjectChapters",
        JSON.stringify(subjectChapters)
    );
}

function openSubject(subject) {
    const area = document.getElementById("chapterArea");

    if (!area || !subjectChapters[subject]) return;

    area.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent =
        subject.charAt(0).toUpperCase() + subject.slice(1);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter a chapter name...";

    const addButton = document.createElement("button");
    addButton.textContent = "+ Add Chapter";

    function addNewChapter() {
        const name = input.value.trim();

        if (!name) {
            alert("Enter a chapter name first!");
            return;
        }

        subjectChapters[subject].push({
            name: name,
            completed: false
        });

        saveChapters();
        openSubject(subject);
        updateSubjectProgress();
    }

    addButton.onclick = addNewChapter;

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            addNewChapter();
        }
    });

    area.append(heading, input, addButton);

    subjectChapters[subject].forEach(function(chapter, index) {
        const item = document.createElement("div");
        item.className = "chapter-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = chapter.completed;

        checkbox.onchange = function() {
            subjectChapters[subject][index].completed = checkbox.checked;

            saveChapters();
            openSubject(subject);
            updateSubjectProgress();
        };

        const label = document.createElement("span");
        label.textContent = chapter.name;

        if (chapter.completed) {
            label.classList.add("chapter-completed");
        }

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.onclick = function() {
            const newName = prompt(
                "Edit chapter name:",
                chapter.name
            );

            if (!newName || !newName.trim()) return;

            subjectChapters[subject][index].name = newName.trim();

            saveChapters();
            openSubject(subject);
            updateSubjectProgress();
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "×";

        deleteButton.onclick = function() {
            subjectChapters[subject].splice(index, 1);

            saveChapters();
            openSubject(subject);
            updateSubjectProgress();
        };

        item.append(
            checkbox,
            label,
            editButton,
            deleteButton
        );

        area.appendChild(item);
    });

    if (subjectChapters[subject].length === 0) {
        const empty = document.createElement("p");
        empty.textContent =
            "No chapters added yet. Add your first one!";

        area.appendChild(empty);
    }

    area.scrollIntoView({ behavior: "smooth" });
}


// ==========================================
// 5. SUBJECT PROGRESS
// ==========================================

function updateSubjectProgress() {
    Object.keys(subjectChapters).forEach(function(subject) {
        const chapters = subjectChapters[subject];
        const total = chapters.length;

        const completed = chapters.filter(function(chapter) {
            return chapter.completed;
        }).length;

        const percentage = total > 0
            ? Math.round((completed / total) * 100)
            : 0;

        const progress = document.getElementById(
            subject + "Progress"
        );

        const count = document.getElementById(
            subject + "Count"
        );

        if (progress) {
            progress.style.width = percentage + "%";
        }

        if (count) {
            count.textContent =
                completed + "/" + total +
                " chapters completed (" + percentage + "%)";
        }
    });
}

updateSubjectProgress();


// ==========================================
// 6. NOTES AND SUBJECT FOLDERS
// ==========================================

let notes = JSON.parse(
    localStorage.getItem("studyNotes")
) || [];

let currentNoteFolder = "physics";
let selectedNoteId = null;

function saveNotesToStorage() {
    localStorage.setItem("studyNotes", JSON.stringify(notes));
}


// SELECT FOLDER

function selectNoteFolder(folder, button) {
    currentNoteFolder = folder;
    selectedNoteId = null;

    document.querySelectorAll(".folder-button").forEach(function(item) {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const title = document.getElementById("notesFolderTitle");

    if (title) {
        const names = {
            physics: "Physics Notes",
            chemistry: "Chemistry Notes",
            math: "Mathematics Notes"
        };

        title.textContent = names[folder];
    }

    clearNoteEditor();
    renderNotes();
}


// CLEAR EDITOR

function clearNoteEditor() {
    const title = document.getElementById("noteTitle");
    const content = document.getElementById("noteContent");
    const status = document.getElementById("noteStatus");

    if (title) title.value = "";
    if (content) content.innerHTML = "";
    if (status) status.textContent = "";

    selectedNoteId = null;
}


// CREATE NOTE

function createNewNote() {
    clearNoteEditor();

    const title = document.getElementById("noteTitle");

    if (title) {
        title.focus();
    }

    const status = document.getElementById("noteStatus");

    if (status) {
        status.textContent = "Creating a new note...";
    }
}


// SAVE NOTE

function saveNote() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const status = document.getElementById("noteStatus");

    if (!titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.innerHTML.trim();

    if (!title) {
        alert("Please enter a note title!");
        return;
    }

    if (!content || content === "<br>") {
        alert("Please write something in your note!");
        return;
    }

    if (selectedNoteId !== null) {
        const existingNote = notes.find(function(note) {
            return note.id === selectedNoteId;
        });

        if (existingNote) {
            existingNote.title = title;
            existingNote.content = content;
            existingNote.updatedAt = new Date().toISOString();
        }
    } else {
        const newNote = {
            id: Date.now(),
            subject: currentNoteFolder,
            title: title,
            content: content,
            updatedAt: new Date().toISOString()
        };

        notes.push(newNote);
        selectedNoteId = newNote.id;
    }

    saveNotesToStorage();
    renderNotes();

    if (status) {
        status.textContent = "Note saved successfully!";
    }
}


// OPEN NOTE

function openNote(id) {
    const note = notes.find(function(item) {
        return item.id === id;
    });

    if (!note) return;

    selectedNoteId = id;

    document.getElementById("noteTitle").value = note.title;
    document.getElementById("noteContent").innerHTML = note.content;

    const status = document.getElementById("noteStatus");

    if (status) {
        status.textContent = "Editing saved note";
    }
}


// DELETE NOTE

function deleteNote() {
    if (selectedNoteId === null) {
        alert("Select a saved note first!");
        return;
    }

    const confirmed = confirm("Delete this note permanently?");

    if (!confirmed) return;

    notes = notes.filter(function(note) {
        return note.id !== selectedNoteId;
    });

    saveNotesToStorage();
    clearNoteEditor();
    renderNotes();
}


// RENDER NOTES

function renderNotes() {
    const list = document.getElementById("notesList");
    const search = document.getElementById("noteSearch");

    if (!list) return;

    list.innerHTML = "";

    const searchText = search
        ? search.value.toLowerCase().trim()
        : "";

    const filteredNotes = notes.filter(function(note) {
        return note.subject === currentNoteFolder &&
            (
                note.title.toLowerCase().includes(searchText) ||
                note.content.toLowerCase().includes(searchText)
            );
    });

    if (filteredNotes.length === 0) {
        const empty = document.createElement("p");

        empty.textContent = searchText
            ? "No matching notes found."
            : "No notes here yet. Create your first note!";

        list.appendChild(empty);
        return;
    }

    filteredNotes.forEach(function(note) {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "note-list-item";
        item.textContent = note.title;

        if (note.id === selectedNoteId) {
            item.classList.add("selected");
        }

        item.onclick = function() {
            openNote(note.id);
            renderNotes();
        };

        list.appendChild(item);
    });
}


// RICH TEXT FORMATTING

function formatNote(command, value) {
    const editor = document.getElementById("noteContent");

    if (!editor) return;

    editor.focus();

    document.execCommand(command, false, value || null);
}


// NOTE SEARCH

const noteSearchInput = document.getElementById("noteSearch");

if (noteSearchInput) {
    noteSearchInput.addEventListener("input", renderNotes);
}


// INITIALISE NOTES

renderNotes();


// ==========================================
// END OF STUDYSPACE
// ==========================================
// ==========================================
// 7. SOUND STUDIO
// ==========================================

let audioContext = null;
let soundPlayers = {};

let soundVolumes = {
    rain: 40,
    cafe: 35,
    forest: 35,
    library: 25
};

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            alert("Your browser does not support audio playback.");
            return null;
        }

        audioContext = new AudioContextClass();
    }

    return audioContext;
}

function toggleSound(name) {
    if (soundPlayers[name]) {
        stopSound(name);
        return;
    }

    const context = getAudioContext();
    if (!context) return;

    context.resume().then(function() {
        if (soundPlayers[name]) return;

        const buffer = context.createBuffer(
            1,
            context.sampleRate * 3,
            context.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = context.createBiquadFilter();
        const gain = context.createGain();

        filter.type = "lowpass";

        const frequencies = {
            rain: 1100,
            cafe: 1800,
            forest: 650,
            library: 350
        };

        filter.frequency.value = frequencies[name] || 1000;

        if (name === "cafe") {
            filter.type = "bandpass";
            filter.frequency.value = 800;
        }

        gain.gain.value = soundVolumes[name] / 100 * 0.25;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);

        source.start();

        soundPlayers[name] = {
            source: source,
            gain: gain
        };

        const button = document.getElementById(name + "Button");

        if (button) {
            button.textContent = "⏸ Stop";
        }
    });
}

function stopSound(name) {
    const player = soundPlayers[name];

    if (!player) return;

    player.source.stop();
    player.source.disconnect();
    player.gain.disconnect();

    delete soundPlayers[name];

    const button = document.getElementById(name + "Button");

    if (button) {
        button.textContent = "▶ Play";
    }
}

function setSoundVolume(name, value) {
    soundVolumes[name] = Number(value);

    if (soundPlayers[name]) {
        soundPlayers[name].gain.gain.value =
            soundVolumes[name] / 100 * 0.25;
    }
}

function stopAllSounds() {
    Object.keys(soundPlayers).forEach(function(name) {
        stopSound(name);
    });
}


// ==========================================
// 8. FOCUS TIMER
// ==========================================

let focusDuration = 25 * 60;
let breakDuration = 5 * 60;
let timerSeconds = focusDuration;

let timerInterval = null;
let timerRunning = false;
let isBreak = false;

let completedSessions = Number(
    localStorage.getItem("studyFocusSessions")
) || 0;


function updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");

    if (!display) return;

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    display.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}


function updateSessionCount() {
    const counter = document.getElementById("sessionCount");

    if (counter) {
        counter.textContent = completedSessions;
    }
}


function updateTimerLabel() {
    const label = document.getElementById("timerLabel");

    if (!label) return;

    label.textContent = isBreak
        ? "BREAK TIME"
        : "FOCUS SESSION";
}


// START TIMER

function startFocusTimer() {
    if (timerRunning) return;

    if (timerSeconds <= 0) {
        resetFocusTimer();
    }

    timerRunning = true;

    timerInterval = setInterval(function() {
        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;

            if (!isBreak) {
                completedSessions++;

                localStorage.setItem(
                    "studyFocusSessions",
                    completedSessions
                );

                updateSessionCount();

                isBreak = true;
                timerSeconds = breakDuration;

                updateTimerLabel();
                updateTimerDisplay();

                alert("Focus session complete! Time for a break. 🎉");

            } else {
                isBreak = false;
                timerSeconds = focusDuration;

                updateTimerLabel();
                updateTimerDisplay();

                alert("Break over! Ready for another focus session?");
            }
        }
    }, 1000);

    const startButton = document.getElementById("timerStart");

    if (startButton) {
        startButton.textContent = "▶ Resume";
    }
}


// PAUSE TIMER

function pauseFocusTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerRunning = false;

    const startButton = document.getElementById("timerStart");

    if (startButton) {
        startButton.textContent = "▶ Resume";
    }
}


// RESET TIMER

function resetFocusTimer() {
    pauseFocusTimer();

    isBreak = false;
    timerSeconds = focusDuration;

    updateTimerDisplay();
    updateTimerLabel();

    const startButton = document.getElementById("timerStart");

    if (startButton) {
        startButton.textContent = "▶ Start";
    }
}


// CHANGE TIMER MODE

function setFocusMode(focusMinutes, breakMinutes) {
    pauseFocusTimer();

    focusDuration = focusMinutes * 60;
    breakDuration = breakMinutes * 60;

    isBreak = false;
    timerSeconds = focusDuration;

    updateTimerDisplay();
    updateTimerLabel();

    document.getElementById("pomodoroMode")
        .classList.toggle("selected-mode", focusMinutes === 25);

    document.getElementById("longMode")
        .classList.toggle("selected-mode", focusMinutes === 50);
}


// CUSTOM TIMER

function setCustomTimer() {
    const input = document.getElementById("customMinutes");

    const minutes = Number(input.value);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
        alert("Enter a duration between 1 and 180 minutes.");
        return;
    }

    pauseFocusTimer();

    focusDuration = minutes * 60;
    timerSeconds = focusDuration;
    isBreak = false;

    updateTimerDisplay();
    updateTimerLabel();

    document.getElementById("pomodoroMode")
        .classList.remove("selected-mode");

    document.getElementById("longMode")
        .classList.remove("selected-mode");

    input.value = "";
}


// INITIALISE TIMER

updateTimerDisplay();
updateTimerLabel();
updateSessionCount();


// ==========================================
// END OF FOCUS ZONE
// ==========================================
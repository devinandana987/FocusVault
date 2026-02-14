const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", function () {
    window.location.href = "dashboard.html";
});


document.addEventListener("DOMContentLoaded", function () {

    const notesTab = document.getElementById("notesTab");
    const summaryTab = document.getElementById("summaryTab");

    const notesSection = document.getElementById("notesSection");
    const summarySection = document.getElementById("summarySection");

    const addNoteBtn = document.getElementById("addNote");
    const notesContainer = document.getElementById("notesContainer");

    // const generateSummaryBtn = document.getElementById("generateSummary");
    const summaryText = document.getElementById("summaryText");

    let notes = [];

    /* TAB SWITCHING */
    notesTab.addEventListener("click", function () {
        notesTab.classList.add("active");
        summaryTab.classList.remove("active");

        notesSection.classList.add("active-section");
        summarySection.classList.remove("active-section");
    });

    summaryTab.addEventListener("click", function () {
        summaryTab.classList.add("active");
        notesTab.classList.remove("active");

        summarySection.classList.add("active-section");
        notesSection.classList.remove("active-section");

        loadSummaries();  // 🔥 refresh summaries
    });


    /* LOAD NOTES */
    chrome.storage.local.get(["notes"], function (result) {
        if (result.notes) {
            notes = result.notes;
            displayNotes();
        }
    });

    /* ADD NOTE */
    addNoteBtn.addEventListener("click", function () {
        notes.push("");
        saveNotes();
        displayNotes();
    });

    /* SAVE */
    function saveNotes() {
        chrome.storage.local.set({ notes: notes });
    }

    /* DISPLAY */
    function displayNotes() {
        notesContainer.innerHTML = "";

        notes.forEach((note, index) => {
            const noteDiv = document.createElement("div");
            noteDiv.classList.add("note");

            const textarea = document.createElement("textarea");
            textarea.value = note;

            textarea.addEventListener("input", function () {
                notes[index] = textarea.value;
                saveNotes();
            });

            /* DOWNLOAD BUTTON */
            const downloadBtn = document.createElement("button");
            downloadBtn.innerText = "d";
            downloadBtn.classList.add("download-btn");

            downloadBtn.addEventListener("click", function () {
                const blob = new Blob([notes[index]], { type: "text/plain" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "Note_" + (index + 1) + ".txt";
                a.click();

                URL.revokeObjectURL(url);
            });

            /* DELETE BUTTON */
            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "-";
            deleteBtn.classList.add("delete-btn");

            deleteBtn.addEventListener("click", function () {
                notes.splice(index, 1);
                saveNotes();
                displayNotes();
            });

            noteDiv.appendChild(textarea);
            noteDiv.appendChild(downloadBtn);
            noteDiv.appendChild(deleteBtn);

            notesContainer.appendChild(noteDiv);
        });
    }

    /* AI SUMMARY */
    /* LOAD SUMMARIES FROM STORAGE */
    // function loadSummaries() {

    //     chrome.storage.local.get(["summaries"], function (result) {

    //         const summaries = result.summaries || [];

    //         summaryText.innerHTML = "";

    //         if (summaries.length === 0) {
    //             summaryText.innerText = "No summaries yet.";
    //             return;
    //         }

    //         summaries.forEach((summary, index) => {

    //             const wrapper = document.createElement("div");
    //             wrapper.classList.add("summary-item");

    //             const text = document.createElement("p");
    //             text.innerText = summary;

    //             wrapper.appendChild(text);

    //             summaryText.appendChild(wrapper);
    //         });
    //     });
    // }
    function loadSummaries() {

    chrome.storage.local.get(["summaries"], function (result) {

        let summaries = result.summaries || [];

        summaryText.innerHTML = "";

        if (summaries.length === 0) {
            summaryText.innerText = "No summaries yet.";
            return;
        }

        summaries.forEach((summary, index) => {

            const summaryDiv = document.createElement("div");
            summaryDiv.classList.add("note");  // same style as notes

            const textarea = document.createElement("textarea");
            textarea.value = summary;
            textarea.readOnly = true; // summary shouldn't auto-edit unless you want

            /* DOWNLOAD BUTTON */
            const downloadBtn = document.createElement("button");
            downloadBtn.innerText = "d";
            downloadBtn.classList.add("download-btn");

            downloadBtn.addEventListener("click", function () {

                const blob = new Blob([summary], { type: "text/plain" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "Summary_" + (index + 1) + ".txt";
                a.click();

                URL.revokeObjectURL(url);
            });

            /* DELETE BUTTON */
            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "-";
            deleteBtn.classList.add("delete-btn");

            deleteBtn.addEventListener("click", function () {

                summaries.splice(index, 1);

                chrome.storage.local.set({ summaries: summaries }, function () {
                    loadSummaries(); // refresh UI
                });
            });

            summaryDiv.appendChild(textarea);
            summaryDiv.appendChild(downloadBtn);
            summaryDiv.appendChild(deleteBtn);

            summaryText.appendChild(summaryDiv);
        });
    });
}



});

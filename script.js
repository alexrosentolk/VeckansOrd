// ======================================================
// API
// ======================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycby9o0dDp3MpER0TvKCbgSaP5W0UeAnS927OcoZYV1vbmhWtjnsPgy-aB1TR9B2ICjZtlw/exec";


// ======================================================
// GLOBALA VARIABLER
// ======================================================

let currentUser = null;

let words = [];

let quizWords = [];

let quizIndex = 0;


// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

  // Ingen localStorage.
  // Användaren måste alltid logga in när sidan öppnas.

  currentUser = null;

  showPage("loginPage");

});


// ======================================================
// INLOGGNING
// ======================================================

function login() {

  const firstName =
    document
      .getElementById("firstNameInput")
      .value
      .trim();

  const lastName =
    document
      .getElementById("lastNameInput")
      .value
      .trim();


  if (!firstName || !lastName) {

    alert(
      "Fyll i både förnamn och efternamn."
    );

    return;

  }


  const userId =
    createUserId(
      firstName,
      lastName
    );


  currentUser = {

    userId: userId,

    firstName: firstName,

    lastName: lastName

  };


  updateWelcomeMessage();

  showPage("homePage");

}


// ======================================================
// SKAPA USER ID
// Exempel:
// Aron + Andersson = AronAndersson
// ======================================================

function createUserId(
  firstName,
  lastName
) {

  const cleanFirst =
    firstName
      .trim()
      .replace(/\s+/g, "");

  const cleanLast =
    lastName
      .trim()
      .replace(/\s+/g, "");


  return capitalizeFirstLetter(cleanFirst)
    +
    capitalizeFirstLetter(cleanLast);

}


function capitalizeFirstLetter(text) {

  if (!text) {

    return "";

  }


  return (
    text.charAt(0).toUpperCase()
    +
    text.slice(1)
  );

}


// ======================================================
// VÄLKOMSTTEXT
// ======================================================

function updateWelcomeMessage() {

  const element =
    document.getElementById(
      "welcomeMessage"
    );


  if (!element || !currentUser) {

    return;

  }


  element.textContent =
    "Hej " +
    currentUser.firstName +
    "!";

}


// ======================================================
// LOGGA UT
// ======================================================

function logout() {

  currentUser = null;

  words = [];

  quizWords = [];

  quizIndex = 0;


  const firstNameInput =
    document.getElementById(
      "firstNameInput"
    );


  const lastNameInput =
    document.getElementById(
      "lastNameInput"
    );


  if (firstNameInput) {

    firstNameInput.value = "";

  }


  if (lastNameInput) {

    lastNameInput.value = "";

  }


  resetQuiz();

  showPage("loginPage");

}


// ======================================================
// DATAHANTERING
// ======================================================

async function loadWords() {

  if (!currentUser) {

    showPage("loginPage");

    return;

  }


  const message =
    document.getElementById(
      "loadingMessage"
    );


  if (message) {

    message.textContent =
      "Hämtar ord...";

  }


  try {

    const url =
      API_URL
      +
      "?userId="
      +
      encodeURIComponent(
        currentUser.userId
      );


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        "Serverfel"
      );

    }


    const data =
      await response.json();


    words = data;


    console.log(
      "Inlästa ord:",
      words
    );


    if (message) {

      message.textContent =
        words.length +
        " ord laddade";

    }


    setTimeout(function () {

      if (message) {

        message.textContent = "";

      }

    }, 2000);


  }
  catch (error) {

    console.error(
      "Kunde inte läsa kalkylarket:",
      error
    );


    if (message) {

      message.textContent =
        "Kunde inte hämta ord.";

    }


    words = [];

  }

}


// ======================================================
// SKICKA DATA TILL APPS SCRIPT
// ======================================================

async function sendToSheet(data) {

  const response =
    await fetch(
      API_URL,
      {

        method: "POST",

        body:
          JSON.stringify(data)

      }
    );


  if (!response.ok) {

    throw new Error(
      "Kunde inte spara data."
    );

  }


  return await response.json();

}


// ======================================================
// NAVIGATION
// ======================================================

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(function (page) {

      page.classList.remove(
        "active"
      );

    });


  const page =
    document.getElementById(
      pageId
    );


  if (page) {

    page.classList.add(
      "active"
    );

  }

}


// ======================================================
// HUVUDMENY
// ======================================================

function backToHome() {

  resetQuiz();

  showPage("homePage");

}


// ======================================================
// LÄGG TILL ORD
// ======================================================

function backFromAddPage() {

  clearInputs();

  showPage("homePage");

}


// ======================================================
// SPARA ORD
// ======================================================

async function saveWord() {

  if (!currentUser) {

    showPage("loginPage");

    return;

  }


  const word =
    document
      .getElementById("wordInput")
      .value
      .trim();


  const meaning =
    document
      .getElementById("meaningInput")
      .value
      .trim();


  const example =
    document
      .getElementById("exampleInput")
      .value
      .trim();


  const hide =
    document
      .getElementById("hideInput")
      .value
      .trim();


  const week =
    document
      .getElementById("weekInput")
      .value
      .trim();


  const year =
    document
      .getElementById("yearInput")
      .value
      .trim();


  if (
    !word ||
    !meaning ||
    !week ||
    !year
  ) {

    alert(
      "Fyll i obligatoriska fält."
    );

    return;

  }


  await loadWords();


  const existingWord =
    words.some(function (item) {

      return (
        String(item.word)
          .trim()
          .toLowerCase()
        ===
        word
          .trim()
          .toLowerCase()
      );

    });


  if (existingWord) {

    alert(
      "Det här ordet finns redan."
    );

    return;

  }


  try {

    await sendToSheet({

      action: "add",

      userId:
        currentUser.userId,

      word: word,

      meaning: meaning,

      example: example,

      hide: hide,

      week: week,

      year: year

    });


    clearInputs();


    alert(
      "Ordet sparades."
    );


    showPage("homePage");


  }
  catch (error) {

    console.error(error);

    alert(
      "Kunde inte spara ordet."
    );

  }

}


// ======================================================
// RENSA INPUT
// ======================================================

function clearInputs() {

  const fields = [

    "wordInput",

    "meaningInput",

    "exampleInput",

    "hideInput",

    "weekInput",

    "yearInput"

  ];


  fields.forEach(function (id) {

    const element =
      document.getElementById(id);


    if (element) {

      element.value = "";

    }

  });

}


// ======================================================
// ORDLISTA
// ======================================================

async function openWordList() {

  await loadWords();

  populateFilters();

  renderWordList();

  showPage("listPage");

}


// ======================================================
// FILTER
// ======================================================

function populateFilters() {

  const weeks =
    [
      ...new Set(
        words.map(
          function (w) {
            return w.week;
          }
        )
      )
    ];


  const years =
    [
      ...new Set(
        words.map(
          function (w) {
            return w.year;
          }
        )
      )
    ];


  const weekFilter =
    document.getElementById(
      "weekFilter"
    );


  const yearFilter =
    document.getElementById(
      "yearFilter"
    );


  const quizWeek =
    document.getElementById(
      "quizWeek"
    );


  const quizYear =
    document.getElementById(
      "quizYear"
    );


  weekFilter.innerHTML =
    "<option value=''>Alla veckor</option>";


  yearFilter.innerHTML =
    "<option value=''>Alla år</option>";


  quizWeek.innerHTML =
    "<option value=''>Vecka</option>";


  quizYear.innerHTML =
    "<option value=''>År</option>";


  weeks
    .sort(function (a, b) {

      return Number(a) - Number(b);

    })
    .forEach(function (w) {

      weekFilter.innerHTML +=
        `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`;

      quizWeek.innerHTML +=
        `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`;

    });


  years
    .sort(function (a, b) {

      return Number(a) - Number(b);

    })
    .forEach(function (y) {

      yearFilter.innerHTML +=
        `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`;

      quizYear.innerHTML +=
        `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`;

    });

}


// ======================================================
// VISA ORDLISTA
// ======================================================

function renderWordList() {

  const container =
    document.getElementById(
      "wordContainer"
    );


  if (!container) {

    return;

  }


  container.innerHTML = "";


  let list =
    [...words];


  const selectedWeek =
    document.getElementById(
      "weekFilter"
    ).value;


  const selectedYear =
    document.getElementById(
      "yearFilter"
    ).value;


  // ----------------------------------------------------
  // FILTRERA VECKA
  // ----------------------------------------------------

  if (selectedWeek !== "") {

    list =
      list.filter(function (item) {

        return (
          String(item.week)
            .trim()
          ===
          String(selectedWeek)
            .trim()
        );

      });

  }


  // ----------------------------------------------------
  // FILTRERA ÅR
  // ----------------------------------------------------

  if (selectedYear !== "") {

    list =
      list.filter(function (item) {

        return (
          String(item.year)
            .trim()
          ===
          String(selectedYear)
            .trim()
        );

      });

  }


  // ----------------------------------------------------
  // SORTERING
  // ----------------------------------------------------

  const sort =
    document.getElementById(
      "sortSelect"
    ).value;


  // A–Ö

  if (sort === "az") {

    list.sort(function (a, b) {

      return String(a.word)
        .localeCompare(
          String(b.word),
          "sv"
        );

    });

  }


  // NYAST FÖRST

  if (sort === "newest") {

    list.sort(function (a, b) {

      return (
        Number(b.row)
        -
        Number(a.row)
      );

    });

  }


  // ÄLDSTA FÖRST

  if (sort === "oldest") {

    list.sort(function (a, b) {

      return (
        Number(a.row)
        -
        Number(b.row)
      );

    });

  }


  // ----------------------------------------------------
  // INGA ORD
  // ----------------------------------------------------

  if (list.length === 0) {

    container.innerHTML =
      "<p>Inga ord hittades för det valda filtret.</p>";

    return;

  }


  // ----------------------------------------------------
  // VISA ORD
  // ----------------------------------------------------

  list.forEach(function (item) {

    container.innerHTML += `

      <div class="word-card">

        <h3>
          ${escapeHtml(item.word)}
        </h3>

        <p>
          <b>Betydelse:</b><br>
          ${escapeHtml(item.meaning)}
        </p>

        <p>
          <b>Exempel:</b><br>
          ${escapeHtml(
            item.example || "-"
          )}
        </p>

        <p>
          <b>Döljs:</b><br>
          ${escapeHtml(
            item.hide || "-"
          )}
        </p>

        <p>
          Vecka ${escapeHtml(item.week)}
          &nbsp;
          År ${escapeHtml(item.year)}
        </p>

        <button
          onclick="startEdit('${escapeJs(item.id)}')"
        >
          Ändra
        </button>

        <button
          onclick="deleteWord('${escapeJs(item.id)}')"
        >
          Ta bort
        </button>

      </div>

    `;

  });

}


// ======================================================
// ÄNDRA ORD
// ======================================================

function startEdit(id) {

  const item =
    words.find(function (w) {

      return (
        String(w.id)
        ===
        String(id)
      );

    });


  if (!item) {

    alert(
      "Ordet hittades inte."
    );

    return;

  }


  const container =
    document.getElementById(
      "wordContainer"
    );


  container.innerHTML = `

    <div class="word-card">

      <input
        id="editWord"
        value="${escapeHtml(item.word)}"
      >

      <textarea
        id="editMeaning"
      >${escapeHtml(item.meaning)}</textarea>

      <textarea
        id="editExample"
      >${escapeHtml(
        item.example || ""
      )}</textarea>

      <input
        id="editHide"
        value="${escapeHtml(
          item.hide || ""
        )}"
      >

      <input
        id="editWeek"
        type="number"
        value="${escapeHtml(item.week)}"
      >

      <input
        id="editYear"
        type="number"
        value="${escapeHtml(item.year)}"
      >

      <button
        onclick="saveEdit('${escapeJs(item.id)}')"
      >
        Spara ändring
      </button>

      <button
        onclick="renderWordList()"
      >
        Avbryt
      </button>

    </div>

  `;

}


// ======================================================
// SPARA ÄNDRING
// ======================================================

async function saveEdit(id) {

  if (!currentUser) {

    showPage("loginPage");

    return;

  }


  const updatedWord = {

    action: "edit",

    id: id,

    userId:
      currentUser.userId,

    word:
      document.getElementById(
        "editWord"
      ).value.trim(),

    meaning:
      document.getElementById(
        "editMeaning"
      ).value.trim(),

    example:
      document.getElementById(
        "editExample"
      ).value.trim(),

    hide:
      document.getElementById(
        "editHide"
      ).value.trim(),

    week:
      document.getElementById(
        "editWeek"
      ).value.trim(),

    year:
      document.getElementById(
        "editYear"
      ).value.trim()

  };


  if (
    !updatedWord.word ||
    !updatedWord.meaning ||
    !updatedWord.week ||
    !updatedWord.year
  ) {

    alert(
      "Fyll i obligatoriska fält."
    );

    return;

  }


  try {

    const result =
      await sendToSheet(
        updatedWord
      );


    if (result.status !== "ok") {

      throw new Error(
        result.message
        ||
        "Kunde inte ändra ordet."
      );

    }


    await loadWords();

    renderWordList();

  }
  catch (error) {

    console.error(error);

    alert(
      "Kunde inte ändra ordet."
    );

  }

}


// ======================================================
// TA BORT ORD
// ======================================================

async function deleteWord(id) {

  if (!currentUser) {

    showPage("loginPage");

    return;

  }


  if (
    !confirm(
      "Ta bort ordet?"
    )
  ) {

    return;

  }


  try {

    const result =
      await sendToSheet({

        action: "delete",

        id: id,

        userId:
          currentUser.userId

      });


    if (result.status !== "ok") {

      throw new Error(
        result.message
        ||
        "Kunde inte ta bort ordet."
      );

    }


    await loadWords();

    populateFilters();

    renderWordList();


    alert(
      "Ordet har tagits bort."
    );

  }
  catch (error) {

    console.error(error);

    alert(
      "Kunde inte ta bort ordet."
    );

  }

}


// ======================================================
// FÖRHÖR
// ======================================================

async function openQuizSetup() {

  await loadWords();

  populateFilters();

  showPage("quizPage");

}


// ======================================================
// STARTA FÖRHÖR
// ======================================================

function startQuiz() {

  document.getElementById(
    "startQuizButton"
  ).textContent =
    "Börja om";


  const selectedWeek =
    document.getElementById(
      "quizWeek"
    ).value;


  const selectedYear =
    document.getElementById(
      "quizYear"
    ).value;


  const order =
    document.getElementById(
      "quizOrder"
    ).value;


  quizWords =
    words.filter(function (w) {

      const weekMatches =
        selectedWeek === ""
        ||
        String(w.week)
          .trim()
        ===
        String(selectedWeek)
          .trim();


      const yearMatches =
        selectedYear === ""
        ||
        String(w.year)
          .trim()
        ===
        String(selectedYear)
          .trim();


      return (
        weekMatches &&
        yearMatches
      );

    });


  // ----------------------------------------------------
  // SLUMPAD ORDNING
  // ----------------------------------------------------

  if (order === "random") {

    quizWords.sort(function () {

      return Math.random() - 0.5;

    });

  }


  // ----------------------------------------------------
  // KRONOLOGISK ORDNING
  // ----------------------------------------------------

  else {

    quizWords.sort(function (a, b) {

      return (
        Number(a.row)
        -
        Number(b.row)
      );

    });

  }


  if (quizWords.length === 0) {

    alert(
      "Inga ord hittades."
    );

    return;

  }


  quizIndex = 0;


  document.getElementById(
    "quizSetup"
  ).style.display =
    "none";


  document.getElementById(
    "restartQuizButton"
  ).style.display =
    "block";


  document.getElementById(
    "quizSettingsButton"
  ).style.display =
    "block";


  showQuestion();

  updateQuizCounter();

}


// ======================================================
// FÖRHÖRSRÄKNARE
// ======================================================

function updateQuizCounter() {

  document.getElementById(
    "quizCounter"
  ).textContent =

    "Genomförda "
    +
    quizIndex
    +
    " av "
    +
    quizWords.length;

}


// ======================================================
// VISA FRÅGA
// ======================================================

function showQuestion() {

  const item =
    quizWords[quizIndex];


  let example =
    item.example || "-";


  if (item.hide) {

    try {

      example =
        example.replace(

          new RegExp(
            escapeRegExp(
              item.hide
            ),
            "gi"
          ),

          "_____"

        );

    }
    catch (error) {

      console.error(error);

    }

  }


  document.getElementById(
    "quizContent"
  ).innerHTML = `

    <p>
      <b>Betydelse:</b><br>
      ${escapeHtml(item.meaning)}
    </p>

    <p>
      <b>Exempel:</b><br>
      ${escapeHtml(example)}
    </p>

    <input
      id="answerInput"
      type="text"
      autocomplete="off"
      autofocus
    >

    <button
      onclick="checkAnswer()"
    >
      Svara
    </button>

    <div id="result"></div>

  `;


  setTimeout(function () {

    const input =
      document.getElementById(
        "answerInput"
      );


    if (input) {

      input.focus();

    }

  }, 50);

}


// ======================================================
// KONTROLLERA SVAR
// ======================================================

function checkAnswer() {

  const input =
    document.getElementById(
      "answerInput"
    );


  if (!input) {

    return;

  }


  const answer =
    input.value
      .trim()
      .toLowerCase();


  const correct =
    quizWords[quizIndex]
      .word
      .trim()
      .toLowerCase();


  const result =
    document.getElementById(
      "result"
    );


  if (answer === correct) {

    result.innerHTML =
      "Rätt ✓";

  }
  else {

    result.innerHTML =

      "Fel ✗ Rätt svar: "
      +
      escapeHtml(
        quizWords[quizIndex].word
      );

  }


  setTimeout(function () {

    quizIndex++;


    if (
      quizIndex >=
      quizWords.length
    ) {

      document.getElementById(
        "quizContent"
      ).innerHTML =
        "<h3>Förhör klart!</h3>";


      document.getElementById(
        "quizCounter"
      ).textContent =

        "Klart! "
        +
        quizWords.length
        +
        " av "
        +
        quizWords.length;


      return;

    }


    updateQuizCounter();

    showQuestion();

  }, 1200);

}


// ======================================================
// TILLBAKA TILL INSTÄLLNINGAR
// ======================================================

function backToQuizSettings() {

  quizWords = [];

  quizIndex = 0;


  document.getElementById(
    "quizContent"
  ).innerHTML = "";


  document.getElementById(
    "quizCounter"
  ).innerHTML = "";


  document.getElementById(
    "quizSetup"
  ).style.display =
    "block";


  document.getElementById(
    "restartQuizButton"
  ).style.display =
    "none";


  document.getElementById(
    "quizSettingsButton"
  ).style.display =
    "none";


  document.getElementById(
    "startQuizButton"
  ).textContent =
    "Starta";

}


// ======================================================
// ÅTERSTÄLL FÖRHÖR
// ======================================================

function resetQuiz() {

  quizWords = [];

  quizIndex = 0;


  const content =
    document.getElementById(
      "quizContent"
    );


  const counter =
    document.getElementById(
      "quizCounter"
    );


  if (content) {

    content.innerHTML = "";

  }


  if (counter) {

    counter.innerHTML = "";

  }


  const button =
    document.getElementById(
      "startQuizButton"
    );


  if (button) {

    button.textContent =
      "Starta";

  }


  const setup =
    document.getElementById(
      "quizSetup"
    );


  if (setup) {

    setup.style.display =
      "block";

  }


  const restart =
    document.getElementById(
      "restartQuizButton"
    );


  if (restart) {

    restart.style.display =
      "none";

  }


  const settings =
    document.getElementById(
      "quizSettingsButton"
    );


  if (settings) {

    settings.style.display =
      "none";

  }

}


// ======================================================
// ENTER = SVARA I FÖRHÖR
// ======================================================

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key !== "Enter"
    ) {

      return;

    }


    const quizPage =
      document.getElementById(
        "quizPage"
      );


    if (
      !quizPage ||
      !quizPage.classList.contains(
        "active"
      )
    ) {

      return;

    }


    const answerInput =
      document.getElementById(
        "answerInput"
      );


    if (!answerInput) {

      return;

    }


    event.preventDefault();

    checkAnswer();

  }
);


// ======================================================
// HJÄLPFUNKTIONER
// ======================================================

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeJs(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /"/g,
      '\\"'
    )

    .replace(
      /\n/g,
      "\\n"
    )

    .replace(
      /\r/g,
      "\\r"
    );

}


function escapeRegExp(value) {

  return String(value)
    .replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

}

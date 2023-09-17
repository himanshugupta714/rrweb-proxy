document.body.insertAdjacentHTML(
  "beforeend",
  '<button id="editBtn" style="position: fixed; top: 10px; right: 10px; z-index: 9999;">Edit</button>'
);

const editBtn = document.getElementById("editBtn");
let isEditing = false;
let originalData = {};
let originalOnclicks = new Map();
let originalHrefs = new Map();

editBtn.addEventListener("click", function () {
  isEditing = !isEditing;

  if (isEditing) {
    activateEditMode();
  } else {
    deactivateEditMode();
  }
});

function activateEditMode() {
  editBtn.textContent = "Save";

  // edit all elements that can be edited
  editElements("p");
  for (let i = 1; i <= 6; i++) {
    editElements(`h${i}`);
  }
  editElements("button:not(#editBtn)");
  editElements("a");

  const clickableElements = document.querySelectorAll("[onclick]");
  clickableElements.forEach((el) => {
    originalOnclicks.set(el, el.getAttribute("onclick"));
    el.removeAttribute("onclick");
  });

  const anchorElements = document.querySelectorAll("a");
  anchorElements.forEach((a) => {
    originalHrefs.set(a, a.getAttribute("href"));
    a.removeAttribute("href");
  });

  window.onbeforeunload = function () {
    return "You have unsaved changes. Are you sure you want to leave?";
  };
}

function deactivateEditMode() {
  editBtn.textContent = "Edit";

  saveAndStopEditingElements("p");

  for (let i = 1; i <= 6; i++) {
    saveAndStopEditingElements(`h${i}`);
  }

  saveAndStopEditingElements("button:not(#editBtn)");

  saveAndStopEditingElements("a");

  originalOnclicks.forEach((value, key) => {
    key.setAttribute("onclick", value);
  });

  originalHrefs.forEach((value, key) => {
    key.setAttribute("href", value);
  });

  window.onbeforeunload = null;
}

function editElements(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.setAttribute("contentEditable", "true");
    el.style.border = "1px dashed #333";

    originalData[el] = el.innerHTML;
  });
}

function saveAndStopEditingElements(selector) {
  const elements = document.querySelectorAll(selector);
  let hasConflict = false;
  elements.forEach((el) => {
    el.setAttribute("contentEditable", "false");
    el.style.border = "none";

    if (originalData[el] !== el.innerHTML) {
      hasConflict = true;
    }

    // Send
    const editedData = {
      type: "EDITED_DATA",
      tag: selector.toUpperCase(),
      content: el.innerHTML,
    };
    window.parent.postMessage(editedData, "*");
  });
}

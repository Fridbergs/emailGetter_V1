let extractButton = document.getElementById("extractButton");
let copyButton = document.getElementById("copyButton");
let list = document.getElementById("emailList");

// Set to store unique emails
let uniqueEmails = new Set();
let getButtonClicked = false;

// Handler to receive emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Get emails
  let emails = request.emails;

  // Filter out duplicates
  let newEmails = emails.filter((email) => !uniqueEmails.has(email));

  // Update the set with new emails
  newEmails.forEach((email) => uniqueEmails.add(email));

  // Display emails on popup
  list.innerHTML = ""; // Clear the existing list
  if (newEmails == null || newEmails.length == 0) {
    // No new emails
    let li = document.createElement("li");
    li.innerText = "No new emails found";
    list.appendChild(li);
  } else {
    // Display new unique emails
    newEmails.forEach((email) => {
      let li = document.createElement("li");
      li.innerText = email;
      list.appendChild(li);
    });
  }

  // Disable the "Get Emails" button after the first click
  if (!getButtonClicked) {
    extractButton.disabled = true;
    getButtonClicked = true;
    // Enable the "Copy Emails" button
    copyButton.disabled = false;
  }
});

// Buttons event listeners on click
extractButton.addEventListener("click", async () => {
  // Get the current active tab of our chrome window
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute the script to parse emails on the page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getEmailsFromPage,
  });
});

copyButton.addEventListener("click", () => {
  // Copy the extracted emails logic here
  // This button is enabled only after the emails have been extracted
  let emailsToCopy = Array.from(uniqueEmails).join("\n");
  // Perform the copy operation (You may need to adjust this based on your specific requirements)
  navigator.clipboard
    .writeText(emailsToCopy)
    .then(() => {
      console.log("Emails copied successfully!");
    })
    .catch((error) => {
      console.error("Error copying emails:", error);
    });
});

// Function to get emails
function getEmailsFromPage() {
  // RegEx to parse emails from HTML code
  const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;

  // Parse emails from the HTML of the page
  let emails = document.body.innerHTML.match(emailRegEx);

  // Send unique emails to popup
  chrome.runtime.sendMessage({ emails: Array.from(new Set(emails)) });
}

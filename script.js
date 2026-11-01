const memberForm = document.getElementById("memberForm");
const memberTableBody = document.getElementById("memberTableBody");
const jsonDisplay = document.getElementById("jsonDisplay");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const age = document.getElementById("age");
const affiliation = document.getElementById("affiliation");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const message = document.getElementById("message");

// Get existing members from localStorage.
// JSON.parse converts the stored JSON string back into an array.
let members = JSON.parse(localStorage.getItem("clubMembers")) || [];

let editingIndex = null;


// Display all members
function displayMembers() {
   memberTableBody.innerHTML = "";

   members.forEach(function(member, index) {
      const row = document.createElement("tr");

      row.innerHTML = `
         <td>${member.name}</td>
         <td>${member.email}</td>
         <td>${member.phone || "N/A"}</td>
         <td>${member.age}</td>
         <td>${member.affiliation}</td>
         <td>
            <button class="btn btn-sm btn-warning me-1"
                    onclick="editMember(${index})">
               Edit
            </button>

            <button class="btn btn-sm btn-danger"
                    onclick="deleteMember(${index})">
               Delete
            </button>
         </td>
      `;

      memberTableBody.appendChild(row);
   });

   displayJSON();
}


// Display member data as JSON
function displayJSON() {
   jsonDisplay.textContent = JSON.stringify(members, null, 2);
}


// Save members using JSON
function saveMembers() {
   const jsonData = JSON.stringify(members);

   localStorage.setItem("clubMembers", jsonData);

   displayMembers();
}


// Form submission
memberForm.addEventListener("submit", function(event) {
   event.preventDefault();

   // Bootstrap/HTML validation
   if (!memberForm.checkValidity()) {
      memberForm.classList.add("was-validated");
      return;
   }

   // Additional JavaScript email validation
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if (!emailPattern.test(email.value)) {
      showMessage("Please enter a valid email address.", "danger");
      return;
   }

   // Create JavaScript object from form data
   const member = {
      name: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      age: Number(age.value),
      affiliation: affiliation.value.trim()
   };

   if (editingIndex === null) {
      // Add new member
      members.push(member);
      showMessage("Member added successfully!", "success");
   }
   else {
      // Update existing member
      members[editingIndex] = member;
      editingIndex = null;

      submitButton.textContent = "Add Member";
      cancelButton.classList.add("d-none");

      showMessage("Member updated successfully!", "success");
   }

   saveMembers();

   memberForm.reset();
   memberForm.classList.remove("was-validated");
});


// Edit an existing member
function editMember(index) {
   const member = members[index];

   fullName.value = member.name;
   email.value = member.email;
   phone.value = member.phone;
   age.value = member.age;
   affiliation.value = member.affiliation;

   editingIndex = index;

   submitButton.textContent = "Update Member";
   cancelButton.classList.remove("d-none");

   window.scrollTo({
      top: 0,
      behavior: "smooth"
   });
}


// Delete an existing member
function deleteMember(index) {
   const confirmed = confirm(
      "Are you sure you want to delete this member?"
   );

   if (confirmed) {
      members.splice(index, 1);

      saveMembers();

      showMessage("Member deleted.", "warning");
   }
}


// Cancel editing
cancelButton.addEventListener("click", function() {
   editingIndex = null;

   memberForm.reset();
   memberForm.classList.remove("was-validated");

   submitButton.textContent = "Add Member";
   cancelButton.classList.add("d-none");
});


// Display Bootstrap alert
function showMessage(text, type) {
   message.innerHTML = `
      <div class="alert alert-${type}" role="alert">
         ${text}
      </div>
   `;
}


// Load existing members when page opens
displayMembers();
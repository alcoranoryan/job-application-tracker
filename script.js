// Load jobs from localStorage or start with an empty array
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

// Get references to DOM elements
const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const search = document.getElementById("search");

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const deadlineInput = document.getElementById("deadline");

// Track whether we are editing an existing job
let editIndex = null;

// Save jobs to localStorage
function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

// Render jobs in the table, with optional search filter
function renderJobs(filter = "") {
  jobList.innerHTML = "";

  jobs
    .filter(job =>
      job.company.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach((job, index) => {
      jobList.innerHTML += `
        <tr>
          <td>${job.company}</td>
          <td>${job.role}</td>
          <td>${job.status}</td>
          <td>${job.deadline}</td>
          <td>
            <button onclick="editJob(${index})">Edit</button>
            <button onclick="deleteJob(${index})">Delete</button>
          </td>
        </tr>
      `;
    });
}

// Handle form submission (add or update job)
form.addEventListener("submit", e => {
  e.preventDefault();

  const job = {
    company: companyInput.value,
    role: roleInput.value,
    status: statusInput.value,
    deadline: deadlineInput.value
  };

  if (editIndex !== null) {
    // Update existing job
    jobs[editIndex] = job;
    editIndex = null; // Reset edit mode
  } else {
    // Add new job
    jobs.push(job);
  }

  saveJobs();
  renderJobs();
  form.reset();
});

// Delete a job
function deleteJob(index) {
  jobs.splice(index, 1);
  saveJobs();
  renderJobs();
}

// Edit a job (populate form fields and set edit mode)
function editJob(index) {
  const job = jobs[index];

  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  deadlineInput.value = job.deadline;

  editIndex = index; // Mark which job is being edited
}

// Search jobs by company name
search.addEventListener("input", () => {
  renderJobs(search.value);
});

// Initial render
renderJobs();
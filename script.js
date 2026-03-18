let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const search = document.getElementById("search");

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const deadlineInput = document.getElementById("deadline");

let editIndex = null;
let sortConfig = { key: null, direction: "asc" };

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function renderJobs(filter = "") {
  jobList.innerHTML = "";

  let filteredJobs = jobs.filter(job =>
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  if (sortConfig.key) {
    filteredJobs.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "deadline") {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  filteredJobs.forEach((job, index) => {
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

  updateHeaderIndicators();
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const job = {
    company: companyInput.value,
    role: roleInput.value,
    status: statusInput.value,
    deadline: deadlineInput.value
  };

  if (editIndex !== null) {
    jobs[editIndex] = job;
    editIndex = null;
  } else {
    jobs.push(job);
  }

  saveJobs();
  renderJobs();
  form.reset();
});

function deleteJob(index) {
  jobs.splice(index, 1);
  saveJobs();
  renderJobs();
}

function editJob(index) {
  const job = jobs[index];
  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  deadlineInput.value = job.deadline;
  editIndex = index;
}

function sortTable(key) {
  if (sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.key = key;
    sortConfig.direction = "asc";
  }
  renderJobs(search.value);
}

function updateHeaderIndicators() {
  const headers = document.querySelectorAll("th.sortable");
  headers.forEach(header => {
    const key = header.dataset.key;
    if (sortConfig.key === key) {
      header.textContent =
        header.dataset.label +
        (sortConfig.direction === "asc" ? " ↑" : " ↓");
    } else {
      header.textContent = header.dataset.label + " ⇅";
    }
  });
}

search.addEventListener("input", () => {
  renderJobs(search.value);
});

renderJobs();
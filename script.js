let jobs = [];
let currentPage = 1;
let rowsPerPage = 10;

const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const search = document.getElementById("search");

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const deadlineInput = document.getElementById("deadline");
const linkInput = document.getElementById("link"); 
const resumeInput = document.getElementById("resume");

let editIndex = null;
let sortConfig = { key: null, direction: "asc" };

// Add link in filters (optional but safe)
let activeFilters = { company: [], role: [], status: [], deadline: [] };

// ---------------- API CALLS ----------------

async function fetchJobs() {
  const res = await fetch("http://localhost:3000/jobs");
  jobs = await res.json();
  renderJobs(search.value);
}

async function addJob(job) {
  await fetch("http://localhost:3000/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job)
  });
  fetchJobs();
}

async function deleteJob(id) {
  await fetch(`http://localhost:3000/jobs/${id}`, { method: "DELETE" });
  fetchJobs();
}

async function updateJob(id, job) {
  await fetch(`http://localhost:3000/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job)
  });
  fetchJobs();
}

// ---------------- RENDERING ----------------

function renderJobs(filter = "") {
  jobList.innerHTML = "";

  let filteredJobs = jobs.filter(job =>
    job.company.toLowerCase().includes(filter.toLowerCase()) ||
    job.role.toLowerCase().includes(filter.toLowerCase()) ||
    job.status.toLowerCase().includes(filter.toLowerCase())
  );

  Object.keys(activeFilters).forEach(key => {
    if (activeFilters[key].length > 0) {
      filteredJobs = filteredJobs.filter(job => activeFilters[key].includes(job[key]));
    }
  });

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

  // Pagination
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedJobs = filteredJobs.slice(start, end);

  paginatedJobs.forEach(job => {
  let resumeCell = "";
  if (job.resume) {
    const ext = job.resume.split(".").pop().toLowerCase();
    const resumeUrl = `http://localhost:3000${job.resume}`;
    if (ext === "pdf") {
      resumeCell = `<a href="${resumeUrl}" target="_blank">Preview</a>`;
    } else {
      resumeCell = `<a href="${resumeUrl}" download>Download</a>`;
    }
  }

  jobList.innerHTML += `
    <tr>
      <td>${job.company}</td>
      <td>${job.role}</td>
      <td>${job.status}</td>
      <td>${job.deadline}</td>
      <td>${job.link ? `<a href="${job.link}" target="_blank">View</a>` : ""}</td>
      <td>${resumeCell}</td>
      <td>
        <button onclick="editJob(${job.id})">Edit</button>
        <button onclick="deleteJob(${job.id})">Delete</button>
      </td>
    </tr>
  `;
});

  updateHeaderIndicators();
  renderPagination(filteredJobs.length);
}

function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (totalPages <= 1) return;

  pagination.innerHTML += `<button onclick="goToPage(1)">First</button>`;
  pagination.innerHTML += `<button onclick="goToPage(${Math.max(1, currentPage - 1)})"><</button>`;

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button class="${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
  }

  pagination.innerHTML += `<button onclick="goToPage(${Math.min(totalPages, currentPage + 1)})">></button>`;
  pagination.innerHTML += `<button onclick="goToPage(${totalPages})">Last</button>`;
}

function goToPage(page) {
  currentPage = page;
  renderJobs(search.value);
//}


  filteredJobs.forEach(job => {
    jobList.innerHTML += `
      <tr>
        <td>${job.company}</td>
        <td>${job.role}</td>
        <td>${job.status}</td>
        <td>${job.deadline}</td>
        <td>
          ${job.link ? `<a href="${job.link}" target="_blank">View</a>` : ""}
        </td>
        <td>
          ${job.resume 
            ? `<a href="http://localhost:3000${job.resume}" target="_blank">Download</a>` 
            : ""}
        </td>
        <td>
          <button onclick="editJob(${job.id})">Edit</button>
          <button onclick="deleteJob(${job.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  updateHeaderIndicators();
}

// ---------------- FORM ----------------

form.addEventListener("submit", async e => {
  e.preventDefault();

  let resumePath = "";
  if (resumeInput.files.length > 0) {
    const formData = new FormData();
    formData.append("resume", resumeInput.files[0]);

    const res = await fetch("http://localhost:3000/uploadResume", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    resumePath = data.path;
  }

  const job = {
    company: companyInput.value,
    role: roleInput.value,
    status: statusInput.value,
    deadline: deadlineInput.value,
    link: linkInput.value || "",
    resume: resumePath || "" // optional
  };

  if (editIndex !== null) {
    updateJob(editIndex, job);
    editIndex = null;
  } else {
    addJob(job);
  }

  form.reset();
});


function editJob(id) {
  const job = jobs.find(j => j.id === id);

  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  deadlineInput.value = job.deadline;
  linkInput.value = job.link || ""; // NEW

  editIndex = id;
}

// ---------------- SORTING ----------------

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
    let arrow = "⇅";
    if (sortConfig.key === key) {
      arrow = sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    header.innerHTML = `
      ${header.dataset.label} ${arrow}
      <button class="filter-btn" onclick="toggleFilter(event, '${key}')">▼</button>
    `;
  });
}

// ---------------- FILTERING ----------------

function toggleFilter(event, key) {
  event.stopPropagation();
  const menu = document.getElementById("filterMenu");
  menu.innerHTML = "";

  const values = [...new Set(jobs.map(job => job[key]))];

  const allChecked =
    activeFilters[key].length === 0 ||
    activeFilters[key].length === values.length;

  menu.innerHTML += `
    <label>
      <input type="checkbox" id="selectAll-${key}" ${allChecked ? "checked" : ""} onchange="toggleSelectAll('${key}')">
      (Select All)
    </label>
  `;

  values.forEach(val => {
    const checked = activeFilters[key].length === 0 || activeFilters[key].includes(val);
    menu.innerHTML += `
      <label>
        <input type="checkbox" value="${val}" ${checked ? "checked" : ""}>
        ${val}
      </label>
    `;
  });

  menu.innerHTML += `
    <button onclick="applyFilter('${key}')">Apply</button>
    <button onclick="clearFilter('${key}')">Clear Filter</button>
  `;

  const rect = event.target.getBoundingClientRect();
  menu.style.left = rect.left + window.scrollX + "px";
  menu.style.top = rect.bottom + window.scrollY + "px";
  menu.style.display = "block";
}

function applyFilter(key) {
  const menu = document.getElementById("filterMenu");
  const checkboxes = menu.querySelectorAll("input[type='checkbox'][value]");
  activeFilters[key] = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  menu.style.display = "none";
  renderJobs(search.value);
}

function clearFilter(key) {
  activeFilters[key] = [];
  const menu = document.getElementById("filterMenu");
  const checkboxes = menu.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => cb.checked = false);
  menu.style.display = "none";
  renderJobs(search.value);
}

function toggleSelectAll(key) {
  const menu = document.getElementById("filterMenu");
  const selectAll = document.getElementById(`selectAll-${key}`);
  const checkboxes = menu.querySelectorAll("input[type='checkbox'][value]");
  checkboxes.forEach(cb => {
    cb.checked = selectAll.checked;
  });
}

// Prevent closing when clicking inside menu
document.getElementById("filterMenu").addEventListener("click", (event) => {
  event.stopPropagation();
});

// Close filter menu when clicking outside
document.addEventListener("click", () => {
  document.getElementById("filterMenu").style.display = "none";
});

// ---------------- SEARCH ----------------

search.addEventListener("input", () => {
  const query = search.value.toLowerCase();
  renderJobs(query);

  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (query.length > 0) {
    const matches = [
      ...new Set(
        jobs
          .map(job => [job.company, job.role, job.status])
          .flat()
          .filter(val => val.toLowerCase().includes(query))
      )
    ];

    matches.forEach(match => {
      const div = document.createElement("div");
      div.textContent = match;
      div.onclick = () => {
        search.value = match;
        suggestionsBox.style.display = "none";
        renderJobs(match.toLowerCase());
      };
      suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = matches.length ? "block" : "none";
  } else {
    suggestionsBox.style.display = "none";
  }
});

// Initial load
fetchJobs();
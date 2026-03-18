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

// Track active filters for each column
let activeFilters = { company: [], role: [], status: [], deadline: [] };

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function renderJobs(filter = "") {
  jobList.innerHTML = "";

  let filteredJobs = jobs.filter(job =>
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  // Apply column filters
  Object.keys(activeFilters).forEach(key => {
    if (activeFilters[key].length > 0) {
      filteredJobs = filteredJobs.filter(job => activeFilters[key].includes(job[key]));
    }
  });

  // Apply sorting
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

// Show filter dropdown
function toggleFilter(event, key) {
  event.stopPropagation();
  const menu = document.getElementById("filterMenu");
  menu.innerHTML = "";

  // Get unique values for this column
  const values = [...new Set(jobs.map(job => job[key]))];

  // Add Select All checkbox
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

  // Add Apply and Clear Filter buttons
  menu.innerHTML += `
    <button onclick="applyFilter('${key}')">Apply</button>
    <button onclick="clearFilter('${key}')">Clear Filter</button>
  `;

  // Position menu near the clicked button
  const rect = event.target.getBoundingClientRect();
  menu.style.left = rect.left + window.scrollX + "px";
  menu.style.top = rect.bottom + window.scrollY + "px";
  menu.style.display = "block";
}

function toggleSelectAll(key) {
  const menu = document.getElementById("filterMenu");
  const selectAll = document.getElementById(`selectAll-${key}`);
  const checkboxes = menu.querySelectorAll("input[type='checkbox'][value]");

  checkboxes.forEach(cb => {
    cb.checked = selectAll.checked;
  });
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
  activeFilters[key] = []; // Reset filter for this column
  document.getElementById("filterMenu").style.display = "none";
  renderJobs(search.value);
}

// Close filter menu when clicking outside
document.addEventListener("click", () => {
  document.getElementById("filterMenu").style.display = "none";
});

  //for Autocomplete + Incremental + Live Search
search.addEventListener("input", () => {
  const query = search.value.toLowerCase();

  // Live search (real-time filtering)
  renderJobs(query);

  // Build suggestions (autocomplete/typeahead)
  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (query.length > 0) {
    // Collect unique matches from company, role, status
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

renderJobs();
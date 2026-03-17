let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const search = document.getElementById("search");

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

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

form.addEventListener("submit", e => {
  e.preventDefault();

  const job = {
    company: company.value,
    role: role.value,
    status: status.value,
    deadline: deadline.value
  };

  jobs.push(job);
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

  company.value = job.company;
  role.value = job.role;
  status.value = job.status;
  deadline.value = job.deadline;

  deleteJob(index);
}

search.addEventListener("input", () => {
  renderJobs(search.value);
});

renderJobs();
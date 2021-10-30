/**
 * Load project from the localStorage and update the projects select list.
 */
const loadProjects = () => {
  const projectSelect = document.getElementById('projectList');
  const projects = JSON.parse(localStorage.getItem('paystack-test-projects'));

  projects.forEach((project) => {
    const option = document.createElement('option');
    option.value = project.paystackKey;
    option.innerHTML = project.projectName;

    projectSelect.appendChild(option);
  });
};

/**
 * Update the project form with the values from the localStorage.
 * @param {Object} element The element object.
 * @returns {Void}
 */
function updateProjectForm(element) {
  const projectNameInput = element.options[element.selectedIndex].text;
  const projects = JSON.parse(localStorage.getItem('paystack-test-projects'));

  const project = projects.find(
    (localProject) => localProject.projectName === projectNameInput
  );

  if (!project) {
    return;
  }

  document.getElementById('projectId').value = project.projectId;
  document.getElementById('projectName').value = project.projectName;
  document.getElementById('paystackKey').value = project.paystackKey;
  document.getElementById('reference').value = project.reference;
  document.getElementById('verifyEndpoint').value = project.verifyEndpoint;
  document.getElementById('authToken').value = project.authToken;
}

/**
 * Update the project and save update to localStorage.
 * @param {String} projectId The project ID.
 * @param {Object} updatedValues The updated project values.
 */
const updateProject = (projectId, updatedValues) => {
  const projects = JSON.parse(localStorage.getItem('paystack-test-projects'));

  projects.find((localProject, i) => {
    if (localProject.projectId === projectId) {
      projects[i] = {
        projectId,
        ...updatedValues,
      };
      return true;
    }
  });

  localStorage.setItem('paystack-test-projects', JSON.stringify(projects));

  location.reload();
};

/**
 * Add a project to localStorage.
 * @param {Object} event The event object.
 * @returns {Void}
 */
const addProject = (event) => {
  event.preventDefault();

  const projectForm = document.getElementById('addProjectForm');
  const projectIdHiddenInput = document.getElementById('projectId').value;

  const projectName = document.getElementById('projectName').value;
  const paystackKey = document.getElementById('paystackKey').value;
  const reference = document.getElementById('reference').value;
  const verifyEndpoint = document.getElementById('verifyEndpoint').value;
  const authToken = document.getElementById('authToken').value;

  // If the project has an already existing ID, update the project instead.
  if (projectIdHiddenInput) {
    updateProject(projectIdHiddenInput, {
      projectName,
      paystackKey,
      reference,
      verifyEndpoint,
      authToken,
    });
    return;
  }

  const projectId = uuidv4();

  if (!projectName && !paystackKey) {
    console.log('Project name and paystack key are required.');
    return;
  }

  const project = {
    projectId,
    projectName,
    paystackKey,
    reference,
    verifyEndpoint,
    authToken,
  };

  // Get projects from localStorage.
  let projects = JSON.parse(localStorage.getItem('paystack-test-projects'));

  // Check if project exists in the localStorage.
  if (projects && projects.length) {
    // Search projects for existing project name.
    const isProjectExists = projects.some(
      (localProject) => localProject.projectName == project.projectName
    );

    if (!isProjectExists) {
      projects.push(project);
    }
  } else {
    projects = [project];
  }

  localStorage.setItem('paystack-test-projects', JSON.stringify(projects));

  location.reload();
};

/**
 * Get paystack key from localstorage or user input appropriately.
 * @returns {String} The paystack key.
 */
const getPaystackKey = () => {
  let paystackKeyInput = document.getElementById('paystackKey').value;
  let paystackKey = localStorage.getItem('paystackKey');

  // If both the local paystack key and the paystack key are empty, return null.
  if (!paystackKey && !paystackKeyInput) {
    return null;
  }

  // If there is a paystack key input, save it to the localstorage and return it.
  if ((!paystackKey && paystackKeyInput) || (paystackKey && paystackKeyInput)) {
    localStorage.setItem('paystackKey', paystackKeyInput);

    return paystackKeyInput;
  }

  return paystackKey;
};

/**
 * Pay with Paystack modal.
 * @param {Object} event The event object.
 * @returns {Void}
 */
const payWithPaystack = (event) => {
  event.preventDefault();

  const message = document.getElementById('message');
  const transactionText = document.getElementById('transactionReferenceText');

  message.classList.add('hidden');
  transactionText.classList.add('hidden');

  let amount = document.getElementById('amount').value;
  amount = amount * 100;

  const email = document.getElementById('email').value;
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;

  const paystackKey = getPaystackKey();

  const reference = document.getElementById('reference').value;
  const verifyEndpoint = document.getElementById('verifyEndpoint').value;
  const authToken = document.getElementById('authToken').value;

  let handler = PaystackPop.setup({
    key: paystackKey,
    email,
    amount,
    ref: reference || null,
    onClose: () => {
      message.classList.remove('hidden');
      message.innerText = 'An error occurred. Check console.';
    },
    callback: (response) => {
      if (verifyEndpoint && authToken) {
        axios
          .get(verifyEndpoint, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
          .then((res) => {
            console.log(res);
            message.classList.remove('hidden');
            message.innerText = 'An error occurred. Check console.';
          })
          .catch((err) => {
            console.log(err);
            message.classList.remove('hidden');
            message.innerText = 'An error occurred. Check console.';
          });
      }

      message.classList.remove('hidden');
      message.innerText = 'Payment Complete!';

      transactionText.classList.remove('hidden');
      transactionText.innerText = response.reference;
    },
  });

  handler.openIframe();
};

const paymentForm = document.getElementById('paymentForm');
const addProjectForm = document.getElementById('addProjectForm');
// const projectList = document.getElementById('projectList');

window.onload = () => {
  loadProjects();
};

// projectList.onchange = updateProjectForm;

paymentForm.addEventListener('submit', payWithPaystack, false);
addProjectForm.addEventListener('submit', addProject, false);

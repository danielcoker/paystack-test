/**
 * Add a project to localStorage.
 * @param {Object} event The event object.
 * @returns {Void}
 */
const addProject = (event) => {
  event.preventDefault();

  const projectForm = document.getElementById('addProjectForm');

  const projectId = uuidv4();
  const projectName = document.getElementById('projectName').value;
  const paystackKey = document.getElementById('paystackKey').value;
  const reference = document.getElementById('reference').value;
  const verifyEndpoint = document.getElementById('verifyEndpoint').value;
  const authToken = document.getElementById('authToken').value;

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

  projectForm.reset();
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

paymentForm.addEventListener('submit', payWithPaystack, false);
addProjectForm.addEventListener('submit', addProject, false);

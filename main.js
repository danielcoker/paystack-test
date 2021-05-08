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

paymentForm.addEventListener('submit', payWithPaystack, false);

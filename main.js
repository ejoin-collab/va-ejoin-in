// main.js — lightweight form handler with placeholders for Apps Script and UTM capture
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  const callNow = document.getElementById('call-now');
  const callMeBtn = document.getElementById('call-me');

  // === CONFIG: Insert your Apps Script Web App URL here ===
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  // Tel link placeholder — replace +1XXXXXXXXXX with your Twilio number
  const TEL_NUMBER = '+1XXXXXXXXXX';
  callNow.href = `tel:${TEL_NUMBER}`;
  callMeBtn.addEventListener('click', () => {
    window.location.href = `tel:${TEL_NUMBER}`;
  });

  // Set timestamp & capture UTM
  document.getElementById('timestamp').value = new Date().toISOString();
  const urlParams = new URLSearchParams(window.location.search);
  const utm = urlParams.get('utm_source') || urlParams.get('source') || '';
  document.getElementById('utm_source').value = utm;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    status.textContent = 'Sending…';
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      page: form.page.value,
      utm_source: form.utm_source.value,
      timestamp: form.timestamp.value
    };

    // basic validation
    if (!data.name || !data.phone || !data.message) {
      status.textContent = 'Please fill name, phone and message.';
      return;
    }

    try {
      // POST to Apps Script which will handle AI filtering & sheet logging
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Network response not ok');
      const json = await res.json();
      if (json && json.status === 'ok') {
        status.textContent = 'Thanks — your request is received. We will call to confirm shortly.';
        form.reset();
      } else if (json && json.status === 'spam') {
        status.textContent = 'Your request looks suspicious and was not submitted. If this is an error, please call us.';
      } else {
        status.textContent = 'Received — we will contact you soon.';
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'There was an error submitting. If it persists, please email va@ejoin.in';
    }
  });
});

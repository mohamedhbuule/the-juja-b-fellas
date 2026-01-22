// Contact Page Script
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
      }

      // Send contact form email
      const contactData = {
        to_email: 'mohamedhbuule2026@gmail.com',
        subject: `Contact Form Submission from ${name}`,
        message: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

Submitted at: ${new Date().toLocaleString()}
        `.trim()
      };

      // Try to send via EmailJS (if configured)
      if (typeof emailjs !== 'undefined') {
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
          to_email: contactData.to_email,
          subject: contactData.subject,
          message: contactData.message
        }).then(
          () => {
            alert('Message sent successfully! We will get back to you soon.');
            contactForm.reset();
          },
          (error) => {
            console.error('Email error:', error);
            alert('There was an error sending your message. Please try again later.');
          }
        );
      } else {
        // Fallback
        console.log('Contact Form Data:', contactData);
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }
});

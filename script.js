// Web3Forms Configuration: Paste your Web3Forms Access Key here or in index.html hidden input
const CONFIG = {
  WEB3FORMS_ACCESS_KEY: 'f2c435ae-37e8-451a-a439-5963c8d4f444' // Paste your real Web3Forms Access Key here
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const siteHeader = document.getElementById('siteHeader');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    });

    // Close menu when clicking links
    navMenu.querySelectorAll('.nav-link, .nav-btn-visit').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '&#9776;';
      });
    });
  }

  // 3. Active Nav Link Highlight on Scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // 4. Interactive Masterplan Filter & Plot Modal
  const filterBtns = document.querySelectorAll('.filter-btn');
  const plotCells = document.querySelectorAll('.plot-cell');
  const plotModal = document.getElementById('plotModal');
  const modalClose = document.getElementById('modalClose');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        plotCells.forEach(cell => {
          const category = cell.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            cell.style.display = 'flex';
          } else {
            cell.style.display = 'none';
          }
        });
      });
    });
  }

  // Plot cell click handler
  if (plotCells.length > 0 && plotModal) {
    plotCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const num = cell.getAttribute('data-num');
        const size = cell.getAttribute('data-size');
        const status = cell.getAttribute('data-status');

        document.getElementById('modalPlotTitle').innerText = `Farmland Plot #${num}`;
        document.getElementById('modalPlotSize').innerText = `${size} Sq. Ft.`;
        document.getElementById('modalPlotStatus').innerText = status;
        
        // Auto-select plot in site visit form
        const formPlotSelect = document.getElementById('preferredPlotSize');
        if (formPlotSelect) {
          formPlotSelect.value = parseInt(size, 10) >= 10000 ? '10,000+ Sq. Ft.' : '5,000 Sq. Ft.';
        }

        plotModal.classList.add('active');
      });
    });
  }

  if (modalClose && plotModal) {
    modalClose.addEventListener('click', () => {
      plotModal.classList.remove('active');
    });
    plotModal.addEventListener('click', (e) => {
      if (e.target === plotModal) {
        plotModal.classList.remove('active');
      }
    });
  }

  // 5. Site Visit Form Handler with Web3Forms & Error Handling
  const visitForm = document.getElementById('visitForm');
  const formSuccessModal = document.getElementById('formSuccessModal');
  const successClose = document.getElementById('successClose');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (visitForm) {
    visitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const keyInput = document.getElementById('web3forms_access_key');
      let accessKey = (keyInput ? keyInput.value : '').trim();

      // If key is set in CONFIG JS object, populate hidden input
      if (!accessKey && CONFIG.WEB3FORMS_ACCESS_KEY) {
        accessKey = CONFIG.WEB3FORMS_ACCESS_KEY.trim();
        if (keyInput) keyInput.value = accessKey;
      }

      if (!accessKey) {
        if (formStatus) {
          formStatus.className = 'form-status-msg error';
          formStatus.innerHTML = 'Form configuration pending: Please provide your Web3Forms Access Key to enable direct email submissions to sbmfarmlands@gmail.com.';
          formStatus.style.display = 'block';
        }
        return;
      }
      
      const name = document.getElementById('visitorName').value;
      const phone = document.getElementById('visitorPhone').value;
      const date = document.getElementById('visitDate').value;
      const size = document.getElementById('preferredPlotSize').value;
      const message = document.getElementById('visitorMessage').value;

      // Hide any previous status message
      if (formStatus) {
        formStatus.style.display = 'none';
        formStatus.className = 'form-status-msg';
        formStatus.innerHTML = '';
      }

      // Show loading state on submit button
      const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit Site Visit Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting Request...';
      }

      try {
        const formData = new FormData(visitForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Display success modal ONLY after successful submission
          if (formSuccessModal) {
            document.getElementById('successName').innerText = name;
            formSuccessModal.classList.add('active');
          }

          // Generate WhatsApp link prefilled
          const waMsg = encodeURIComponent(
            `Hello SBM Farmlands Team,\n\nI would like to book a site visit.\n` +
            `Name: ${name}\n` +
            `Phone: ${phone}\n` +
            `Preferred Date: ${date || 'To be confirmed'}\n` +
            `Plot Size Interest: ${size}\n` +
            `Notes: ${message || 'None'}`
          );
          
          const waBtn = document.getElementById('whatsappConfirmBtn');
          if (waBtn) {
            waBtn.setAttribute('href', `https://wa.me/919900007268?text=${waMsg}`);
          }

          visitForm.reset();
        } else {
          // Display error message if Web3Forms returns error (e.g. invalid key)
          if (formStatus) {
            formStatus.className = 'form-status-msg error';
            formStatus.innerHTML = result.message || 'There was an issue submitting your request. Please check your details or reach out on WhatsApp.';
            formStatus.style.display = 'block';
          }
        }
      } catch (err) {
        if (formStatus) {
          formStatus.className = 'form-status-msg error';
          formStatus.innerHTML = 'Unable to send request. Please check your internet connection or contact us directly on WhatsApp.';
          formStatus.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }

  if (successClose && formSuccessModal) {
    successClose.addEventListener('click', () => {
      formSuccessModal.classList.remove('active');
    });
    formSuccessModal.addEventListener('click', (e) => {
      if (e.target === formSuccessModal) {
        formSuccessModal.classList.remove('active');
      }
    });
  }
});

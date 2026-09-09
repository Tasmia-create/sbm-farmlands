/* ==========================================
   SBM FARMLANDS - INTERACTIVE FUNCTIONALITY
   ========================================== */

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
          formPlotSelect.value = size >= 10000 ? '10000+' : '5000';
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

  // 5. Site Visit Form Handler
  const visitForm = document.getElementById('visitForm');
  const formSuccessModal = document.getElementById('formSuccessModal');
  const successClose = document.getElementById('successClose');

  if (visitForm) {
    visitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('visitorName').value;
      const phone = document.getElementById('visitorPhone').value;
      const date = document.getElementById('visitDate').value;
      const size = document.getElementById('preferredPlotSize').value;
      const message = document.getElementById('visitorMessage').value;

      // Display success modal
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
        waBtn.setAttribute('href', `https://wa.me/916360540490?text=${waMsg}`);
      }

      visitForm.reset();
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

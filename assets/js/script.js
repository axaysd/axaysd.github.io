'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    testimonialsModalFunc();
  });
}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    // Use enhanced filter function instead of old filterFunc
    if (enhancedFilterFunc) {
      enhancedFilterFunc(selectedValue, "all");
    }
  });
}



// Initially show the no projects message
document.addEventListener("DOMContentLoaded", function() {
  const noProjectsMessage = document.getElementById("no-projects-message");
  noProjectsMessage.style.display = "block";

  // Hide all projects initially
  const projects = document.querySelectorAll("[data-filter-item]");
  projects.forEach(project => {
    project.style.display = "none";
  });
});



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove('active');
        navigationLinks[i].classList.remove('active');
      }
    }
  });
}

// Service items navigation to portfolio page
const serviceItems = document.querySelectorAll('.service-item');

serviceItems.forEach(item => {
  item.addEventListener('click', () => {
    // Deactivate all pages
    pages.forEach(page => {
      page.classList.remove('active');
    });

    // Deactivate all navigation links
    navigationLinks.forEach(navLink => {
      navLink.classList.remove('active');
    });

    // Activate the Portfolio page
    const portfolioPage = document.querySelector('[data-page="portfolio"]');
    portfolioPage.classList.add('active');

    // Activate the Portfolio navigation link
    const portfolioNavLink = document.querySelector('button[data-nav-link="Portfolio"]');
    if (portfolioNavLink) {
      portfolioNavLink.classList.add('active');
    }

    // Scroll to the top of the page or to the portfolio section
    window.scrollTo(0, 0);

    // Apply the corresponding filter using enhanced function
    if (item.querySelector('.service-item-title').textContent.includes('Data')) {
      enhancedFilterFunc('data analytics', 'all');
    } else if (item.querySelector('.service-item-title').textContent.includes('Product')) {
      enhancedFilterFunc('product management', 'all');
    } else if (item.querySelector('.service-item-title').textContent.includes('AI')) {
      enhancedFilterFunc('ai', 'all');
    }
  });
});

// Enhanced filter function with subfilters (global scope)
let enhancedFilterFunc;

// Project filter functionality
document.addEventListener("DOMContentLoaded", function() {
  const productManagementButton = document.getElementById("product-management");
  const aiButton = document.getElementById("ai");
  const dataAnalyticsButton = document.getElementById("data-analytics");

  const projects = document.querySelectorAll("[data-filter-item]");
  const buttons = [productManagementButton, aiButton, dataAnalyticsButton];

  // Enhanced filter function with subfilters
  enhancedFilterFunc = function(category, subfilter = "all") {
    let hasVisibleProjects = false;
    
    projects.forEach(project => {
      const projectCategory = project.getAttribute("data-category");
      const projectType = project.getAttribute("data-project-type");
      
      if (projectCategory === category) {
        if (subfilter === "all" || projectType === subfilter) {
          project.style.display = "block";
          hasVisibleProjects = true;
        } else {
          project.style.display = "none";
        }
      } else {
        project.style.display = "none";
      }
    });

    // Show or hide the no projects message
    const noProjectsMessage = document.getElementById("no-projects-message");
    if (hasVisibleProjects) {
      noProjectsMessage.style.display = "none";
    } else {
      noProjectsMessage.style.display = "block";
    }

    // Update main filter buttons and show appropriate subfilters
    buttons.forEach(button => button.classList.remove("active"));
    if (category === "product management") {
      productManagementButton.classList.add("active");
      showProductSubfilters();
    } else if (category === "ai") {
      aiButton.classList.add("active");
      showAISubfilters();
    } else if (category === "data analytics") {
      dataAnalyticsButton.classList.add("active");
      showDataAnalyticsSubfilters();
    }
  };

  // Update main filter button event listeners
  productManagementButton.addEventListener("click", function() {
    enhancedFilterFunc("product management", "all");
  });

  aiButton.addEventListener("click", function() {
    enhancedFilterFunc("ai", "all");
  });

  dataAnalyticsButton.addEventListener("click", function() {
    enhancedFilterFunc("data analytics", "all");
  });

  // Initially hide all projects
  projects.forEach(project => {
    project.style.display = "none";
  });

  // Subfilter functionality for all three categories
  const productSubfilters = document.getElementById("product-subfilters");
  const aiSubfilters = document.getElementById("ai-subfilters");
  const dataAnalyticsSubfilters = document.getElementById("data-analytics-subfilters");
  const productSubfilterButtons = document.querySelectorAll("#product-subfilters [data-subfilter]");
  const aiSubfilterButtons = document.querySelectorAll("#ai-subfilters [data-subfilter]");
  const dataAnalyticsSubfilterButtons = document.querySelectorAll("#data-analytics-subfilters [data-subfilter]");
  
  // Show/hide subfilters functions
  function showProductSubfilters() {
    productSubfilters.style.display = "block";
    aiSubfilters.style.display = "none";
    dataAnalyticsSubfilters.style.display = "none";
  }
  
  function showAISubfilters() {
    aiSubfilters.style.display = "block";
    productSubfilters.style.display = "none";
    dataAnalyticsSubfilters.style.display = "none";
  }
  
  function showDataAnalyticsSubfilters() {
    dataAnalyticsSubfilters.style.display = "block";
    productSubfilters.style.display = "none";
    aiSubfilters.style.display = "none";
  }
  
  function hideAllSubfilters() {
    productSubfilters.style.display = "none";
    aiSubfilters.style.display = "none";
    dataAnalyticsSubfilters.style.display = "none";
    // Reset all subfilter buttons
    productSubfilterButtons.forEach(btn => btn.classList.remove("active"));
    aiSubfilterButtons.forEach(btn => btn.classList.remove("active"));
    dataAnalyticsSubfilterButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector('#product-subfilters [data-subfilter="all"]').classList.add("active");
    document.querySelector('#ai-subfilters [data-subfilter="all"]').classList.add("active");
    document.querySelector('#data-analytics-subfilters [data-subfilter="all"]').classList.add("active");
  }

  // Add subfilter event listeners for all categories
  productSubfilterButtons.forEach(button => {
    button.addEventListener("click", function() {
      const subfilter = this.getAttribute("data-subfilter");
      
      // Update Product Management subfilter button states
      productSubfilterButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      
      // Apply subfilter
      enhancedFilterFunc("product management", subfilter);
    });
  });
  
  aiSubfilterButtons.forEach(button => {
    button.addEventListener("click", function() {
      const subfilter = this.getAttribute("data-subfilter");
      
      // Update AI subfilter button states
      aiSubfilterButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      
      // Apply subfilter
      enhancedFilterFunc("ai", subfilter);
    });
  });
  
  dataAnalyticsSubfilterButtons.forEach(button => {
    button.addEventListener("click", function() {
      const subfilter = this.getAttribute("data-subfilter");
      
      // Update Data Analytics subfilter button states
      dataAnalyticsSubfilterButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      
      // Apply subfilter
      enhancedFilterFunc("data analytics", subfilter);
    });
  });
});
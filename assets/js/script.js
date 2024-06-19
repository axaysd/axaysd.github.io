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
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
      filterItems[i].style.display = "block";
    } else {
      filterItems[i].classList.remove("active");
      filterItems[i].style.display = "none";
    }
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);
    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

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

    // Apply the corresponding filter
    if (item.querySelector('.service-item-title').textContent.includes('Data')) {
      filterFunc('data analytics');
      document.getElementById("data-analytics").classList.add("active");
    } else if (item.querySelector('.service-item-title').textContent.includes('Product')) {
      filterFunc('product management');
      document.getElementById("product-management").classList.add("active");
    } else if (item.querySelector('.service-item-title').textContent.includes('AI')) {
      filterFunc('ai');
      document.getElementById("ai").classList.add("active");
    }
  });
});

// Project filter functionality
document.addEventListener("DOMContentLoaded", function() {
  const productManagementButton = document.getElementById("product-management");
  const aiButton = document.getElementById("ai");
  const dataAnalyticsButton = document.getElementById("data-analytics");

  const projects = document.querySelectorAll("[data-filter-item]");
  const buttons = [productManagementButton, aiButton, dataAnalyticsButton];

  function filterProjects(category) {
    projects.forEach(project => {
      if (project.getAttribute("data-category") === category) {
        project.style.display = "block";
      } else {
        project.style.display = "none";
      }
    });

    buttons.forEach(button => button.classList.remove("active"));
    if (category === "product management") {
      productManagementButton.classList.add("active");
    } else if (category === "ai") {
      aiButton.classList.add("active");
    } else if (category === "data analytics") {
      dataAnalyticsButton.classList.add("active");
    }
  }

  productManagementButton.addEventListener("click", function() {
    filterProjects("product management");
  });

  aiButton.addEventListener("click", function() {
    filterProjects("ai");
  });

  dataAnalyticsButton.addEventListener("click", function() {
    filterProjects("data analytics");
  });

  // Initially hide all projects
  projects.forEach(project => {
    project.style.display = "none";
  });
});

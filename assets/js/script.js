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
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
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
    for (let j = 0; j < pages.length; j++) {
      if (this.innerHTML.toLowerCase() === pages[j].dataset.page) {
        pages[j].classList.add("active");
        navigationLinks[j].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove("active");
        navigationLinks[j].classList.remove("active");
      }
    }
  });
}

// Portfolio navigation link
const portfolioBtn = document.querySelector('button[data-nav-link="portfolio"]');
portfolioBtn.addEventListener('click', function() {
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
});

document.addEventListener("DOMContentLoaded", function() {
    const dataAnalyticsBtn = document.getElementById("btn-data-analytics");
    const productManagementBtn = document.getElementById("btn-product-management");
    const aiBtn = document.getElementById("btn-ai");

    const dataAnalyticsSection = document.getElementById("data-analytics-projects");
    const productManagementSection = document.getElementById("product-management-projects");
    const aiSection = document.getElementById("ai-projects");

    dataAnalyticsBtn.addEventListener("click", function() {
        dataAnalyticsSection.style.display = "block";
        productManagementSection.style.display = "none";
        aiSection.style.display = "none";
    });

    productManagementBtn.addEventListener("click", function() {
        productManagementSection.style.display = "block";
        dataAnalyticsSection.style.display = "none";
        aiSection.style.display = "none";
    });

    aiBtn.addEventListener("click", function() {
        aiSection.style.display = "block";
        dataAnalyticsSection.style.display = "none";
        productManagementSection.style.display = "none";
    });

    // Optionally, hide all sections initially
    dataAnalyticsSection.style.display = "none";
    productManagementSection.style.display = "none";
    aiSection.style.display = "none";
});

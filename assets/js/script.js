'use strict';

// PostHog Analytics Helper Functions
const posthogTracking = {
  // User identification and engagement scoring
  userEngagement: {
    score: 0,
    interactions: 0,
    projectsViewed: new Set(),
    timeOnSite: 0,
    firstVisit: Date.now(),
    isIdentified: false
  },

  // Calculate engagement score based on user behavior
  calculateEngagementScore: function() {
    let score = 0;
    score += this.userEngagement.interactions * 2;
    score += this.userEngagement.projectsViewed.size * 5;
    score += Math.min(this.userEngagement.timeOnSite / 60, 10); // Max 10 points for time
    score += this.userEngagement.scrollDepth || 0;
    return Math.round(score);
  },

  // Identify user when they show high intent
  identifyUser: function(context = 'high_intent') {
    if (!this.userEngagement.isIdentified && typeof posthog !== 'undefined') {
      const distinctId = posthog.get_distinct_id();
      const userProperties = {
        source: 'portfolio_website',
        first_visit: new Date(this.userEngagement.firstVisit).toISOString(),
        engagement_score: this.calculateEngagementScore(),
        projects_viewed: Array.from(this.userEngagement.projectsViewed),
        total_interactions: this.userEngagement.interactions,
        identification_context: context
      };
      
      posthog.identify(distinctId, userProperties);
      this.userEngagement.isIdentified = true;
      
      // Track identification event
      this.trackInteraction('user_identified', {
        engagement_score: userProperties.engagement_score,
        identification_context: context,
        time_to_identify: Date.now() - this.userEngagement.firstVisit
      });
    }
  },

  // Track user interactions
  trackInteraction: function(eventName, properties = {}) {
    if (typeof posthog !== 'undefined' && posthog.capture && !posthog.has_opted_out_capturing()) {
      try {
        // Increment interaction counter
        this.userEngagement.interactions++;
        
        // Auto-identify for high-value interactions
        if (['contact_interaction', 'meeting_scheduled', 'email_contact'].includes(eventName)) {
          this.identifyUser('conversion_intent');
        } else if (this.userEngagement.interactions >= 5) {
          this.identifyUser('high_engagement');
        }
        
        posthog.capture(eventName, {
          ...properties,
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          page_title: document.title,
          engagement_score: this.calculateEngagementScore(),
          session_id: posthog.get_session_id(),
          user_identified: this.userEngagement.isIdentified
        });
      } catch (error) {
        // Silently handle tracking errors
        return;
      }
    }
  },

  // Track navigation events
  trackNavigation: function(fromPage, toPage, method = 'click') {
    this.trackInteraction('navigation', {
      from_page: fromPage,
      to_page: toPage,
      navigation_method: method
    });
  },

  // Track portfolio interactions with enhanced tracking
  trackPortfolioInteraction: function(action, projectTitle, projectCategory, projectType, properties = {}) {
    // Add to projects viewed set for engagement scoring
    if (action === 'project_viewed' || action === 'project_clicked') {
      this.userEngagement.projectsViewed.add(projectTitle);
    }
    
    this.trackInteraction('portfolio_interaction', {
      action: action,
      project_title: projectTitle,
      project_category: projectCategory,
      project_type: projectType,
      projects_viewed_count: this.userEngagement.projectsViewed.size,
      engagement_score: this.calculateEngagementScore(),
      ...properties
    });
    
    // Track content performance
    this.trackContentPerformance('portfolio_project', projectTitle, action, {
      category: projectCategory,
      type: projectType
    });
    
    // Track micro-conversions for project engagement
    if (action === 'project_clicked') {
      this.trackMicroConversion('project_engagement', {
        project_title: projectTitle,
        category: projectCategory
      });
    }
  },

  // Track external link clicks
  trackExternalLink: function(url, linkText, context) {
    this.trackInteraction('external_link_click', {
      url: url,
      link_text: linkText,
      context: context
    });
  },

  // Track contact interactions
  trackContactInteraction: function(action, details = {}) {
    this.trackInteraction('contact_interaction', {
      action: action,
      ...details
    });
  },

  // Track filter usage
  trackFilterUsage: function(category, subfilter) {
    this.trackInteraction('filter_used', {
      category: category,
      subfilter: subfilter,
      funnel_step: 'portfolio_exploration'
    });
  },

  // Track funnel progression
  trackFunnelStep: function(step, properties = {}) {
    this.trackInteraction('funnel_step', {
      funnel_step: step,
      session_id: typeof posthog !== 'undefined' ? posthog.get_session_id() : null,
      ...properties
    });
  },

  // Track portfolio engagement
  trackPortfolioEngagement: function(action, details = {}) {
    this.trackInteraction('portfolio_engagement', {
      action: action,
      funnel_step: 'portfolio_interaction',
      session_id: typeof posthog !== 'undefined' ? posthog.get_session_id() : null,
      ...details
    });
  },

  // Track conversion events with value and lead scoring
  trackConversion: function(type, value = null, properties = {}) {
    const conversionValues = {
      'email_contact': 50,
      'phone_contact': 75,
      'meeting_scheduled': 100,
      'resume_download': 25,
      'github_follow': 30,
      'linkedin_connect': 40
    };
    
    const conversionValue = value || conversionValues[type] || 0;
    
    this.trackInteraction('conversion', {
      conversion_type: type,
      conversion_value: conversionValue,
      funnel_step: 'conversion',
      session_id: typeof posthog !== 'undefined' ? posthog.get_session_id() : null,
      engagement_score: this.calculateEngagementScore(),
      lead_quality: this.calculateLeadQuality(),
      ...properties
    });
    
    // Track high-value conversions separately
    if (conversionValue >= 75) {
      this.trackInteraction('high_value_conversion', {
        conversion_type: type,
        conversion_value: conversionValue,
        engagement_score: this.calculateEngagementScore()
      });
    }
  },

  // Calculate lead quality based on behavior patterns
  calculateLeadQuality: function() {
    let quality = 'cold';
    const score = this.calculateEngagementScore();
    const projectsViewed = this.userEngagement.projectsViewed.size;
    
    if (score >= 50 && projectsViewed >= 3) {
      quality = 'hot';
    } else if (score >= 25 && projectsViewed >= 2) {
      quality = 'warm';
    } else if (score >= 10) {
      quality = 'lukewarm';
    }
    
    return quality;
  },

  // Track micro-conversions (smaller engagement milestones)
  trackMicroConversion: function(type, properties = {}) {
    this.trackInteraction('micro_conversion', {
      micro_conversion_type: type,
      engagement_score: this.calculateEngagementScore(),
      ...properties
    });
  },

  // Track content performance
  trackContentPerformance: function(contentType, contentId, action, properties = {}) {
    this.trackInteraction('content_interaction', {
      content_type: contentType,
      content_id: contentId,
      action: action,
      engagement_score: this.calculateEngagementScore(),
      ...properties
    });
  },

  // Track funnel drop-offs
  trackFunnelDropoff: function(funnelStep, timeSpent, lastAction) {
    this.trackInteraction('funnel_dropoff', {
      funnel_step: funnelStep,
      time_spent_seconds: timeSpent,
      last_action: lastAction,
      engagement_score: this.calculateEngagementScore(),
      projects_viewed: this.userEngagement.projectsViewed.size
    });
  },

  // Feature flags and A/B testing
  getFeatureFlag: function(flagName, defaultValue = false) {
    if (typeof posthog !== 'undefined' && posthog.getFeatureFlag) {
      return posthog.getFeatureFlag(flagName) || defaultValue;
    }
    return defaultValue;
  },

  // Track feature flag exposure
  trackFeatureFlagExposure: function(flagName, flagValue, properties = {}) {
    this.trackInteraction('feature_flag_exposure', {
      flag_name: flagName,
      flag_value: flagValue,
      ...properties
    });
  },

  // A/B test different CTAs
  getOptimalCTA: function() {
    const ctaTest = this.getFeatureFlag('cta_test_variant', 'control');
    
    if (ctaTest === 'variant_a') {
      return {
        text: '🚀 Let\'s Build Something Amazing',
        style: 'primary',
        variant: 'a'
      };
    } else if (ctaTest === 'variant_b') {
      return {
        text: '💡 Ready to Scale with AI?',
        style: 'secondary',
        variant: 'b'
      };
    } else {
      return {
        text: '📞 Schedule a meeting',
        style: 'default',
        variant: 'control'
      };
    }
  },

  // Track A/B test conversions
  trackABTestConversion: function(testName, variant, conversionType) {
    this.trackInteraction('ab_test_conversion', {
      test_name: testName,
      variant: variant,
      conversion_type: conversionType,
      engagement_score: this.calculateEngagementScore()
    });
  }
};

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { 
  elementToggleFunc(sidebar);
  posthogTracking.trackInteraction('sidebar_toggle', {
    sidebar_state: sidebar.classList.contains('active') ? 'opened' : 'closed'
  });
});

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
    const currentActivePage = document.querySelector('[data-page].active');
    const targetPage = this.innerHTML.toLowerCase();
    
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
        
        // Track navigation
        posthogTracking.trackNavigation(
          currentActivePage ? currentActivePage.dataset.page : 'unknown',
          targetPage,
          'navigation_click'
        );
        
        // Track funnel progression
        posthogTracking.trackFunnelStep('navigation', {
          from_page: currentActivePage ? currentActivePage.dataset.page : 'unknown',
          to_page: targetPage
        });
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
    const currentActivePage = document.querySelector('[data-page].active');
    const serviceTitle = item.querySelector('.service-item-title').textContent;
    let targetCategory = 'unknown';
    
    // Determine target category
    if (serviceTitle.includes('Data')) {
      targetCategory = 'data analytics';
    } else if (serviceTitle.includes('Product')) {
      targetCategory = 'product management';
    } else if (serviceTitle.includes('AI')) {
      targetCategory = 'ai';
    }
    
    // Track service item click
    posthogTracking.trackInteraction('service_item_click', {
      service_title: serviceTitle,
      target_category: targetCategory,
      from_page: currentActivePage ? currentActivePage.dataset.page : 'unknown'
    });
    
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
    if (serviceTitle.includes('Data')) {
      enhancedFilterFunc('data analytics', 'all');
    } else if (serviceTitle.includes('Product')) {
      enhancedFilterFunc('product management', 'all');
    } else if (serviceTitle.includes('AI')) {
      enhancedFilterFunc('ai', 'all');
    }
  });
});

// Enhanced filter function with subfilters (global scope)
let enhancedFilterFunc;

// Dynamic count calculation function
function updateProjectCounts() {
  const projects = document.querySelectorAll("[data-filter-item]");
  
  // Count projects by category and type
  const counts = {
    'product management': { all: 0, projects: 0, learnings: 0, 'case-studies': 0 },
    'ai': { all: 0, projects: 0, learnings: 0 },
    'data analytics': { all: 0, projects: 0, learnings: 0, 'case-studies': 0 }
  };
  
  projects.forEach(project => {
    const category = project.getAttribute("data-category");
    const type = project.getAttribute("data-project-type");
    
    if (counts[category]) {
      counts[category].all++;
      if (counts[category][type] !== undefined) {
        counts[category][type]++;
      }
    }
  });
  
  // Update count badges
  Object.keys(counts).forEach(category => {
    const categoryKey = category.replace(' ', '-');
    const subfilterContainer = document.getElementById(`${categoryKey}-subfilters`);
    
    if (subfilterContainer) {
      const countBadges = subfilterContainer.querySelectorAll('.count-badge');
      const subfilterButtons = subfilterContainer.querySelectorAll('[data-subfilter]');
      
      subfilterButtons.forEach(button => {
        const subfilter = button.getAttribute('data-subfilter');
        const count = counts[category][subfilter] || 0;
        const badge = button.querySelector('.count-badge');
        if (badge) {
          badge.textContent = `(${count})`;
        }
      });
    }
  });
}

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
    
    // Track filter usage
    posthogTracking.trackFilterUsage(category, subfilter);
    
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
  
  // Update project counts dynamically
  updateProjectCounts();

  // Add tracking for all portfolio project clicks
  projects.forEach(project => {
    const projectLink = project.querySelector('a');
    if (projectLink) {
      projectLink.addEventListener('click', function(e) {
        const projectTitle = project.querySelector('.project-title').textContent;
        const projectCategory = project.getAttribute('data-category');
        const projectType = project.getAttribute('data-project-type');
        const projectUrl = this.href;
        
        // Track portfolio project click
        posthogTracking.trackPortfolioInteraction('project_clicked', projectTitle, projectCategory, projectType);
        
        // Track external link if it's external
        if (projectUrl && (projectUrl.startsWith('http') && !projectUrl.includes(window.location.hostname))) {
          posthogTracking.trackExternalLink(projectUrl, projectTitle, 'portfolio_project');
        }
      });
    }
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
// Shared component fallbacks keep the site readable even when local file previews block fetch().
const inlineComponents = {
  "components/header.html": `
    <header class="site-header">
      <div class="container nav-shell">
        <!-- Brand / logo -->
        <a class="brand shared-link" href="index.html" data-nav-page="home" aria-label="JoyfulNest Cleaning home">
          <span class="brand-mark">JN</span>
          <span class="brand-copy">
            <strong>JoyfulNest Cleaning</strong>
            <small>Premium residential and office cleaning services</small>
          </span>
        </a>

        <!-- Mobile navigation toggle -->
        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Open navigation" data-nav-toggle>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Global navigation -->
        <nav class="site-nav" data-nav>
          <a class="nav-link shared-link" href="index.html" data-nav-page="home">Home</a>

          <div class="nav-dropdown" data-dropdown>
            <button
              class="dropdown-trigger"
              type="button"
              aria-expanded="false"
              data-dropdown-trigger
              data-nav-page="services"
            >
              Services
            </button>
            <div class="dropdown-menu">
              <a class="shared-link" href="pages/services.html" data-nav-page="services">All Services</a>
              <a class="shared-link" href="pages/services.html#core-services">Core Services</a>
              <a class="shared-link" href="pages/services.html#additional-services">Additional Services</a>
              <a class="shared-link" href="pages/services.html#add-on-services">Add-On Services</a>
            </div>
          </div>

          <a class="nav-link shared-link" href="pages/pricing.html" data-nav-page="pricing">Pricing</a>
          <a class="nav-link shared-link" href="pages/about.html" data-nav-page="about">About</a>
          <a class="nav-link shared-link" href="pages/contact.html" data-nav-page="contact">Contact</a>
          <a class="button button-small shared-link" href="pages/book.html" data-nav-page="book">Book Today</a>
        </nav>
      </div>
    </header>
  `,
  "components/footer.html": `
    <!-- Shared footer component -->
    <footer class="site-footer">
      <div class="footer-shell">
        <div class="footer-container">
          <!-- Brand Section -->
          <div class="footer-section footer-section-brand">
            <div class="footer-brand">
              <span class="footer-brand-mark">JN</span>
              <div class="footer-brand-copy">
                <strong>JoyfulNest Cleaning</strong>
                <small>Premium Cleaning Services</small>
              </div>
            </div>
            <p class="footer-slogan">Making homes shine, one detail at a time</p>
            <p class="footer-copyright">&copy; 2026 All Rights Reserved</p>
          </div>

          <!-- Quick Links Section -->
          <div class="footer-section footer-section-links">
            <h3 class="footer-section-title">Quick Links</h3>
            <ul class="footer-links-list">
              <li><a href="index.html" class="footer-link shared-link">Home</a></li>
              <li><a href="pages/services.html" class="footer-link shared-link">Services</a></li>
              <li><a href="pages/about.html" class="footer-link shared-link">About</a></li>
              <li><a href="pages/pricing.html" class="footer-link shared-link">Pricing</a></li>
              <li><a href="pages/contact.html" class="footer-link shared-link">Contact</a></li>
              <li><a href="pages/book.html" class="footer-link shared-link">Book Now</a></li>
            </ul>
          </div>

          <!-- Popular Services Section -->
          <div class="footer-section footer-section-services">
            <h3 class="footer-section-title">Popular Services</h3>
            <ul class="footer-links-list">
              <li><a href="pages/standard-house-cleaning.html" class="footer-link shared-link">Standard House Cleaning</a></li>
              <li><a href="pages/deep-cleaning.html" class="footer-link shared-link">Deep Cleaning</a></li>
              <li><a href="pages/move-in-move-out-cleaning.html" class="footer-link shared-link">Move-In / Move-Out</a></li>
              <li><a href="pages/carpet-cleaning.html" class="footer-link shared-link">Carpet Cleaning</a></li>
              <li><a href="pages/office-cleaning.html" class="footer-link shared-link">Office Cleaning</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `,
};

document.addEventListener("DOMContentLoaded", async () => {
  const prefix = document.body.dataset.prefix || "";

  await includeComponents(prefix);
  normalizeSharedLinks(prefix);
  setActivePage();
  initializeNavigation();
  initializeMotion();
  setCurrentYear();
});

// Loads shared header/footer HTML and falls back to inline markup when previewed from file://.
async function includeComponents(prefix) {
  const includeTargets = Array.from(document.querySelectorAll("[data-include]"));
  const componentVersion = "20260410-footer-rebuild";

  await Promise.all(
    includeTargets.map(async (target) => {
      const includePath = target.dataset.include;
      const resolvedPath = `${prefix}${includePath}`;
      const requestPath = `${resolvedPath}${resolvedPath.includes("?") ? "&" : "?"}v=${componentVersion}`;
      const existingMarkup = target.innerHTML.trim();
      let markup = existingMarkup || inlineComponents[includePath] || "";

      if (markup) {
        target.innerHTML = markup;
        target.hidden = false;
        target.style.display = 'block';
        target.style.opacity = '1';
        target.style.visibility = 'visible';
        target.dataset.includeStatus = "inline";
      }

      try {
        const response = await fetch(requestPath, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to load ${requestPath}: ${response.status}`);
        }

        markup = await response.text();
        if (markup.trim()) {
          target.innerHTML = markup;
          target.hidden = false;
          target.style.display = 'block';
          target.style.opacity = '1';
          target.style.visibility = 'visible';
          target.dataset.includeStatus = "loaded";
        }
      } catch (error) {
        target.dataset.includeStatus = "fallback";
        target.hidden = false;
        target.style.display = 'block';
        target.style.opacity = '1';
        target.style.visibility = 'visible';
      }
    }),
  );
}

// Normalizes shared component links so root and nested pages both work consistently.
function normalizeSharedLinks(prefix) {
  document.querySelectorAll(".shared-link[href]").forEach((link) => {
    let destination = link.getAttribute("href");

    if (!destination || destination.startsWith("../") || destination.startsWith("./")) {
      return;
    }

    if (
      destination.startsWith("http://") ||
      destination.startsWith("https://") ||
      destination.startsWith("mailto:") ||
      destination.startsWith("tel:") ||
      destination.startsWith("#") ||
      destination.startsWith("/")
    ) {
      return;
    }

    if (prefix === "../") {
      if (destination === "index.html") {
        destination = "../index.html";
      } else if (destination.startsWith("pages/")) {
        destination = `../${destination}`;
      } else {
        return;
      }
    } else {
      link.setAttribute("href", `${prefix}${destination}`);
      return;
    }

    link.setAttribute("href", destination);
  });
}

function setActivePage() {
  const currentPage = document.body.dataset.page;

  if (!currentPage) {
    return;
  }

  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    if (link.dataset.navPage === currentPage) {
      link.classList.add("is-active");
    }
  });
}

// Mobile navigation with dropdown support.
function initializeNavigation() {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const dropdowns = Array.from(document.querySelectorAll("[data-dropdown]"));

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector("[data-dropdown-trigger]");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      if (window.innerWidth > 960) {
        return;
      }

      const isOpen = dropdown.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-dropdown]")) {
      return;
    }

    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      const trigger = dropdown.querySelector("[data-dropdown-trigger]");

      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && nav) {
      nav.classList.remove("is-open");

      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }

      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("is-open");
        const trigger = dropdown.querySelector("[data-dropdown-trigger]");

        if (trigger) {
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    }
  });
}

// Scroll-driven polish: reveal sections, soften the header, and shift hero glow slightly.
function initializeMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".page-hero");
  const revealTargets = Array.from(
    document.querySelectorAll(
      ".hero-content, .service-card, .feature-card, .testimonial-card, .package-card, .contact-panel, .form-card, .cta-panel, .process-card, .benefit-card, .stat-card, .table-shell, .intro-card, .inclusion-card, .benefit-panel, .calendar-card",
    ),
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealTargets.forEach((target) => observer.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const updateScrollEffects = () => {
    const scrollY = window.scrollY;

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 18);
    }

    if (hero && !prefersReducedMotion) {
      const offset = Math.min(scrollY * 0.08, 26);
      hero.style.setProperty("--hero-shift", `${offset}px`);
      hero.style.setProperty("--hero-glow-shift", `${offset * -0.8}px`);
    }
  };

  updateScrollEffects();
  window.addEventListener("scroll", updateScrollEffects, { passive: true });
}

function setCurrentYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

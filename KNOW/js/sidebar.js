/**
 * KNOW — Sidebar Mobile Toggle
 * File: js/sidebar.js
 *
 * Handles the mobile hamburger menu open/close.
 * Also wires the "New Concept" desktop button to the same
 * handler as #quick-add-btn so the topbar shortcut works.
 * No frameworks. No inline JS in HTML.
 */

(function () {
  'use strict';

  const sidebar   = document.getElementById('app-sidebar');
  const backdrop  = document.getElementById('sidebar-backdrop');
  const menuBtn   = document.getElementById('mobile-menu-toggle');

  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    backdrop.classList.add('backdrop-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    backdrop.classList.remove('backdrop-visible');
    document.body.style.overflow = '';
  }

  if (menuBtn)   menuBtn.addEventListener('click', openSidebar);
  if (backdrop)  backdrop.addEventListener('click', closeSidebar);

  // Close sidebar when a nav link is tapped on mobile
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 900) closeSidebar();
    });
  });

  // Wire desktop "New Concept" topbar button to the same concept form as quick-add-btn
  const desktopAddBtn = document.getElementById('quick-add-btn-desktop');
  if (desktopAddBtn) {
    desktopAddBtn.addEventListener('click', function () {
      // Delegate to App if loaded, else fallback
      if (typeof App !== 'undefined' && App.openConceptForm) {
        App.openConceptForm();
      } else {
        const quickBtn = document.getElementById('quick-add-btn');
        if (quickBtn) quickBtn.click();
      }
    });
  }

  // Wire skills CTA button
  const skillsCta = document.getElementById('skills-cta-create-btn');
  if (skillsCta) {
    skillsCta.addEventListener('click', function () {
      const addSkillBtn = document.getElementById('add-skill-btn');
      if (addSkillBtn) addSkillBtn.click();
    });
  }

})();

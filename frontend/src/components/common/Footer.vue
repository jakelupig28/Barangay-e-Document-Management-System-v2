<template>
  <footer class="modern-footer">
    <div class="footer-container">
      <!-- Footer Left: Logo and Copyright -->
      <div class="footer-left">
        <div class="logo-wrapper">
          <svg class="footer-logo-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="brand-text">B-Docs</span>
        </div>
        <p class="copyright-text">
          &copy; {{ new Date().getFullYear() }} Barangay e-Docs. Government of the Philippines
        </p>
      </div>

      <!-- Footer Right: Links -->
      <div class="footer-right">
        <router-link to="/privacy" class="footer-link">Privacy Policy</router-link>
        <router-link to="/terms" class="footer-link">Terms of Service</router-link>
        <router-link to="/login" class="portal-link">
          <i class="fas fa-shield-alt me-1"></i> Official Portal
        </router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'ModernFooter'
}
</script>

<style scoped>
.modern-footer {
  background-color: #eef2f6;
  color: #64748b;
  padding: 1.5rem 0;
  border-top: 1px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #2563eb;
}

.footer-logo-svg {
  color: #2563eb;
  fill: rgba(37, 99, 235, 0.08);
}

.brand-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0f172a;
  letter-spacing: -0.5px;
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .modern-footer) {
  background-color: #0b0f19;
  border-top: 1px solid #1e293b;
  color: #94a3b8;
}

:global(body.dark-mode .modern-footer .brand-text) {
  color: #f8fafc;
}

:global(body.dark-mode .modern-footer .copyright-text) {
  color: #94a3b8;
}

:global(body.dark-mode .modern-footer .footer-link) {
  color: #94a3b8;
}

:global(body.dark-mode .modern-footer .footer-link:hover) {
  color: #60a5fa;
}

:global(body.dark-mode .modern-footer .portal-link) {
  color: #60a5fa;
}

:global(body.dark-mode .modern-footer .portal-link:hover) {
  color: #93c5fd;
}

.copyright-text {
  margin: 0;
  color: #64748b;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #2563eb;
}

.portal-link {
  display: flex;
  align-items: center;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.portal-link:hover {
  color: #1d4ed8;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
    justify-content: center;
    gap: 1.25rem;
  }
  
  .footer-left {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .footer-right {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}
</style>
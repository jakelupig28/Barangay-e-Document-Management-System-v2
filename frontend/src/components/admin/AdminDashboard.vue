<template>
  <div class="admin-dashboard app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-brand text-white text-decoration-none d-block">
          <div class="brand-content d-flex align-items-center gap-2">
            <div class="brand-logo">
              <i class="fas fa-shield-alt text-white fs-4"></i>
            </div>
            <span class="brand-text" v-show="!isCollapsed">Admin Portal</span>
          </div>
        </div>
        <button 
          class="sidebar-toggle" 
          @click="isCollapsed = !isCollapsed"
        >
          <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- User Management -->
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeSection === 'users' }" @click="activeSection = 'users'; sidebarOpen = false">
              <i class="nav-icon fas fa-users position-relative">
                <span v-if="pendingUsersCount > 0 && isCollapsed" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style="width: 10px; height: 10px;">
                  <span class="visually-hidden">New alerts</span>
                </span>
              </i>
              <span class="nav-text d-flex justify-content-between align-items-center flex-grow-1">
                User Management
                <span v-if="pendingUsersCount > 0" class="badge bg-danger rounded-pill">{{ pendingUsersCount }}</span>
              </span>
            </a>
          </li>
          <!-- Transactions -->
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeSection === 'transactions' }" @click="activeSection = 'transactions'; sidebarOpen = false">
              <i class="nav-icon fas fa-exchange-alt"></i>
              <span class="nav-text">Transactions</span>
            </a>
          </li>
          <!-- System Settings -->
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeSection === 'system' }" @click="activeSection = 'system'; sidebarOpen = false">
              <i class="nav-icon fas fa-cog"></i>
              <span class="nav-text">System Settings</span>
            </a>
          </li>
          <!-- Personal Profile -->
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeSection === 'profile' }" @click="activeSection = 'profile'; sidebarOpen = false">
              <i class="nav-icon fas fa-user-circle"></i>
              <span class="nav-text">Personal Profile</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <i class="logout-icon fas fa-sign-out-alt"></i>
          <span class="logout-text" v-show="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'expanded': isCollapsed }">
      <div class="content-wrapper">
      <header class="content-header">
        <h1>{{ sectionTitle }}</h1>
        <div class="header-actions align-items-center gap-3">
          <RealTimeClock />
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="`Search ${activeSection}...`"
            />
          </div>
        </div>
      </header>

      <!-- Personal Profile Section -->
      <section v-if="activeSection === 'profile'" class="content-section">
        <div class="card p-4">
          <div class="card-header border-0 mb-3 px-0">
            <h3><i class="fas fa-user-circle me-2"></i> Personal Profile</h3>
          </div>
          <div class="card-body px-0">
            <div class="row g-4">
              <div class="col-md-4">
                <label class="form-label fw-bold">First Name</label>
                <div class="input-container">
                  <i class="fas fa-user input-icon"></i>
                  <input v-model="adminProfile.FirstName" type="text" placeholder="First Name" class="form-control" />
                </div>
              </div>
              
              <div class="col-md-4">
                <label class="form-label fw-bold">Middle Name</label>
                <div class="input-container">
                  <i class="fas fa-user input-icon"></i>
                  <input v-model="adminProfile.MiddleName" type="text" placeholder="Middle Name" class="form-control" />
                </div>
              </div>
              
              <div class="col-md-4">
                <label class="form-label fw-bold">Last Name</label>
                <div class="input-container">
                  <i class="fas fa-user input-icon"></i>
                  <input v-model="adminProfile.LastName" type="text" placeholder="Last Name" class="form-control" />
                </div>
              </div>
              
              <div class="col-md-4">
                <label class="form-label fw-bold">Birth Date</label>
                <div class="input-container">
                  <i class="fas fa-calendar input-icon"></i>
                  <input v-model="adminProfile.BirthDate" type="date" class="form-control" />
                </div>
              </div>
              
              <div class="col-md-4">
                <label class="form-label fw-bold">Age</label>
                <div class="input-container">
                  <i class="fas fa-birthday-cake input-icon"></i>
                  <input :value="computedAdminAge" type="number" readonly class="form-control bg-light text-muted" placeholder="Auto-calculated" />
                </div>
              </div>
              
              <div class="col-md-4">
                <label class="form-label fw-bold">Gender</label>
                <div class="input-container">
                  <i class="fas fa-venus-mars input-icon"></i>
                  <select v-model="adminProfile.Gender" class="form-control">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label fw-bold">Contact Number</label>
                <div class="input-container">
                  <i class="fas fa-phone input-icon"></i>
                  <input v-model="adminProfile.ContactNo" type="text" placeholder="Contact Number" class="form-control" />
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label fw-bold">Email Address</label>
                <div class="input-container">
                  <i class="fas fa-envelope input-icon"></i>
                  <input v-model="adminProfile.Email" type="email" placeholder="Email Address" class="form-control" />
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-bold">Position</label>
                <div class="input-container">
                  <i class="fas fa-user-shield input-icon"></i>
                  <input type="text" value="Barangay Captain" readonly class="form-control bg-light text-muted" />
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-bold">Term Start</label>
                <div class="input-container">
                  <i class="fas fa-calendar-alt input-icon"></i>
                  <input v-model="adminProfile.TermStart" type="date" class="form-control" />
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-bold">Term End</label>
                <div class="input-container">
                  <i class="fas fa-calendar-alt input-icon"></i>
                  <input v-model="adminProfile.TermEnd" type="date" class="form-control" />
                </div>
              </div>

              <div class="col-12">
                <label class="form-label fw-bold">Address</label>
                <div class="input-container">
                  <i class="fas fa-map-marker-alt input-icon"></i>
                  <input v-model="adminProfile.Address" type="text" placeholder="Complete Address" class="form-control" />
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-3 border-top d-flex justify-content-end">
              <button class="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" @click="saveAdminProfile" :disabled="isSavingProfile">
                <i v-if="isSavingProfile" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                <span>{{ isSavingProfile ? 'Saving...' : 'Save Profile' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- User Management Section -->
      <!-- User Management Section -->
      <section v-if="activeSection === 'users'" class="content-section">
        <!-- Dashboard Charts Row -->
        <div class="row g-4 mb-4">
          <!-- Role Distribution Bar Chart Card -->
          <div class="col-lg-7">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0 text-secondary"><i class="fas fa-chart-bar me-2 text-primary"></i> User Role Distribution</h4>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center p-4 position-relative">
                <!-- SVG Bar Chart -->
                <svg width="100%" height="180" viewBox="0 0 500 180" class="bar-chart-svg">
                  <!-- Grid Lines -->
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="4" />
                  <line x1="40" y1="75" x2="480" y2="75" stroke="#e2e8f0" stroke-dasharray="4" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="#cbd5e1" stroke-width="1" />
                  
                  <!-- Y-Axis labels (ticks) -->
                  <text x="30" y="25" text-anchor="end" font-size="10" fill="#94a3b8">Max</text>
                  <text x="30" y="80" text-anchor="end" font-size="10" fill="#94a3b8">50%</text>
                  <text x="30" y="134" text-anchor="end" font-size="10" fill="#94a3b8">0</text>
                  
                  <!-- Bars -->
                  <g v-for="(bar, index) in userRoleBarChart" :key="index">
                    <!-- Bar rect -->
                    <rect 
                      :x="bar.x" 
                      :y="bar.y" 
                      :width="bar.width" 
                      :height="bar.height" 
                      :fill="bar.color" 
                      rx="6"
                      class="bar-rect"
                      @mouseenter="showChartTooltip($event, bar.label + ': ' + bar.count, 'user-roles')"
                      @mouseleave="hideChartTooltip"
                    />
                    <!-- Value Label -->
                    <text 
                      :x="bar.x + bar.width / 2" 
                      :y="bar.y - 6" 
                      text-anchor="middle" 
                      font-size="11" 
                      font-weight="bold"
                      :fill="bar.color"
                    >
                      {{ bar.count }}
                    </text>
                    <!-- Axis Label -->
                    <text 
                      :x="bar.x + bar.width / 2" 
                      y="150" 
                      text-anchor="middle" 
                      font-size="10" 
                      fill="#64748b"
                    >
                      {{ bar.label }}
                    </text>
                  </g>
                </svg>
                
                <!-- Tooltip Bubble -->
                <div v-if="tooltip.show && tooltip.chartId === 'user-roles'" class="chart-tooltip-bubble" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                  {{ tooltip.text }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Status Doughnut Chart Card -->
          <div class="col-lg-5">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0 text-secondary"><i class="fas fa-chart-pie me-2 text-primary"></i> Resident Status</h4>
              </div>
              <div class="card-body d-flex align-items-center justify-content-around p-4 position-relative">
                <!-- Doughnut SVG -->
                <div class="position-relative d-inline-flex">
                  <svg viewBox="0 0 100 100" width="130" height="130">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="10" />
                    <circle 
                      v-for="(seg, idx) in userStatusDoughnutChart" 
                      :key="idx"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      :stroke="seg.color"
                      stroke-width="10"
                      :stroke-dasharray="seg.dasharray"
                      :stroke-dashoffset="seg.dashoffset"
                      transform="rotate(-90 50 50)"
                      style="transition: stroke-dashoffset 0.5s ease;"
                      @mouseenter="showChartTooltip($event, seg.label + ': ' + seg.count + ' (' + seg.percentage + '%)', 'resident-status')"
                      @mouseleave="hideChartTooltip"
                    />
                  </svg>
                  <!-- Center total count text -->
                  <div class="position-absolute top-50 start-50 translate-middle text-center">
                    <div class="fs-4 fw-bold text-dark">{{ students.length }}</div>
                    <div class="text-muted" style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">Residents</div>
                  </div>
                </div>
                
                <!-- Legend -->
                <div class="d-flex flex-column gap-2">
                  <div v-for="(seg, idx) in userStatusDoughnutChart" :key="idx" class="d-flex align-items-center gap-2">
                    <span class="d-inline-block rounded-circle" :style="{ width: '12px', height: '12px', background: seg.color }"></span>
                    <div class="d-flex flex-column">
                      <span class="fw-semibold text-dark" style="font-size: 13px;">{{ seg.label }}</span>
                      <span class="text-muted small">{{ seg.count }} ({{ seg.percentage }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Tooltip Bubble -->
                <div v-if="tooltip.show && tooltip.chartId === 'resident-status'" class="chart-tooltip-bubble" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                  {{ tooltip.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>All Users</h3>
            <div class="card-actions">
              <div class="filter-group d-flex gap-2">
                <select class="form-select custom-select-arrow modern-filter" v-model="roleFilter" @change="fetchAllUsers">
                  <option value="">All Roles</option>
                  <option value="admin">Super Admin</option>
                  <option value="barangay_official">Admin</option>
                  <option value="resident">Resident</option>
                </select>
                <select class="form-select custom-select-arrow modern-filter" v-model="statusFilter" @change="fetchAllUsers">
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button class="btn btn-primary ml-2" @click="showCreateStaffModal = true">
                <i class="fas fa-user-plus"></i> Add Staff Account
              </button>
              <button v-if="selectedUsers.length" class="btn btn-approve" @click="bulkApproveUsers">
                Approve Selected
              </button>
              <button v-if="selectedUsers.length" class="btn btn-delete" @click="bulkDeleteUsers">
                Delete Selected
              </button>
              <button class="btn btn-export" @click="exportUsers">
                <i class="fas fa-download"></i> Export
              </button>
              <button class="btn btn-refresh" @click="fetchAllUsers">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loadingUsers" class="loading-indicator">
              <i class="fas fa-spinner fa-spin"></i> Loading users...
            </div>
            <div v-else-if="userError" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ userError }}
            </div>
            <div v-else>
              <!-- Residents Table -->
              <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                <h4 class="mb-0 fw-bold fs-6 text-primary"><i class="fas fa-users me-2"></i>Residents</h4>
                <span class="badge bg-primary rounded-pill">{{ students.length }}</span>
              </div>
              <div class="table-responsive mb-4">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" v-model="selectAllStudents" @change="toggleSelectAllStudents"></th>
                      <th>User</th>
                      <th class="hide-sm">Contact</th>
                      <th>Status</th>
                      <th>Date of Registration</th>
                      <th>Date of Approval</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in students" :key="user.id">
                      <td><input type="checkbox" v-model="selectedUsers" :value="user.id"></td>
                      <td>
                        <div class="user-cell">
                          <div class="user-details">
                            <strong>{{ user.name }}</strong>
                            <small>{{ user.email }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="hide-sm">{{ user.contact || 'N/A' }}</td>
                      <td>
                        <span :class="['status-badge', getStatusClass(user)]">
                          {{ getStatusText(user) }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>{{ formatDate(user.approvedAt) }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn-action btn-delete" @click.stop="confirmDeleteUser(user)" title="Delete User">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="students.length === 0">
                      <td colspan="7" class="text-center py-4 text-muted">No residents found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Staff & Officials Table -->
              <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-light border-top">
                <h4 class="mb-0 fw-bold fs-6 text-primary"><i class="fas fa-user-tie me-2"></i>Staff & Officials</h4>
                <span class="badge bg-primary rounded-pill">{{ professors.length }}</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" v-model="selectAllProfessors" @change="toggleSelectAllProfessors"></th>
                      <th>User</th>
                      <th class="hide-md">Role</th>
                      <th class="hide-lg">Position</th>
                      <th>Date of Creation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in professors" :key="user.id">
                      <td><input type="checkbox" v-model="selectedUsers" :value="user.id"></td>
                      <td>
                        <div class="user-cell">
                          <div class="user-details">
                            <strong>{{ user.name }}</strong>
                            <small>{{ user.email }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="hide-md">{{ formatRole(user.role) }}</td>
                      <td class="hide-lg">
                        {{ user.role === 'super_admin' ? 'Chairman' : ((user.role === 'barangay_staff' || user.role === 'barangay_official') ? 'Barangay Official' : (user.adminRole || user.position || user.skPosition || 'N/A')) }}
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>
                        <div class="action-buttons">
                          <button v-if="!user.isApproved" class="btn-action btn-approve" @click.stop="approveUser(user)" title="Approve User">
                            <i class="fas fa-check"></i>
                          </button>
                          <button class="btn-action btn-delete" @click.stop="confirmDeleteUser(user)" title="Delete User">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="professors.length === 0">
                      <td colspan="6" class="text-center py-4 text-muted">No staff/officials found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Transactions Section -->
      <section v-if="activeSection === 'transactions'" class="content-section">
        <!-- Dashboard Charts Row -->
        <div class="row g-4 mb-4">
          <!-- Request Types Bar Chart Card -->
          <div class="col-lg-7">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0 text-secondary"><i class="fas fa-chart-bar me-2 text-primary"></i> Request Types Comparison</h4>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center p-4 position-relative">
                <!-- SVG Bar Chart -->
                <svg width="100%" height="180" viewBox="0 0 500 180" class="bar-chart-svg">
                  <!-- Grid Lines -->
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="4" />
                  <line x1="40" y1="75" x2="480" y2="75" stroke="#e2e8f0" stroke-dasharray="4" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="#cbd5e1" stroke-width="1" />
                  
                  <!-- Y-Axis labels (ticks) -->
                  <text x="30" y="25" text-anchor="end" font-size="10" fill="#94a3b8">Max</text>
                  <text x="30" y="80" text-anchor="end" font-size="10" fill="#94a3b8">50%</text>
                  <text x="30" y="134" text-anchor="end" font-size="10" fill="#94a3b8">0</text>
                  
                  <!-- Bars -->
                  <g v-for="(bar, index) in transactionTypeBarChart" :key="index">
                    <!-- Bar rect -->
                    <rect 
                      :x="bar.x" 
                      :y="bar.y" 
                      :width="bar.width" 
                      :height="bar.height" 
                      :fill="bar.color" 
                      rx="6"
                      class="bar-rect"
                      @mouseenter="showChartTooltip($event, bar.label + ': ' + bar.count, 'request-types')"
                      @mouseleave="hideChartTooltip"
                    />
                    <!-- Value Label -->
                    <text 
                      :x="bar.x + bar.width / 2" 
                      :y="bar.y - 6" 
                      text-anchor="middle" 
                      font-size="11" 
                      font-weight="bold"
                      :fill="bar.color"
                    >
                      {{ bar.count }}
                    </text>
                    <!-- Axis Label -->
                    <text 
                      :x="bar.x + bar.width / 2" 
                      y="150" 
                      text-anchor="middle" 
                      font-size="9" 
                      fill="#64748b"
                    >
                      {{ bar.label }}
                    </text>
                  </g>
                </svg>

                <!-- Tooltip Bubble -->
                <div v-if="tooltip.show && tooltip.chartId === 'request-types'" class="chart-tooltip-bubble" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                  {{ tooltip.text }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Transaction Status Doughnut Chart Card -->
          <div class="col-lg-5">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h4 class="mb-0 text-secondary"><i class="fas fa-chart-pie me-2 text-primary"></i> Request Statuses</h4>
              </div>
              <div class="card-body d-flex align-items-center justify-content-around p-4 position-relative">
                <!-- Doughnut SVG -->
                <div class="position-relative d-inline-flex">
                  <svg viewBox="0 0 100 100" width="130" height="130">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="10" />
                    <circle 
                      v-for="(seg, idx) in transactionStatusDoughnutChart" 
                      :key="idx"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      :stroke="seg.color"
                      stroke-width="10"
                      :stroke-dasharray="seg.dasharray"
                      :stroke-dashoffset="seg.dashoffset"
                      transform="rotate(-90 50 50)"
                      style="transition: stroke-dashoffset 0.5s ease;"
                      @mouseenter="showChartTooltip($event, seg.label + ': ' + seg.count + ' (' + seg.percentage + '%)', 'request-status')"
                      @mouseleave="hideChartTooltip"
                    />
                  </svg>
                  <!-- Center total count text -->
                  <div class="position-absolute top-50 start-50 translate-middle text-center">
                    <div class="fs-4 fw-bold text-dark">{{ filteredTransactions.length }}</div>
                    <div class="text-muted" style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Requests</div>
                  </div>
                </div>
                
                <!-- Legend -->
                <div class="d-flex flex-column gap-2">
                  <div v-for="(seg, idx) in transactionStatusDoughnutChart" :key="idx" class="d-flex align-items-center gap-2">
                    <span class="d-inline-block rounded-circle" :style="{ width: '12px', height: '12px', background: seg.color }"></span>
                    <div class="d-flex flex-column">
                      <span class="fw-semibold text-dark" style="font-size: 13px;">{{ seg.label }}</span>
                      <span class="text-muted small">{{ seg.count }} ({{ seg.percentage }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Tooltip Bubble -->
                <div v-if="tooltip.show && tooltip.chartId === 'request-status'" class="chart-tooltip-bubble" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                  {{ tooltip.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions mb-4 d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
          <h3 class="m-0 text-primary"><i class="fas fa-exchange-alt me-2"></i> Transactions Log</h3>
          <div class="d-flex gap-3 align-items-center">
            <div class="filter-group">
              <select class="form-select custom-select-arrow modern-filter" v-model="dateFilter" @change="filterTransactionsByDate">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <button class="btn btn-export" @click="exportTransactions">
              <i class="fas fa-download"></i> Export All
            </button>
          </div>
        </div>

        <div v-if="loadingTransactions" class="card p-5 text-center shadow-sm">
          <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
            <p class="text-muted m-0">Loading transactions...</p>
          </div>
        </div>
        <div v-else-if="transactionError" class="card p-5 text-center text-danger shadow-sm">
          <i class="fas fa-exclamation-circle fa-2x mb-2"></i> {{ transactionError }}
        </div>
        <div v-else class="d-flex flex-column gap-4">
          <!-- 1. Barangay Certificate -->
          <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center py-3">
              <h4 class="mb-0 text-secondary"><i class="fas fa-file-signature me-2 text-info"></i> Barangay Certificate Requests</h4>
              <span class="badge bg-info text-white">{{ clearanceTransactions.length }} requests</span>
            </div>
            <div class="card-body">
              <div v-if="paginatedClearance.length === 0" class="text-center p-4 text-muted">
                No Barangay Certificate requests found for the selected period.
              </div>
              <div v-else class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Resident Name</th>
                      <th>Purpose</th>
                      <th>Notes</th>
                      <th>Request Date</th>
                      <th>Date Claimed</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tx in paginatedClearance" :key="tx.id">
                      <td>{{ tx.id }}</td>
                      <td><strong>{{ tx.userName }}</strong></td>
                      <td>{{ tx.purpose }}</td>
                      <td><span class="text-muted">{{ tx.notes || 'None' }}</span></td>
                      <td>{{ formatDate(tx.createdAt) }}</td>
                      <td>{{ tx.claimedAt ? formatDate(tx.claimedAt) : 'N/A' }}</td>
                      <td>
                        <span :class="['status-badge', (tx.status || 'pending').toLowerCase()]">
                          {{ tx.status || 'Pending' }}
                        </span>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button v-if="tx.documentUrl" class="btn-action btn-preview" @click="previewDocument(tx)" title="Preview Document">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <span v-else class="text-muted small">No doc</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Clearance Pagination -->
              <div class="pagination mt-3" v-if="totalPagesClearance > 1">
                <button :disabled="clearancePage === 1" @click="changeClearancePage(clearancePage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-for="page in totalPagesClearance" :key="page" :class="{ active: clearancePage === page }" @click="changeClearancePage(page)">
                  {{ page }}
                </button>
                <button :disabled="clearancePage === totalPagesClearance" @click="changeClearancePage(clearancePage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Certificate of Indigency (Financial Assistance) -->
          <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center py-3">
              <h4 class="mb-0 text-secondary"><i class="fas fa-hands-helping me-2 text-success"></i> Certificate of Indigency (Financial Assistance) Requests</h4>
              <span class="badge bg-success text-white">{{ residencyTransactions.length }} requests</span>
            </div>
            <div class="card-body">
              <div v-if="paginatedResidency.length === 0" class="text-center p-4 text-muted">
                No Certificate of Indigency (Financial Assistance) requests found for the selected period.
              </div>
              <div v-else class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Resident Name</th>
                      <th>Purpose</th>
                      <th>Notes</th>
                      <th>Request Date</th>
                      <th>Date Claimed</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tx in paginatedResidency" :key="tx.id">
                      <td>{{ tx.id }}</td>
                      <td><strong>{{ tx.userName }}</strong></td>
                      <td>{{ tx.purpose }}</td>
                      <td><span class="text-muted">{{ tx.notes || 'None' }}</span></td>
                      <td>{{ formatDate(tx.createdAt) }}</td>
                      <td>{{ tx.claimedAt ? formatDate(tx.claimedAt) : 'N/A' }}</td>
                      <td>
                        <span :class="['status-badge', (tx.status || 'pending').toLowerCase()]">
                          {{ tx.status || 'Pending' }}
                        </span>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button v-if="tx.documentUrl" class="btn-action btn-preview" @click="previewDocument(tx)" title="Preview Document">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <span v-else class="text-muted small">No doc</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Residency Pagination -->
              <div class="pagination mt-3" v-if="totalPagesResidency > 1">
                <button :disabled="residencyPage === 1" @click="changeResidencyPage(residencyPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-for="page in totalPagesResidency" :key="page" :class="{ active: residencyPage === page }" @click="changeResidencyPage(page)">
                  {{ page }}
                </button>
                <button :disabled="residencyPage === totalPagesResidency" @click="changeResidencyPage(residencyPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Certificate of Indigency (General Purpose) -->
          <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center py-3">
              <h4 class="mb-0 text-secondary"><i class="fas fa-hands-helping me-2 text-primary"></i> Certificate of Indigency (General Purpose) Requests</h4>
              <span class="badge bg-primary text-white">{{ indigencyTransactions.length }} requests</span>
            </div>
            <div class="card-body">
              <div v-if="paginatedIndigency.length === 0" class="text-center p-4 text-muted">
                No Certificate of Indigency (General Purpose) requests found for the selected period.
              </div>
              <div v-else class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Resident Name</th>
                      <th>Purpose</th>
                      <th>Notes</th>
                      <th>Request Date</th>
                      <th>Date Claimed</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tx in paginatedIndigency" :key="tx.id">
                      <td>{{ tx.id }}</td>
                      <td><strong>{{ tx.userName }}</strong></td>
                      <td>{{ tx.purpose }}</td>
                      <td><span class="text-muted">{{ tx.notes || 'None' }}</span></td>
                      <td>{{ formatDate(tx.createdAt) }}</td>
                      <td>{{ tx.claimedAt ? formatDate(tx.claimedAt) : 'N/A' }}</td>
                      <td>
                        <span :class="['status-badge', (tx.status || 'pending').toLowerCase()]">
                          {{ tx.status || 'Pending' }}
                        </span>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button v-if="tx.documentUrl" class="btn-action btn-preview" @click="previewDocument(tx)" title="Preview Document">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <span v-else class="text-muted small">No doc</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Indigency Pagination -->
              <div class="pagination mt-3" v-if="totalPagesIndigency > 1">
                <button :disabled="indigencyPage === 1" @click="changeIndigencyPage(indigencyPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-for="page in totalPagesIndigency" :key="page" :class="{ active: indigencyPage === page }" @click="changeIndigencyPage(page)">
                  {{ page }}
                </button>
                <button :disabled="indigencyPage === totalPagesIndigency" @click="changeIndigencyPage(indigencyPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- Add this section with your other content sections -->
      <section v-if="activeSection === 'system'" class="content-section">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <h3 class="mb-0 text-primary"><i class="fas fa-tools me-2"></i> System Maintenance Settings</h3>
          </div>
          <div class="card-body p-4">
            <div class="maintenance-controls d-flex flex-column gap-4">
              <div class="form-group d-flex align-items-center gap-3 bg-light p-3 rounded">
                <span class="fw-bold text-secondary">Maintenance Mode Status:</span>
                <label class="switch-toggle">
                  <input type="checkbox" v-model="maintenanceEnabled" @change="toggleMaintenance">
                  <span class="slider-toggle"></span>
                </label>
                <span class="status-label fw-bold" :class="maintenanceEnabled ? 'text-danger' : 'text-success'">
                  {{ maintenanceEnabled ? 'ON (Website Disabled)' : 'OFF (Website Active)' }}
                </span>
              </div>
              
              <div v-if="maintenanceEnabled" class="form-group d-flex flex-column gap-2">
                <label class="fw-bold text-secondary">Maintenance Message</label>
                <textarea v-model="maintenanceMessage" class="form-control shadow-sm" rows="3" placeholder="Enter maintenance message for users"></textarea>
              </div>
              
              <div v-if="maintenanceEnabled" class="form-group d-flex flex-column gap-2">
                <label class="fw-bold text-secondary">Estimated Completion (Date & Time)</label>
                <input v-model="maintenanceEstimate" type="datetime-local" class="form-control shadow-sm" style="max-width: 300px;">
              </div>
              
              <div>
                <button @click="saveMaintenanceSettings" class="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 mt-2">
                  <i class="fas fa-save"></i> Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Announcement Modal -->
      <AnnouncementModal
        :isVisible="showAnnouncementModal"
        :announcement="newAnnouncement"
        :editingAnnouncement="editingAnnouncement"
        @close="closeAnnouncementModal"
        @save="saveAnnouncement"
      />

      <!-- Confirmation Modal -->
      <ConfirmationModal
        ref="confirmationModal"
        :isVisible="showConfirmModal"
        :message="confirmMessage"
        @close="closeConfirmModal"
        @confirm="executeDelete"
      />
      <StaffAccountModal
        :isVisible="showCreateStaffModal"
        :loading="creatingStaff"
        :error="createStaffError"
        @close="showCreateStaffModal = false"
        @save="handleCreateStaff"
      />
      </div>
    </main>
  </div>
</template>

<script>
import { db, auth } from '@/firebase/config'
import {
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  addDoc,
  where,
  setDoc
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import * as XLSX from 'xlsx'
import AnnouncementModal from './AnnouncementModal.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import StaffAccountModal from './StaffAccountModal.vue'
import RealTimeClock from '@/components/common/RealTimeClock.vue'
import localDb from '@/services/localDb'

export default {
  name: 'AdminDashboard',
  components: {
    AnnouncementModal,
    ConfirmationModal,
    StaffAccountModal,
    RealTimeClock
  },
  data() {
    return {
      activeSection: 'users',
      tooltip: {
        show: false,
        text: '',
        x: 0,
        y: 0,
        chartId: ''
      },
      allUsers: [],
      transactions: [],
      announcements: [],
      currentPage: 1,
      clearancePage: 1,
      indigencyPage: 1,
      residencyPage: 1,
      perPage: 10,
      totalTransactions: 0,
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      selectedUsers: [],
      selectAll: false,
      selectAllStudents: false,
      selectAllProfessors: false,
      loadingUsers: false,
      loadingTransactions: false,
      loadingAnnouncements: false,
      userError: null,
      transactionError: null,
      announcementError: null,
      dateFilter: '30',
      showAnnouncementModal: false,
      editingAnnouncement: null,
      newAnnouncement: {
        title: '',
        content: '',
        recipientIds: []
      },
      user: {
        name: '',
        email: '',
        role: ''
      },
      sidebarOpen: false,
      isCollapsed: false,
      showConfirmModal: false,
      showCreateStaffModal: false,
      creatingStaff: false,
      createStaffError: '',
      confirmMessage: '',
      deleteAction: null,
      maintenanceEnabled: false,
      maintenanceMessage: '',
      maintenanceEstimate: '',
      adminProfile: {
        FirstName: '', MiddleName: '', LastName: '', BirthDate: '',
        Gender: '', ContactNo: '', Email: '', Address: '',
        TermStart: '', TermEnd: ''
      },
      isSavingProfile: false,
      pendingUsersCount: 0,
      intervalId: null
    }
  },
  computed: {
    sectionTitle() {
      const sections = {
        users: 'User Management',
        transactions: 'Transaction History',
        system: 'System Settings',
        profile: 'Personal Profile'
      }
      return sections[this.activeSection] || 'Admin Dashboard'
    },
    computedAdminAge() {
      if (!this.adminProfile.BirthDate) return "";
      const today = new Date();
      const birthDate = new Date(this.adminProfile.BirthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    userInitials() {
      return this.user.name
        ? this.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'AU'
    },
    filteredUsers() {
      return this.allUsers.filter(user => {
        const search = this.searchQuery.toLowerCase()
        return (
          (user.name?.toLowerCase().includes(search)) ||
          (user.email?.toLowerCase().includes(search)) ||
          (user.contact?.toLowerCase().includes(search)) ||
          (user.address?.toLowerCase().includes(search)) ||
          (user.birthdate?.toLowerCase().includes(search)) ||
          (user.role?.toLowerCase().includes(search)) ||
          (user.adminRole?.toLowerCase().includes(search)) ||
          (user.position?.toLowerCase().includes(search)) ||
          (user.skPosition?.toLowerCase().includes(search)) ||
          (user.status?.toLowerCase().includes(search))
        )
      })
    },
    filteredTransactions() {
      let filtered = this.transactions.filter(tx => {
        const search = this.searchQuery.toLowerCase()
        return (
          (tx.id?.toLowerCase().includes(search)) ||
          (tx.userName?.toLowerCase().includes(search)) ||
          (tx.documentType?.toLowerCase().includes(search)) ||
          (tx.type?.toLowerCase().includes(search)) ||
          (tx.purpose?.toLowerCase().includes(search))
        )
      })

      if (this.dateFilter !== 'all') {
        const days = parseInt(this.dateFilter)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        filtered = filtered.filter(tx => {
          const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt)
          return txDate >= cutoffDate
        })
      }

      return filtered
    },
    clearanceTransactions() {
      return this.filteredTransactions.filter(tx => {
        const type = (tx.documentType || tx.type || '').toLowerCase().trim();
        return type === 'barangay-certificate' || 
               type === 'barangay-clearance' || 
               type === 'clearance' || 
               type === 'certificate-of-residency' || 
               type === 'residency' || 
               type === 'residency-certificate' ||
               type === 'barangay-id' ||
               type === 'business-permit' ||
               (!type.includes('indigency') && !type.includes('indigent') && !type.includes('financial') && !type.includes('general'));
      });
    },
    residencyTransactions() {
      return this.filteredTransactions.filter(tx => {
        const type = (tx.documentType || tx.type || '').toLowerCase().trim();
        return type === 'certificate-of-indigency-financial' || type.includes('financial');
      });
    },
    indigencyTransactions() {
      return this.filteredTransactions.filter(tx => {
        const type = (tx.documentType || tx.type || '').toLowerCase().trim();
        return type === 'certificate-of-indigency-general' || 
               type === 'certificate-of-indigency' || 
               type === 'indigency-certificate' || 
               type === 'indigency' || 
               type === 'indigent' ||
               (type.includes('indigency') && !type.includes('financial')) ||
               (type.includes('indigent') && !type.includes('financial'));
      });
    },
    paginatedClearance() {
      const start = (this.clearancePage - 1) * this.perPage;
      return this.clearanceTransactions.slice(start, start + this.perPage);
    },
    paginatedResidency() {
      const start = (this.residencyPage - 1) * this.perPage;
      return this.residencyTransactions.slice(start, start + this.perPage);
    },
    paginatedIndigency() {
      const start = (this.indigencyPage - 1) * this.perPage;
      return this.indigencyTransactions.slice(start, start + this.perPage);
    },
    totalPagesClearance() {
      return Math.ceil(this.clearanceTransactions.length / this.perPage);
    },
    totalPagesResidency() {
      return Math.ceil(this.residencyTransactions.length / this.perPage);
    },
    totalPagesIndigency() {
      return Math.ceil(this.indigencyTransactions.length / this.perPage);
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredTransactions.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredTransactions.length / this.perPage)
    },
    unreadAnnouncements() {
      return this.announcements.filter(a => !a.read).length
    },
    students() {
      return this.filteredUsers.filter(user => user.role === 'resident')
    },
    professors() {
      return this.filteredUsers.filter(user => user.role !== 'resident')
    },
    userStats() {
      const users = this.allUsers;
      const residents = users.filter(u => u.role === 'resident');
      const officials = users.filter(u => u.role === 'barangay_official' || u.role === 'barangay_staff');
      const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
      
      const residentApproved = residents.filter(u => u.status === 'approved' || u.status === 'active' || u.isApproved).length;
      const residentPending = residents.filter(u => u.status === 'pending' || u.status === 'pending_validation').length;
      
      return {
        roles: [
          { label: 'Residents', count: residents.length, color: '#3b82f6' },
          { label: 'Admins', count: officials.length, color: '#10b981' },
          { label: 'Super Admins', count: admins.length, color: '#8b5cf6' }
        ],
        status: [
          { label: 'Active', count: residentApproved, color: '#10b981' },
          { label: 'Pending', count: residentPending, color: '#ef4444' }
        ]
      };
    },
    userRoleBarChart() {
      const data = this.userStats.roles;
      const maxCount = Math.max(...data.map(d => d.count), 1);
      const height = 160;
      const width = 500;
      const paddingLeft = 40;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 30;
      const chartHeight = height - paddingTop - paddingBottom;
      const chartWidth = width - paddingLeft - paddingRight;
      const barWidth = Math.min(50, chartWidth / data.length - 20);
      const barSpacing = chartWidth / data.length;
      
      return data.map((d, index) => {
        const barHeight = (d.count / maxCount) * chartHeight;
        const x = paddingLeft + (index * barSpacing) + (barSpacing - barWidth) / 2;
        const y = height - paddingBottom - barHeight;
        return {
          label: d.label,
          count: d.count,
          color: d.color,
          x,
          y,
          width: barWidth,
          height: barHeight
        };
      });
    },
    userStatusDoughnutChart() {
      const data = this.userStats.status;
      const total = data.reduce((acc, d) => acc + d.count, 0) || 1;
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      
      let runningSum = 0;
      return data.map(d => {
        const percentage = d.count / total;
        const length = percentage * circumference;
        const dasharray = `${length} ${circumference - length}`;
        const dashoffset = -runningSum;
        runningSum += length;
        
        return {
          label: d.label,
          count: d.count,
          color: d.color,
          dasharray,
          dashoffset,
          percentage: Math.round(percentage * 100)
        };
      });
    },
    transactionStats() {
      const txs = this.filteredTransactions;
      const certCount = this.clearanceTransactions.length;
      const indFinCount = this.residencyTransactions.length;
      const indGenCount = this.indigencyTransactions.length;
      
      const pending = txs.filter(tx => (tx.status || 'pending').toLowerCase() === 'pending').length;
      const approved = txs.filter(tx => tx.status?.toLowerCase() === 'approved').length;
      const claimed = txs.filter(tx => tx.status?.toLowerCase() === 'claimed').length;
      const rejected = txs.filter(tx => tx.status?.toLowerCase() === 'rejected').length;
      
      return {
        types: [
          { label: 'Brgy Certificate', count: certCount, color: '#0dcaf0' },
          { label: 'Indigency (Financial)', count: indFinCount, color: '#198754' },
          { label: 'Indigency (General)', count: indGenCount, color: '#0d6efd' }
        ],
        status: [
          { label: 'Pending', count: pending, color: '#ffc107' },
          { label: 'Approved', count: approved, color: '#198754' },
          { label: 'Claimed', count: claimed, color: '#0dcaf0' },
          { label: 'Rejected', count: rejected, color: '#dc3545' }
        ]
      };
    },
    transactionTypeBarChart() {
      const data = this.transactionStats.types;
      const maxCount = Math.max(...data.map(d => d.count), 1);
      const height = 160;
      const width = 500;
      const paddingLeft = 40;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 30;
      const chartHeight = height - paddingTop - paddingBottom;
      const chartWidth = width - paddingLeft - paddingRight;
      const barWidth = Math.min(50, chartWidth / data.length - 20);
      const barSpacing = chartWidth / data.length;
      
      return data.map((d, index) => {
        const barHeight = (d.count / maxCount) * chartHeight;
        const x = paddingLeft + (index * barSpacing) + (barSpacing - barWidth) / 2;
        const y = height - paddingBottom - barHeight;
        return {
          label: d.label,
          count: d.count,
          color: d.color,
          x,
          y,
          width: barWidth,
          height: barHeight
        };
      });
    },
    transactionStatusDoughnutChart() {
      const data = this.transactionStats.status;
      const total = data.reduce((acc, d) => acc + d.count, 0) || 1;
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      
      let runningSum = 0;
      return data.map(d => {
        const percentage = d.count / total;
        const length = percentage * circumference;
        const dasharray = `${length} ${circumference - length}`;
        const dashoffset = -runningSum;
        runningSum += length;
        
        return {
          label: d.label,
          count: d.count,
          color: d.color,
          dasharray,
          dashoffset,
          percentage: Math.round(percentage * 100)
        };
      });
    }
  },
  methods: {
    showChartTooltip(e, text, chartId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parent = e.currentTarget.closest('.card-body');
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      this.tooltip = {
        show: true,
        text: text,
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 35,
        chartId: chartId
      };
    },
    hideChartTooltip() {
      this.tooltip = {
        show: false,
        text: '',
        x: 0,
        y: 0,
        chartId: ''
      };
    },
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined');
    },
    async fetchAdminProfile() {
      const currentUser = localDb.getSessionUser() || auth.currentUser;
      const currentUserId = currentUser ? currentUser.id || currentUser.uid : null;
      if (!currentUserId) return;
      
      try {
        if (!this.isFirebaseReady()) {
           const localData = localDb.readDb();
           const userRow = localData.users?.find(u => u.id === currentUserId);
           if (userRow && userRow.profile) {
             this.adminProfile = { 
               ...this.adminProfile, 
               ...userRow.profile,
               TermStart: userRow.profile.TermStart || '',
               TermEnd: userRow.profile.TermEnd || ''
             };
             this.adminProfile.Email = userRow.email || this.adminProfile.Email;
           }
           if (userRow) {
             this.user = {
               name: userRow.profile?.name || userRow.email.split('@')[0],
               email: userRow.email,
               role: userRow.role
             };
           }
        } else {
           const snap = await getDoc(doc(db, "users", currentUserId));
           if (snap.exists()) {
             const userData = snap.data();
             if (userData.profile) {
               this.adminProfile = { 
                 ...this.adminProfile, 
                 ...userData.profile,
                 TermStart: userData.profile.TermStart || '',
                 TermEnd: userData.profile.TermEnd || ''
               };
               this.adminProfile.Email = userData.email || this.adminProfile.Email;
             }
             this.user = {
               name: userData.name || userData.profile?.name || 'User',
               email: userData.email,
               role: userData.role || 'user'
             };
           }
        }
      } catch (err) {
        console.error('Failed to fetch admin profile', err);
      }
    },
    async saveAdminProfile() {
      const currentUser = localDb.getSessionUser() || auth.currentUser;
      const currentUserId = currentUser ? currentUser.id || currentUser.uid : null;
      if (!currentUserId) return;
      this.isSavingProfile = true;
      
      // Update our computed age manually just in case
      let finalAge = "";
      if (this.adminProfile.BirthDate) {
        const today = new Date();
        const birthDate = new Date(this.adminProfile.BirthDate);
        finalAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) finalAge--;
      }
      
      const profileToSave = {
        FirstName: this.adminProfile.FirstName,
        MiddleName: this.adminProfile.MiddleName,
        LastName: this.adminProfile.LastName,
        BirthDate: this.adminProfile.BirthDate,
        Age: finalAge,
        Gender: this.adminProfile.Gender,
        ContactNo: this.adminProfile.ContactNo,
        Address: this.adminProfile.Address,
        TermStart: this.adminProfile.TermStart,
        TermEnd: this.adminProfile.TermEnd,
        name: `${this.adminProfile.FirstName} ${this.adminProfile.LastName}`.trim(),
        updatedAt: new Date().toISOString()
      };

      try {
        if (!this.isFirebaseReady()) {
          const localData = localDb.readDb();
          const userIndex = localData.users?.findIndex(u => u.id === currentUserId);
          if (userIndex !== -1 && localData.users) {
            localData.users[userIndex].profile = {
              ...(localData.users[userIndex].profile || {}),
              ...profileToSave
            };
            if (this.adminProfile.Email && this.adminProfile.Email !== localData.users[userIndex].email) {
              localData.users[userIndex].email = this.adminProfile.Email;
            }
            localDb.writeDb(localData);

            // Sync to local session
            const sessionRaw = localStorage.getItem('barangay_session_v2');
            if (sessionRaw) {
              const session = JSON.parse(sessionRaw);
              session.email = localData.users[userIndex].email;
              localStorage.setItem('barangay_session_v2', JSON.stringify(session));
            }
          }
        } else {
          await updateDoc(doc(db, "users", currentUserId), {
            profile: profileToSave,
            email: this.adminProfile.Email,
            name: profileToSave.name
          });
        }

        // Update local user object reactively
        this.user = {
          name: profileToSave.name || this.adminProfile.Email,
          email: this.adminProfile.Email,
          role: currentUser.role || 'super_admin'
        };

        // Update Vuex store state for dynamic sidebar/header updates
        this.$store.commit('setAuth', {
          uid: currentUserId,
          email: this.adminProfile.Email,
          name: profileToSave.name || this.adminProfile.Email,
          role: currentUser.role || 'super_admin'
        });

        this.$notify.success('Admin profile saved successfully');
      } catch (err) {
        this.$notify.error('Error saving admin profile');
      } finally {
        this.isSavingProfile = false;
      }
    },
    formatRole(role) {
      const map = {
        super_admin: 'Super Admin',
        admin: 'Super Admin',
        barangay_staff: 'Admin',
        barangay_official: 'Admin',
        resident: 'Resident'
      }
      return map[role] || 'User'
    },
    getStatusClass(user) {
      const status = (user.status || '').toLowerCase()
      if (user.isApproved || status === 'approved' || status === 'active') return 'approved'
      if (status === 'pending_validation' || status === 'pending') return 'pending'
      if (status === 'rejected') return 'rejected'
      return status || 'pending'
    },
    getStatusText(user) {
      const status = (user.status || '').toLowerCase()
      if (user.isApproved || status === 'approved' || status === 'active') return 'Active'
      if (status === 'pending_validation') return 'Pending'
      if (status === 'rejected') return 'Rejected'
      return user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending'
    },
    async fetchAllUsers() {
      this.loadingUsers = true
      this.userError = null
      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          let users = dbData.users || [];
          const staffAccounts = dbData.staffAccounts || [];
          
          // Calculate unfiltered pending users count
          this.pendingUsersCount = users.filter(u => u.status === 'pending_validation' || u.status === 'pending').length;

          if (this.roleFilter) {
            if (this.roleFilter === 'barangay_official') {
              users = users.filter((u) => u.role === 'barangay_official' || u.role === 'barangay_staff');
            } else if (this.roleFilter === 'admin') {
              users = users.filter((u) => u.role === 'admin' || u.role === 'super_admin');
            } else {
              users = users.filter((u) => u.role === this.roleFilter);
            }
          }
          if (this.statusFilter) {
            users = users.filter((u) => u.status === this.statusFilter);
          }
          // Combine basic info and profile for table compatibility
          this.allUsers = users.map(u => {
            let createdAt = u.createdAt || u.profile?.createdAt || null;
            if (!createdAt && u.role !== 'resident') {
              const staffAcc = staffAccounts.find(s => s.userId === u.id);
              if (staffAcc) {
                createdAt = staffAcc.createdAt;
              }
            }
            return {
              id: u.id,
              email: u.email,
              role: u.role,
              status: u.status || 'approved',
              isApproved: u.status === 'approved' || u.role !== 'resident',
              name: u.profile?.name || u.email,
              contact: u.profile?.contact || '',
              address: u.profile?.address || '',
              birthdate: u.profile?.birthdate || '',
              createdAt,
              approvedAt: u.approvedAt || null,
              adminRole: u.adminRole || null,
              position: u.position || null,
              skPosition: u.skPosition || null,
            };
          });
          return;
        }

        // Firebase mode
        let q = query(collection(db, 'users'))
        if (this.roleFilter) {
          if (this.roleFilter === 'barangay_official') {
            q = query(q, where('role', 'in', ['barangay_official', 'barangay_staff']))
          } else if (this.roleFilter === 'admin') {
            q = query(q, where('role', 'in', ['admin', 'super_admin']))
          } else {
            q = query(q, where('role', '==', this.roleFilter))
          }
        }
        if (this.statusFilter) {
          q = query(q, where('status', '==', this.statusFilter))
        }
        const snapshot = await getDocs(q)
        this.allUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Fetch unfiltered pending users count in Firebase mode
        const pendingQ = query(collection(db, 'users'), where('status', 'in', ['pending', 'pending_validation']))
        const pendingSnap = await getDocs(pendingQ)
        this.pendingUsersCount = pendingSnap.size

        this.$notify.success('Users loaded successfully')
      } catch (error) {
        console.error('Error fetching users:', error)
        this.userError = 'Failed to load users'
        this.$notify.error('Failed to load users. Please try again.')
      } finally {
        this.loadingUsers = false
      }
    },
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined')
    },
    async handleCreateStaff(staffData) {
      this.creatingStaff = true
      this.createStaffError = ''
      try {
        if (!this.isFirebaseReady()) {
          // Local offline mode
          localDb.createBarangayStaff({
            name: staffData.name,
            email: staffData.email,
            contact: staffData.contact,
            defaultPassword: staffData.password,
            createdBy: this.user.name
          })
          this.$notify.success('Staff account created successfully (Local Mode)')
        } else {
          // Firebase mode: Use secondary app logic if needed, or just warn
          // For now, write to users collection without calling Firebase Auth (assuming functions or manual creation is used for auth) 
          // (Since we are securely modifying just the DB in local-json mode)
          // Note: In real production, this would use a Firebase Cloud Function to create a user safely.
          const docRef = await addDoc(collection(db, 'users'), {
            name: staffData.name,
            email: staffData.email,
            contact: staffData.contact,
            role: 'barangay_staff',
            isApproved: true,
            status: 'approved',
            createdAt: new Date().toISOString()
          })
          this.$notify.success('Staff document created in Firebase')
        }
        this.showCreateStaffModal = false
        this.fetchAllUsers()
      } catch (err) {
        console.error('Error creating staff:', err)
        this.createStaffError = err.message || 'Failed to create staff account'
        this.$notify.error(this.createStaffError)
      } finally {
        this.creatingStaff = false
      }
    },
    async fetchTransactions() {
      this.loadingTransactions = true
      this.transactionError = null
      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const requests = dbData.requests || [];
          const users = dbData.users || [];
          this.transactions = requests.map(req => {
            const user = users.find(u => u.id === req.userId) || {};
            return {
              id: req.id,
              ...req,
              userName: user.profile?.name || user.email || 'Unknown User',
              contact: user.profile?.contact || 'N/A',
              createdAt: req.createdAt
            };
          }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.totalTransactions = this.transactions.length;
          return;
        }

        let q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const transactionsData = []

        for (const docItem of snapshot.docs) {
          const txData = docItem.data()
          const userDoc = await getDoc(doc(db, 'users', txData.userId))
          const userData = userDoc.exists() ? userDoc.data() : {}
          transactionsData.push({
            id: docItem.id,
            ...txData,
            userName: userData?.name || 'Unknown User',
            contact: userData?.contact || 'N/A',
            createdAt: txData.createdAt
          })
        }

        this.transactions = transactionsData
        this.totalTransactions = transactionsData.length
        this.$notify.success('Transactions loaded successfully')
      } catch (error) {
        console.error('Error fetching transactions:', error)
        this.transactionError = 'Failed to load transactions'
        this.$notify.error('Failed to load transactions. Please try again.')
      } finally {
        this.loadingTransactions = false
      }
    },
    async fetchAnnouncements() {
      this.loadingAnnouncements = true
      this.announcementError = null
      try {
        if (!this.isFirebaseReady()) {
          this.announcements = [];
          return;
        }

        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        this.announcements = []
        for (const doc of snapshot.docs) {
          const data = doc.data()
          if (
            this.user.role === 'admin' ||
            !data.recipientIds ||
            data.recipientIds.length === 0 ||
            data.recipientIds.includes(auth.currentUser?.uid)
          ) {
            this.announcements.push({
              id: doc.id,
              ...data
            })
          }
        }
        this.$notify.success('Announcements loaded successfully')
      } catch (error) {
        console.error('Error fetching announcements:', error)
        this.announcementError = 'Failed to load announcements'
        this.$notify.error('Failed to load announcements. Please try again.')
      } finally {
        this.loadingAnnouncements = false
      }
    },
    async getRecipientNames(recipientIds) {
      if (!recipientIds || !recipientIds.length) return 'All Users'
      try {
        const names = []
        for (const id of recipientIds) {
          const userDoc = await getDoc(doc(db, 'users', id))
          if (userDoc.exists()) {
            names.push(userDoc.data().name || 'Unknown')
          }
        }
        return names.join(', ') || 'Unknown Users'
      } catch (error) {
        console.error('Error fetching recipient names:', error)
        return 'Unknown Users'
      }
    },
    formatDate(date) {
      if (!date) return 'N/A'
      const d = date?.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedUsers = this.filteredUsers.map(user => user.id)
      } else {
        this.selectedUsers = []
      }
    },
    toggleSelectAllStudents() {
      if (this.selectAllStudents) {
        const studentIds = this.students.map(user => user.id)
        this.selectedUsers = [...new Set([...this.selectedUsers, ...studentIds])]
      } else {
        const studentIds = this.students.map(user => user.id)
        this.selectedUsers = this.selectedUsers.filter(id => !studentIds.includes(id))
      }
    },
    toggleSelectAllProfessors() {
      if (this.selectAllProfessors) {
        const profIds = this.professors.map(user => user.id)
        this.selectedUsers = [...new Set([...this.selectedUsers, ...profIds])]
      } else {
        const profIds = this.professors.map(user => user.id)
        this.selectedUsers = this.selectedUsers.filter(id => !profIds.includes(id))
      }
    },
    async bulkApproveUsers() {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot approve users in local mode')
        return
      }
      const approvalTargets = this.selectedUsers.filter(userId => {
        const user = this.allUsers.find(u => u.id === userId)
        return user && user.role !== 'resident'
      })
      if (approvalTargets.length === 0) {
        this.$notify.error('No pending staff accounts selected for approval')
        return
      }
      this.confirmMessage = `Are you sure you want to approve ${approvalTargets.length} staff/official users?`
      this.deleteAction = async () => {
        try {
          const promises = approvalTargets.map(userId => {
            const userRef = doc(db, 'users', userId)
            return updateDoc(userRef, {
              isApproved: true,
              status: 'approved',
              updatedAt: new Date()
            })
          })
          await Promise.all(promises)
          this.fetchAllUsers()
          this.selectedUsers = []
          this.selectAll = false
          this.selectAllStudents = false
          this.selectAllProfessors = false
          this.$notify.success(`${approvalTargets.length} users approved successfully`)
        } catch (error) {
          console.error('Error approving users:', error)
          this.$notify.error('Failed to approve users. Please try again.')
        }
      }
      this.showConfirmModal = true
    },
    async bulkDeleteUsers() {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot delete users in local mode')
        return
      }
      this.confirmMessage = `Are you sure you want to delete ${this.selectedUsers.length} users?`
      this.deleteAction = async () => {
        try {
          const promises = this.selectedUsers.map(userId => deleteDoc(doc(db, 'users', userId)))
          await Promise.all(promises)
          this.fetchAllUsers()
          const count = this.selectedUsers.length
          this.selectedUsers = []
          this.selectAll = false
          this.selectAllStudents = false
          this.selectAllProfessors = false
          this.$notify.success(`${count} users deleted successfully`)
        } catch (error) {
          console.error('Error deleting users:', error)
          this.$notify.error('Failed to delete users. Please try again.')
        }
      }
      this.showConfirmModal = true
    },
    async approveUser(user) {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot approve user in local mode')
        return
      }
      try {
        const userRef = doc(db, 'users', user.id)
        const updateData = {
          isApproved: true,
          status: 'approved',
          adminRole: user.role === 'admin' ? 'Support' : null,
          updatedAt: new Date()
        }
        
        await updateDoc(userRef, updateData)
        this.fetchAllUsers()
        this.$notify.success(`User ${user.name} approved successfully`)
      } catch (error) {
        console.error('Error approving user:', error)
        this.$notify.error(`Failed to approve user: ${error.message}`)
      }
    },
    confirmDeleteUser(user) {
      this.confirmMessage = `Are you sure you want to delete ${user.name}?`
      this.deleteAction = () => this.deleteUser(user.id)
      this.showConfirmModal = true
    },
    confirmDeleteAnnouncement(id) {
      this.confirmMessage = 'Are you sure you want to delete this announcement?'
      this.deleteAction = () => this.deleteAnnouncement(id)
      this.showConfirmModal = true
    },
    async deleteUser(userId) {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot delete user in local mode')
        return
      }
      try {
        await deleteDoc(doc(db, 'users', userId))
        this.fetchAllUsers()
        this.$notify.success('User deleted successfully')
      } catch (error) {
        console.error('Error deleting user:', error)
        this.$notify.error('Failed to delete user. Please try again.')
      }
    },
    async deleteAnnouncement(id) {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot delete announcement in local mode')
        return
      }
      try {
        await deleteDoc(doc(db, 'announcements', id))
        this.fetchAnnouncements()
        this.$notify.success('Announcement deleted successfully')
      } catch (error) {
        console.error('Error deleting announcement:', error)
        this.$notify.error('Failed to delete announcement. Please try again.')
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
    },
    changeClearancePage(page) {
      if (page >= 1 && page <= this.totalPagesClearance) {
        this.clearancePage = page;
      }
    },
    changeResidencyPage(page) {
      if (page >= 1 && page <= this.totalPagesResidency) {
        this.residencyPage = page;
      }
    },
    changeIndigencyPage(page) {
      if (page >= 1 && page <= this.totalPagesIndigency) {
        this.indigencyPage = page;
      }
    },
    filterTransactionsByDate() {
      this.currentPage = 1
      this.clearancePage = 1
      this.residencyPage = 1
      this.indigencyPage = 1
      this.fetchTransactions()
    },
    previewDocument(tx) {
      if (tx.documentUrl) {
        window.open(tx.documentUrl, '_blank')
      }
    },
    showCreateAnnouncementModal() {
      this.newAnnouncement = { title: '', content: '', recipientIds: [] }
      this.editingAnnouncement = null
      this.showAnnouncementModal = true
    },
    editAnnouncement(announcement) {
      this.newAnnouncement = { ...announcement }
      this.editingAnnouncement = announcement
      this.showAnnouncementModal = true
    },
    async saveAnnouncement(announcement, editingAnnouncement) {
      if (!this.isFirebaseReady()) {
        this.$notify.error('Cannot save announcements in local mode')
        return
      }
      try {
        if (editingAnnouncement) {
          const announcementRef = doc(db, 'announcements', editingAnnouncement.id)
          await updateDoc(announcementRef, {
            title: announcement.title,
            content: announcement.content,
            recipientIds: announcement.recipientIds || [],
            updatedAt: new Date()
          })
          this.$notify.success('Announcement updated successfully')
        } else {
          await addDoc(collection(db, 'announcements'), {
            title: announcement.title,
            content: announcement.content,
            recipientIds: announcement.recipientIds || [],
            createdAt: new Date(),
            read: false
          })
          this.$notify.success('Announcement created successfully')
        }
        this.showAnnouncementModal = false
        this.fetchAnnouncements()
      } catch (error) {
        console.error('Error saving announcement:', error)
        this.$notify.error('Failed to save announcement: ' + error.message)
      }
    },
    closeAnnouncementModal() {
      this.showAnnouncementModal = false
    },
    closeConfirmModal() {
      this.showConfirmModal = false
      this.deleteAction = null
      this.confirmMessage = ''
    },
    executeDelete() {
      if (this.deleteAction) {
        this.$refs.confirmationModal.startDeleting()
        this.deleteAction().finally(() => {
          this.$refs.confirmationModal.stopDeleting()
          this.closeConfirmModal()
        })
      }
    },
    exportUsers() {
      try {
        const data = this.allUsers.map(user => ({
          ID: user.id,
          Name: user.name,
          Email: user.email,
          Contact: user.contact || 'N/A',
          Address: user.address || 'N/A',
          Birthdate: user.birthdate || 'N/A',
          Role: this.formatRole(user.role),
          Position: user.role === 'super_admin' ? 'Chairman' : ((user.role === 'barangay_staff' || user.role === 'barangay_official') ? 'Barangay Official' : (user.adminRole || user.position || user.skPosition || 'N/A')),
          Status: this.getStatusText(user),
          Approved: (user.isApproved || user.status === 'approved' || user.status === 'active') ? 'Yes' : 'No',
          CreatedAt: this.formatDate(user.createdAt)
        }))
        this.exportExcel('UsersExport.xlsx', data)
        this.$notify.success('Users data exported successfully')
      } catch (e) {
        console.error('Export users failed:', e)
        this.$notify.error('Failed to export users. Please try again.')
      }
    },
    exportTransactions() {
      try {
        const data = this.filteredTransactions.map(tx => ({
          Transaction_ID: tx.id,
          Name: tx.userName,
          Contact: tx.contact || 'N/A',
          Document_Type: (() => {
            const type = (tx.documentType || tx.type || '').toLowerCase().trim();
            if (type === 'certificate-of-indigency-financial' || type.includes('financial')) {
              return 'Certificate of Indigency (Financial Assistance)';
            }
            if (type === 'certificate-of-indigency-general' || type === 'certificate-of-indigency' || type === 'indigency-certificate' || type === 'indigency' || type === 'indigent' || type.includes('indigency') || type.includes('indigent')) {
              return 'Certificate of Indigency (General Purpose)';
            }
            return 'Barangay Certificate';
          })(),
          Purpose: tx.purpose || 'N/A',
          Status: tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase() : 'Pending',
          Request_Date: this.formatDate(tx.createdAt),
          Date_Claimed: tx.claimedAt ? this.formatDate(tx.claimedAt) : 'N/A'
        }))
        this.exportExcel('TransactionsExport.xlsx', data)
        this.$notify.success('Transactions data exported successfully')
      } catch (e) {
        console.error('Export transactions failed:', e)
        this.$notify.error('Failed to export transactions. Please try again.')
      }
    },
    exportExcel(filename, jsonData) {
      const worksheet = XLSX.utils.json_to_sheet(jsonData)
      
      // Auto-fit column widths
      const cols = []
      if (jsonData.length > 0) {
        const keys = Object.keys(jsonData[0])
        keys.forEach(key => {
          let maxLen = key.toString().length
          jsonData.forEach(row => {
            const val = row[key] ? row[key].toString() : ''
            if (val.length > maxLen) {
              maxLen = val.length
            }
          })
          cols.push({ wch: maxLen + 3 })
        })
        worksheet['!cols'] = cols
      }

      const headerRange = XLSX.utils.decode_range(worksheet['!ref'])
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
        if (!worksheet[cellAddress]) continue
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFFFF' } },
          fill: { fgColor: { rgb: 'FF1F497D' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } }
          }
        }
      }
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      XLSX.writeFile(workbook, filename)
    },
    async logout() {
      try {
        await signOut(auth)
        await this.$store.dispatch('logout')
        this.$router.push('/login')
      } catch (error) {
        console.error('Error logging out:', error)
        this.$notify.error('Failed to logout. Please try again.')
      }
    },
    formatToDatetimeLocal(date) {
      if (!date) return '';
      const d = date?.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    async loadMaintenanceSettings() {
      if (!this.isFirebaseReady()) {
        const localData = localDb.readDb();
        const maintenance = localData.maintenance || {};
        this.maintenanceEnabled = maintenance.enabled || false;
        this.maintenanceMessage = maintenance.message || '';
        this.maintenanceEstimate = maintenance.estimatedCompletion ? this.formatToDatetimeLocal(maintenance.estimatedCompletion) : '';
        this.$store.commit('setMaintenance', {
          enabled: this.maintenanceEnabled,
          message: this.maintenanceMessage,
          estimatedCompletion: this.maintenanceEstimate
        });
        return;
      }
      try {
        const docRef = doc(db, 'system', 'maintenance')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          this.maintenanceEnabled = data.enabled || false
          this.maintenanceMessage = data.message || ''
          this.maintenanceEstimate = data.estimatedCompletion ? this.formatToDatetimeLocal(data.estimatedCompletion) : ''
          this.$store.commit('setMaintenance', {
            enabled: this.maintenanceEnabled,
            message: this.maintenanceMessage,
            estimatedCompletion: this.maintenanceEstimate
          });
        }
      } catch (error) {
        console.error('Error loading maintenance settings:', error)
        this.$notify.error('Failed to load maintenance settings. Please try again.')
      }
    },
    async saveMaintenanceSettings() {
      // Validate that if enabled, estimate is set
      if (this.maintenanceEnabled && !this.maintenanceEstimate) {
        this.$notify.error('Please select an estimated completion date and time.');
        return;
      }

      if (!this.isFirebaseReady()) {
        try {
          const localData = localDb.readDb();
          localData.maintenance = {
            enabled: this.maintenanceEnabled,
            message: this.maintenanceMessage,
            estimatedCompletion: this.maintenanceEstimate,
            updatedAt: new Date().toISOString()
          };
          localDb.writeDb(localData);
          this.$store.commit('setMaintenance', {
            enabled: this.maintenanceEnabled,
            message: this.maintenanceMessage,
            estimatedCompletion: this.maintenanceEstimate
          });
          this.$notify.success('Maintenance settings saved successfully (Local Mode)');
        } catch (error) {
          console.error('Error saving maintenance settings:', error);
          this.$notify.error('Failed to save maintenance settings.');
        }
        return;
      }
      try {
        const docRef = doc(db, 'system', 'maintenance')
        await setDoc(docRef, {
          enabled: this.maintenanceEnabled,
          message: this.maintenanceMessage,
          estimatedCompletion: this.maintenanceEstimate,
          updatedAt: new Date()
        })
        
        this.$store.commit('setMaintenance', {
          enabled: this.maintenanceEnabled,
          message: this.maintenanceMessage,
          estimatedCompletion: this.maintenanceEstimate
        });
        this.$notify.success('Maintenance settings saved successfully')
      } catch (error) {
        console.error('Error saving maintenance settings:', error)
        this.$notify.error('Failed to save maintenance settings. Please try again.')
      }
    },
    toggleMaintenance() {
      if (this.maintenanceEnabled) {
        this.maintenanceMessage = 'Our barangay system is currently undergoing scheduled maintenance. We apologize for the inconvenience and appreciate your patience.'
        this.maintenanceEstimate = this.formatToDatetimeLocal(Date.now() + 86400000); // 24 hours from now
      } else {
        this.maintenanceMessage = ''
        this.maintenanceEstimate = ''
      }
    },
    syncLocalData() {
      const dbData = localDb.readDb();
      const users = dbData.users || [];
      this.pendingUsersCount = users.filter(u => u.status === 'pending_validation' || u.status === 'pending').length;
    }
  },
  created() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const userData = userSnap.data()
            this.user = {
              name: userData.name || 'User',
              email: user.email,
              role: userData.role || 'user'
            }
          } else {
            this.user = {
              name: user.displayName || 'User',
              email: user.email,
              role: 'user'
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          this.$notify.error('Failed to load user profile. Please refresh the page.')
        }
      }
    })

    this.fetchAllUsers()
    this.fetchTransactions()
    this.fetchAnnouncements()
    this.loadMaintenanceSettings()
    this.fetchAdminProfile()

    // Sync count of pending users dynamically in local offline mode
    if (!this.isFirebaseReady()) {
      this.intervalId = setInterval(() => {
        this.syncLocalData();
      }, 2000);
      window.addEventListener('storage', this.syncLocalData);
    }
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('storage', this.syncLocalData);
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 4px;
  color: white;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #4CAF50;
}

.notification.error {
  background-color: #F44336;
}

.notification.fade-out {
  animation: fadeOut 0.3s ease-in;
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>


<style scoped>
/* Base Styles */
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-container .input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
}

.input-container .form-control {
  padding-left: 2.5rem !important;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: fixed;
  height: 100vh;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.sidebar-brand {
  color: white;
  text-decoration: none;
  display: block;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
}

.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .brand-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #1e3a8a;
  font-size: 0.7rem;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
}

.sidebar-toggle:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: #f8f9fa;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow: hidden;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 0 0.5rem;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.logout-icon {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.logout-text {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .logout-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  transition: all 0.3s ease;
  overflow-x: auto;
  margin-left: 260px;
}

.main-content.expanded {
  margin-left: 70px;
}

.content-wrapper {
  padding: 2rem;
  min-height: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.content-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 16px 10px 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  width: 280px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.notification-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.notification-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-export {
  background: #2563eb;
  color: white;
}

.btn-export:hover {
  background: #1d4ed8;
}

.btn-refresh {
  background: #f1f5f9;
  color: #475569;
}

.btn-refresh:hover {
  background: #e2e8f0;
}

.btn-approve {
  background: #dcfce7;
  color: #166534;
}

.btn-approve:hover {
  background: #bbf7d0;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.card-body {
  padding: 0;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead tr {
  background: #f8fafc;
}

.data-table th {
  padding: 16px 12px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #1e293b;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: #f8fafc;
}

/* User Cell Styles */
.user-cell {
  display: flex;
  align-items: center;
}

.user-details small {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved,
.status-badge.completed,
.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending,
.status-badge.pending_validation {
  background: #fef9c3;
  color: #854d0e;
}

.status-badge.rejected,
.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.claimed {
  background: #e0f2fe;
  color: #0369a1;
}

.status-badge.compliance {
  background: #e0f2fe;
  color: #0369a1;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-preview {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-preview:hover {
  background: #c7d2fe;
}

.btn-edit {
  background: #fef9c3;
  color: #854d0e;
}

.btn-edit:hover {
  background: #fef08a;
}

/* Loading and Error States */
.loading-indicator {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.error-message {
  padding: 24px;
  text-align: center;
  color: #dc2626;
  font-size: 0.875rem;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
}

.pagination button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #2563eb;
}

.pagination button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Filter Group */
.filter-group {
  display: flex;
  gap: 12px;
}

.filter-group select {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #2563eb;
}

/* Announcement Styles */
.announcement-list {
  padding: 24px;
}

.announcement-item {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.announcement-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.announcement-header .date {
  font-size: 0.8rem;
  color: #64748b;
}

.announcement-item p {
  margin: 8px 0;
  color: #475569;
}

.announcement-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;

}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }

  .sidebar-header h3,
  .user-info,
  .nav-section h4,
  .sidebar-nav li a span {
    display: none;
  }

  .sidebar-nav li a {
    justify-content: center;
    padding: 16px 0;
  }

  .sidebar-nav li a i {
    margin-right: 0;
    font-size: 1.25rem;
  }

  .search-box input {
    width: 200px;
  }

  .data-table th,
  .data-table td {
    padding: 12px 8px;
    font-size: 0.8rem;
  }

  .filter-group {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 16px;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h3 {
    display: block;
  }

  .user-profile {
    display: none;
  }

  .sidebar-nav {
    display: flex;
    padding: 0;
  }

  .nav-section {
    margin: 0;
  }

  .nav-section h4 {
    display: none;
  }

  .sidebar-nav ul {
    display: flex;
    width: 100%;
  }

  .sidebar-nav li {
    flex: 1;
  }

  .sidebar-nav li a {
    flex-direction: column;
    padding: 12px 8px;
    font-size: 0.75rem;
    text-align: center;
  }

  .sidebar-nav li a i {
    margin-bottom: 4px;
    font-size: 1.25rem;
  }

  .main-content {
    padding: 16px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .search-box input {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .data-table th,
  .data-table td {
    padding: 10px 6px;
    font-size: 0.75rem;
  }

  .data-table th:nth-child(4),
  .data-table td:nth-child(4),
  .data-table th:nth-child(5),
  .data-table td:nth-child(5) {
    display: none;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    width: 100%;
  }
}

/* Add these styles to your existing styles */
.maintenance-controls {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1e293b;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}
#notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-select-arrow {
  appearance: none;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding-right: 2.25rem !important;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.custom-select-arrow:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Switch toggle styles */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-toggle {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: .4s;
  border-radius: 34px;
}

.slider-toggle:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider-toggle {
  background-color: #e53e3e; /* Red for offline/maintenance mode */
}

input:focus + .slider-toggle {
  box-shadow: 0 0 1px #e53e3e;
}

input:checked + .slider-toggle:before {
  transform: translateX(30px);
}

.status-label {
  font-size: 0.95rem;
  transition: color 0.3s;
}

/* Custom Dashboard SVG Charts Styling */
.bar-rect {
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1), y 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  cursor: pointer;
}
.bar-rect:hover {
  opacity: 0.85;
}
.bar-chart-svg text {
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
}

.chart-tooltip-bubble {
  position: absolute;
  background: #1e293b;
  color: #ffffff;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  pointer-events: none;
  transform: translate(-50%, -100%);
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
  transition: left 0.15s ease-out, top 0.15s ease-out;
}
.chart-tooltip-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}
</style>
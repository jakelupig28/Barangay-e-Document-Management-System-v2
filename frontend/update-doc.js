const fs = require('fs');

let doc = fs.readFileSync('src/components/official/PrintableDocument.vue', 'utf8');

const newTemplate = `<template>
  <div class="printable-document" ref="printableContent">
    <div class="no-print" style="margin-bottom: 20px;">
      <button class="back-home-btn" @click="$router.push('/official/dashboard')">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
      </button>
    </div>

    <div class="document-header">
      <div class="header-main-layout">
        <div class="logo-side left">
          <div class="placeholder-circle">LOGO</div>
        </div>
        <div class="header-text-center">
          <p class="header-text bold">REPUBLIC OF THE PHILIPPINES</p>
          <p class="header-text bold">CITY OF MANILA</p>
          <p class="header-text bold" style="margin-bottom: 8px;">BARANGAY 123, DISTRICT IV</p>
        </div>
        <div class="logo-side right">
          <div class="placeholder-circle">SEAL</div>
        </div>
      </div>
      <div class="header-separator"></div>
    </div>

    <div class="document-title">
      <h2 class="title-underline">{{ getDocumentTypeLabel(documentType).toUpperCase() }}</h2>
    </div>

    <div class="document-body">
      <div class="to-whom">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
      </div>

      <div class="content">
        <p class="document-text indent-first">
          This is to certify that <strong>{{ name.toUpperCase() }}</strong>, 
          of legal age, is a bona fide resident of <strong>BARANGAY 123</strong>.
        </p>

        <p class="document-text indent-first" v-if="documentType === 'barangay-clearance'">
          This further certifies that <strong>{{ name.toUpperCase() }}</strong> has no derogatory record 
          filed in this office and is known to be of good moral character.
        </p>

        <p class="document-text indent-first" v-if="documentType === 'residency-certificate'">
          This certification is issued upon the request of the above-named person 
          for <strong>{{ (purpose || 'LOCAL EMPLOYMENT').toUpperCase() }}</strong> purposes.
        </p>

        <p class="document-text indent-first" v-if="documentType === 'indigency-certificate'">
          This is to certify further that <strong>{{ name.toUpperCase() }}</strong> belongs to 
          an indigent family in this barangay and this certification is issued 
          for <strong>{{ (purpose || 'LOCAL EMPLOYMENT').toUpperCase() }}</strong> purposes.
        </p>

        <p class="document-text indent-first" v-if="documentType === 'business-permit'">
          This is to certify that <strong>{{ name.toUpperCase() }}</strong> is permitted to operate 
          a business named <strong>{{ businessName || '[Business Name]' }}</strong> located at 
          <strong>{{ businessAddress || residentAddress }}</strong> in this barangay.
          This permit is valid until <strong>{{ formatDate(expiryDate) }}</strong>.
        </p>

        <p class="document-text indent-first mt-5">
          Issued this <strong>{{ currentDay }}</strong> day of <strong>{{ currentMonth }}, {{ currentYear }}</strong> at Barangay 123, District IV, City of Manila.
        </p>
      </div>

      <div class="signature-section-row">
        <div class="seal-container">
          <div class="seal-circle-outline">
            <span class="seal-text-slanted">OFFICIAL SEAL</span>
          </div>
        </div>
        
        <div class="signature-container">
          <p class="signatory-name"><strong>HON. JUAN DELA CRUZ</strong></p>
          <div class="signature-line-dark"></div>
          <p class="signatory-title">Barangay Captain</p>
        </div>
      </div>
    </div>
  </div>
</template>`;

const newStyle = `<style scoped>
.printable-document {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  font-family: Arial, sans-serif;
  color: #333;
}

@media print {
  .no-print {
      display: none !important;
  }
  .printable-document {
    padding: 0;
  }
}

.back-home-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.back-home-btn:hover {
  background: #0b5ed7;
}

/* Header layout */
.header-main-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logo-side {
  flex: 0 0 100px;
  display: flex;
  justify-content: center;
}

.placeholder-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.header-text-center {
  flex: 1;
  text-align: center;
}

.header-text {
  margin: 0;
  font-size: 0.95rem;
  color: #1e3a8a;
  line-height: 1.5;
}

.header-text.bold {
  font-weight: 800;
  letter-spacing: 0.5px;
}

.header-separator {
  border-bottom: 2px solid #1e3a8a;
  margin-bottom: 40px;
}

.document-title {
  text-align: center;
  margin-bottom: 50px;
}

.title-underline {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1e3a8a;
  margin: 0;
  letter-spacing: 1px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.document-body {
  padding: 0 20px;
}

.to-whom p {
  font-size: 1rem;
  color: #1a202c;
  margin-bottom: 30px;
}

.content {
  margin-bottom: 60px;
  line-height: 2;
  font-size: 1.05rem;
  color: #1a202c;
}

.document-text {
  margin-bottom: 20px;
  text-align: justify;
  font-weight: 300;
}

.indent-first {
  text-indent: 50px;
}

.mt-5 {
  margin-top: 50px;
}

.signature-section-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
  min-height: 150px;
}

.seal-container {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 20px;
}

.seal-circle-outline {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px solid #8b96d9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-text-slanted {
  color: #8b96d9;
  font-weight: 900;
  font-size: 1rem;
  transform: rotate(-15deg);
  letter-spacing: 1px;
}

.signature-container {
  flex: 1;
  text-align: right;
  padding-right: 40px;
}

.signatory-name {
  margin: 0;
  font-size: 1.05rem;
  color: #1a202c;
}

.signature-line-dark {
  border-bottom: 1px solid #1a202c;
  width: 100%;
  max-width: 250px;
  margin: 5px 0 5px auto;
}

.signatory-title {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 300;
  padding-right: 15px;
}
</style>`;

doc = doc.replace(/<template>[\s\S]*<\/template>/m, newTemplate);
doc = doc.replace(/<style scoped>[\s\S]*<\/style>/m, newStyle);
fs.writeFileSync('src/components/official/PrintableDocument.vue', doc, 'utf8');
console.log('Successfully updated PrintableDocument.vue');
<template>
  <div class="printable-document" ref="printableContent">
    <div class="cert-outer-double-frame">
      <div class="cert-inner-frame">
        <!-- Header -->
        <div class="cert-preview-header">
          <div class="cert-preview-logo-left">
            <img :src="brgyLogo" class="circle-logo-small" alt="Brgy Logo">
          </div>
          <div class="cert-preview-logo-center">
            <img :src="manilaLogo" class="circle-logo-small" alt="Manila Logo">
          </div>
          <div class="cert-preview-logo-right">
            <img :src="bagongPhiLogo" class="circle-logo-small" alt="Bagong Pilipinas Logo">
          </div>
          <div class="cert-preview-header-text" v-if="customTemplate && customTemplate.header">
            <p v-for="(line, idx) in customTemplate.header.split('\n')" :key="idx" :class="'cert-p-line-' + (idx + 1)">
              {{ line }}
            </p>
          </div>
          <div class="cert-preview-header-text" v-else>
            <div class="cert-p-line-1">REPUBLIC OF THE PHILIPPINES</div>
            <div class="cert-p-line-2">CITY OF MANILA</div>
            <div class="cert-p-line-sub">Vicente G. Cruz St. Corner Lardizabal Extension</div>
            <div class="cert-p-line-3">BARANGAY 424 ZONE 43</div>
            <div class="cert-p-line-dist">DISTRICT IV, MANILA</div>
          </div>
        </div>
        
        <!-- Divider -->
        <div class="cert-header-divider"></div>
        
        <!-- Columns -->
        <div class="cert-columns-container">
          <!-- Right Column -->
          <div class="cert-right-column">
            <div class="cert-preview-title">{{ documentTitle }}</div>
            <div class="cert-preview-no">{{ certificateNumber }}</div>
            
            <div class="cert-preview-body">
              <p class="cert-p-to-whom">TO WHOM IT MAY CONCERN:</p>
              
              <!-- Custom template body if available -->
              <template v-if="customTemplate && customTemplate.body">
                <p v-for="(paragraph, idx) in compiledParagraphs" :key="idx" class="cert-p-main-text" :class="{ 'no-indent': documentType === 'certificate-of-indigency-financial' }" v-html="paragraph"></p>
              </template>
              
              <!-- Fallback to standard hardcoded bodies -->
              <template v-else>
                <!-- Indigency Certificate Case (General and Financial) -->
                <template v-if="documentType === 'certificate-of-indigency-general' || documentType === 'certificate-of-indigency-financial' || documentType === 'indigency-certificate' || documentType === 'certificate-of-indigency'">
                  <p class="cert-p-main-text" :class="{ 'no-indent': documentType === 'certificate-of-indigency-financial' }" v-if="documentType === 'certificate-of-indigency-financial'">
                    This is to certify that <strong>{{ name.toUpperCase() }}</strong>, of legal age, 
                    with address at: <strong>{{ residentAddress }}</strong>, is a bonafide 
                    resident of this barangay and belongs to an indigent family.
                  </p>
                  <p class="cert-p-main-text" v-else>
                    This is to certify that <strong>{{ name.toUpperCase() }}</strong>, of legal age, 
                    with address at: <strong>{{ residentAddress }}</strong>, is a bonafide 
                    resident of this barangay and belongs to an indigent family without any permanent source of income.
                  </p>
                  <p class="cert-p-main-text" :class="{ 'no-indent': documentType === 'certificate-of-indigency-financial' }" v-if="documentType === 'certificate-of-indigency-financial'">
                    This certification is being issued upon the request of the above-named person 
                    for the purpose of availing of <strong>FINANCIAL ASSISTANCE</strong>.
                  </p>
                  <p class="cert-p-main-text" v-else>
                    This certification is being issued upon the request of the above-named person 
                    for whatever purpose it may serve.
                  </p>
                  <p class="cert-p-main-text mt-5" :class="{ 'no-indent': documentType === 'certificate-of-indigency-financial' }">
                    Issued this <strong>{{ currentDay }}</strong> day of <strong>{{ currentMonth }}, {{ currentYear }}</strong> at the Office of the Punong Barangay, Sampaloc Manila.
                  </p>
                </template>

                <!-- Other Cases (Barangay Certificate & Business Permit) -->
                <template v-else>
                  <!-- Barangay Certificate / Clearance / Residency Case -->
                  <template v-if="documentType === 'barangay-certificate' || documentType === 'barangay-clearance' || documentType === 'residency-certificate' || documentType === 'certificate-of-residency'">
                    <p class="cert-p-main-text">
                      This is to certify that <strong>{{ name.toUpperCase() }}</strong> who resides at <strong>{{ residentAddress }}</strong> is a bonafide resident.
                    </p>
                    <p class="cert-p-main-text">
                      He/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.
                    </p>
                    <p class="cert-p-main-text">
                      This certification is being issued upon the request of the above-named person for <strong>{{ (purpose || 'whatever purpose it may serve').toUpperCase() }}</strong>.
                    </p>
                    <p class="cert-p-main-text mt-5">
                      Issued this <strong>{{ currentDay }}</strong> day of <strong>{{ currentMonth }}, {{ currentYear }}</strong> at Barangay 424, Zone 43, District IV, Sampaloc, Manila.
                    </p>
                  </template>

                  <!-- Business Permit Case -->
                  <template v-else-if="documentType === 'business-permit'">
                    <p class="cert-p-main-text">
                      This is to certify that <strong>{{ name.toUpperCase() }}</strong>, 
                      of legal age, is a bona fide resident of <strong>BARANGAY 424, ZONE 43</strong>.
                    </p>
                    <p class="cert-p-main-text">
                      This is to certify that <strong>{{ name.toUpperCase() }}</strong> is permitted to operate 
                      a business named <strong>{{ businessName || '[Business Name]' }}</strong> located at 
                      <strong>{{ businessAddress || residentAddress }}</strong> in this barangay.
                      This permit is valid until <strong>{{ formatDate(expiryDate) }}</strong>.
                    </p>
                    <p class="cert-p-main-text mt-5">
                      Issued this <strong>{{ currentDay }}</strong> day of <strong>{{ currentMonth }}, {{ currentYear }}</strong> at Barangay 424, Zone 43, City of Manila.
                    </p>
                  </template>

                  <!-- Generic Case -->
                  <template v-else>
                    <p class="cert-p-main-text">
                      This is to certify that <strong>{{ name.toUpperCase() }}</strong>, 
                      of legal age, is a bona fide resident of <strong>BARANGAY 424, ZONE 43</strong>.
                    </p>
                    <p class="cert-p-main-text mt-5">
                      Issued this <strong>{{ currentDay }}</strong> day of <strong>{{ currentMonth }}, {{ currentYear }}</strong> at Barangay 424, Zone 43, City of Manila.
                    </p>
                  </template>
                </template>
              </template>
            </div>
            
            <div class="cert-preview-signatures-row">
              <div class="cert-p-captain">
                <div class="cert-p-name">{{ customTemplate && customTemplate.signatory ? customTemplate.signatory.toUpperCase() : 'HON. ANGELITO G. DULA' }}</div>
                <div class="cert-p-title-sub">Barangay Chairman</div>
              </div>
              <div class="cert-p-seal-official">
                <div class="seal-inner-text">The certificate issued by Barangay 424, Zone 43 is not valid without a dry seal.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';
import { ref, computed } from 'vue';
import brgyLogo from '@/assets/brgy logo.jpg';
import manilaLogo from '@/assets/manila logo.png';
import bagongPhiLogo from '@/assets/bagong phi logo.png';

export default {
  props: {
    requestData: {
      type: Object,
      required: true
    },
    barangayInfo: {
      type: Object,
      default: () => ({
        name: 'Sample Barangay',
        address: 'Sample City, Sample Province',
        contact: '0912-345-6789',
        captain: 'Hon. Juan Dela Cruz'
      })
    }
  },
  setup(props, { emit }) {
    const isPrinting = ref(false);
    const printableContent = ref(null);

    // Document details
    const documentType = computed(() => props.requestData.type || props.requestData.documentType);
    const documentNumber = computed(() => props.requestData.id || 'BRGY-' + Math.floor(1000 + Math.random() * 9000));
    const certificateNumber = computed(() => {
      const type = (documentType.value || '').toLowerCase();
      if (type === 'certificate-of-indigency-financial') {
        return 'CERT NO. 893-25';
      } else if (type === 'barangay-certificate' || type === 'barangay-clearance' || type === 'residency-certificate' || type === 'certificate-of-residency') {
        return 'CERT NO. 917-25';
      } else if (type === 'certificate-of-indigency-general' || type === 'certificate-of-indigency' || type === 'indigency-certificate') {
        return 'CERT NO. 878-25';
      }
      return 'CERT NO. 878-25';
    });

    const documentTitle = computed(() => {
      const type = (documentType.value || '').toLowerCase();
      if (type === 'certificate-of-indigency-financial' || type === 'certificate-of-indigency-general' || type === 'certificate-of-indigency' || type === 'indigency-certificate') {
        return 'BARANGAY CERTIFICATE OF INDIGENCY';
      }
      if (type === 'barangay-certificate' || type === 'barangay-clearance' || type === 'residency-certificate' || type === 'certificate-of-residency') {
        return 'BARANGAY CERTIFICATE';
      }
      if (type === 'business-permit') {
        return 'BARANGAY BUSINESS PERMIT';
      }
      if (type === 'barangay-id') {
        return 'BARANGAY IDENTIFICATION';
      }
      return 'BARANGAY CERTIFICATION';
    });
    const name = computed(() => {
      if (props.requestData.onBehalf && props.requestData.recipientName) {
        return props.requestData.recipientName;
      }
      return props.requestData.userName || 'Resident Name';
    });
    const residentAddress = computed(() => props.requestData.address || `${props.barangayInfo.name}, ${props.barangayInfo.address}`);
    const purpose = computed(() => props.requestData.purpose || 'personal');
    const businessName = computed(() => props.requestData.businessName || null);
    const businessAddress = computed(() => props.requestData.businessAddress || null);

    // Custom template resolver
    const customTemplate = computed(() => {
      try {
        const raw = localStorage.getItem('barangay_templates');
        if (!raw) return null;
        let templates = JSON.parse(raw);
        
        // Upgrade templates if old structures are found
        let upgraded = false;
        templates = templates.map(template => {
          if (template.id === 1 && (template.body.includes('derogatory record filed') || template.body.includes('bona fide resident of [RESIDENT ADDRESS].'))) {
            template.body = 'This is to certify that [RESIDENT NAME] who resides at [RESIDENT ADDRESS] is a bonafide resident.\n\nHe/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].';
            upgraded = true;
          }
          if (template.id === 3 && template.body.includes('whatever purpose it may serve')) {
            template.body = 'This is to certify that [RESIDENT NAME], of legal age, is a bona fide resident of [RESIDENT ADDRESS] and belongs to an indigent family without any permanent source of income.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].';
            upgraded = true;
          }
          return template;
        });
        
        if (upgraded) {
          localStorage.setItem('barangay_templates', JSON.stringify(templates));
        }
        
        const reqType = documentType.value ? documentType.value.toLowerCase() : '';
        const reqLabel = getDocumentTypeLabel(documentType.value).toLowerCase();
        
        // 1. Try exact type match
        let matched = templates.find(t => {
          if (!t.type) return false;
          const typeLower = t.type.toLowerCase();
          if (typeLower === reqType) return true;
          // Legacy mappings
          if (reqType === 'barangay-certificate' && (typeLower === 'barangay-clearance' || typeLower === 'residency-certificate' || typeLower === 'certificate-of-residency')) return true;
          if (reqType === 'certificate-of-indigency-general' && (typeLower === 'certificate-of-indigency' || typeLower === 'indigency-certificate')) return true;
          return false;
        });

        // 2. Try exact name match (normalized - stripping "(extracted)", "(converted)")
        if (!matched) {
          matched = templates.find(t => {
            const cleanName = t.name.toLowerCase()
              .replace(/\s*\(extracted\)/g, '')
              .replace(/\s*\(converted\)/g, '')
              .trim();
            return cleanName === reqLabel || cleanName === reqType;
          });
        }

        // 3. Try fuzzy keyword match on the reversed array (newest first)
        if (!matched) {
          const reversedTemplates = [...templates].reverse();
          matched = reversedTemplates.find(t => {
            const tName = t.name.toLowerCase();
            if (reqType.includes('clearance') && tName.includes('clearance')) return true;
            if (reqType.includes('residency') && tName.includes('residency')) return true;
            if (reqType.includes('indigency') && tName.includes('indigency')) {
              // Differentiate between financial and general indigency
              if (reqType.includes('financial') && tName.includes('financial')) return true;
              if (reqType.includes('general') && tName.includes('general')) return true;
              // If request is financial, don't match general templates
              if (reqType.includes('financial') && !tName.includes('financial')) return false;
              // General requests shouldn't match financial templates
              if (!reqType.includes('financial') && tName.includes('financial')) return false;
              // Otherwise match general indigency templates
              return true;
            }
            return false;
          });
        }
        return matched;
      } catch (e) {
        console.error('Error fetching custom template:', e);
        return null;
      }
    });

    const compiledBody = computed(() => {
      if (!customTemplate.value || !customTemplate.value.body) return '';
      let text = customTemplate.value.body;
      text = text.replace(/\[resident name\]/ig, name.value.toUpperCase());
      text = text.replace(/\[resident address\]/ig, residentAddress.value);
      text = text.replace(/\[purpose\]/ig, (purpose.value || 'LOCAL EMPLOYMENT').toUpperCase());
      return text;
    });

    // Dates
    const now = new Date();
    const currentDay = format(now, 'do');
    const currentMonth = format(now, 'MMMM');
    const currentYear = format(now, 'yyyy');

    const compiledParagraphs = computed(() => {
      if (!customTemplate.value || !customTemplate.value.body) return [];
      let text = customTemplate.value.body;
      
      const reqType = documentType.value ? documentType.value.toLowerCase() : '';
      if (reqType.includes('financial')) {
        text = text.replace(/He\/She is one of those who are in need of financial assistance\.?\s*/gi, '');
      }
      
      // Dynamic present date replacement
      const presentDateStr = `${currentDay} day of ${currentMonth}, ${currentYear}`;
      text = text.replace(/Issued this\s+\d+(?:st|nd|rd|th)?\s+day\s+of\s+[A-Za-z]+,?\s+\d{4}/gi, `Issued this ${presentDateStr}`);
      text = text.replace(/Issued this\s+\[current_date\]/gi, `Issued this ${presentDateStr}`);
      text = text.replace(/Issued this\s+\[date\]/gi, `Issued this ${presentDateStr}`);
      text = text.replace(/Issued this\s+\[day\]\s+day\s+of\s+\[month\],?\s+\[year\]/gi, `Issued this ${presentDateStr}`);
      text = text.replace(/\[current_date\]/gi, presentDateStr);
      text = text.replace(/\[date\]/gi, presentDateStr);
      
      text = text.replace(/\[resident name\]/ig, `<strong>${name.value.toUpperCase()}</strong>`);
      text = text.replace(/\[resident address\]/ig, `<strong>${residentAddress.value}</strong>`);
      text = text.replace(/\[purpose\]/ig, `<strong>${(purpose.value || 'LOCAL EMPLOYMENT').toUpperCase()}</strong>`);
      text = text.replace(/(financial assistance)/ig, '<strong>$1</strong>');
      return text.split(/\r?\n/).filter(p => p.trim() !== '');
    });
    const expiryDate = computed(() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    });

    // Barangay info
    const barangayName = computed(() => props.barangayInfo.name);
    const barangayFullAddress = computed(() => {
      const city = props.barangayInfo.city || '';
      const province = props.barangayInfo.province || '';
      return [city, province].filter(Boolean).join(', ') || 'Unknown Location';
    });
    const barangayAddress = computed(() => props.barangayInfo.address);
    const barangayContact = computed(() => props.barangayInfo.contact);
    const barangayCaptain = computed(() => props.barangayInfo.captain);

    const formatDate = (date) => {
      return format(date, 'MMMM d, yyyy');
    };

    const getDocumentTypeLabel = (typeValue) => {
      const types = {
        'business-permit': 'Business Permit',
        'barangay-certificate': 'Barangay Certificate',
        'certificate-of-indigency-financial': 'Certificate of Indigency (Financial Assistance)',
        'certificate-of-indigency-general': 'Certificate of Indigency (General Purpose)',
        // fallbacks
        'barangay-clearance': 'Barangay Certificate',
        'barangay-id': 'Barangay ID',
        'residency-certificate': 'Barangay Certificate',
        'certificate-of-residency': 'Barangay Certificate',
        'indigency-certificate': 'Certificate of Indigency (General Purpose)',
        'certificate-of-indigency': 'Certificate of Indigency (General Purpose)',
        'other': 'Barangay Certification'
      };
      return types[typeValue] || typeValue;
    };

    const printDocument = () => {
      if (!printableContent.value) return;
      isPrinting.value = true;

      const printWin = window.open('', '_blank');
      const content = printableContent.value.innerHTML;

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Barangay Document Preview</title>
            <style>
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; background: white; }
              .printable-document {
                width: 100%;
                max-width: 100% !important;
                height: 100% !important;
                padding: 20mm !important;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            <div class="printable-document">
              ${content}
            </div>
          </body>
        </html>
      `);

      // Copy all style tags and link stylesheet tags from the parent document to the print window
      const parentStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
      parentStyles.forEach(style => {
        printWin.document.head.appendChild(style.cloneNode(true));
      });

      printWin.document.close();
      printWin.focus();

      setTimeout(() => {
        printWin.print();
        printWin.close();
        isPrinting.value = false;
      }, 500);
    };

    const closeDocument = () => {
      emit('close');
    };

    return {
      isPrinting,
      printableContent,
      documentType,
      documentNumber,
      documentTitle,
      name,
      residentAddress,
      purpose,
      businessName,
      businessAddress,
      currentDay,
      currentMonth,
      barangayFullAddress,
      currentYear,
      expiryDate,
      barangayName,
      barangayAddress,
      barangayContact,
      barangayCaptain,
      formatDate,
      getDocumentTypeLabel,
      printDocument,
      closeDocument,
      customTemplate,
      compiledBody,
      compiledParagraphs,
      brgyLogo,
      manilaLogo,
      bagongPhiLogo,
      certificateNumber
    };
  }
};
</script>

<style scoped>
.printable-document {
  max-width: 800px;
  width: 100%;
  aspect-ratio: 1 / 1.414;
  background: white;
  padding: 35px 40px;
  box-sizing: border-box;
  font-family: "Times New Roman", Times, Georgia, serif;
  display: flex;
  flex-direction: column;
  color: #0f172a;
}

.cert-p-main-text.no-indent {
  text-indent: 0 !important;
}

@media print {
  .no-print {
      display: none !important;
  }
  .printable-document {
    padding: 0;
    max-width: 100% !important;
    width: 100% !important;
    height: 100% !important;
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

.cert-outer-double-frame {
  border: 3.5px double #1e3a8a;
  padding: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1;
}

.cert-inner-frame {
  border: 1px solid #1e3a8a;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1;
}

/* Header layout */
.cert-preview-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-bottom: 8px;
  min-height: 110px;
  box-sizing: border-box;
}

.cert-preview-logo-left {
  position: absolute;
  left: 60px;
  top: 0;
  bottom: 0;
  margin-top: auto;
  margin-bottom: auto;
  width: 95px;
  height: 95px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.cert-preview-logo-left img {
  width: 140%;
  height: 140%;
  object-fit: cover;
}

.cert-preview-logo-right {
  position: absolute;
  right: 60px;
  top: 0;
  bottom: 0;
  margin-top: auto;
  margin-bottom: auto;
  width: 95px;
  height: 95px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cert-preview-logo-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cert-preview-logo-center {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.cert-preview-logo-center img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cert-preview-header-text {
  width: 100%;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 125px;
  box-sizing: border-box;
}

.cert-p-line-1 {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e3a8a;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.cert-p-line-2 {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-p-line-sub {
  font-weight: 600;
  font-size: 0.7rem;
  color: #475569;
  line-height: 1.2;
  white-space: nowrap;
}

.cert-p-line-3 {
  font-weight: 800;
  font-size: 1.05rem;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-p-line-dist {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-header-divider {
  width: 100%;
  height: 1.5px;
  background-color: #1e3a8a;
  margin-top: 4px;
}

.cert-columns-container {
  display: flex;
  flex: 1;
  margin-top: 10px;
  min-height: 0;
}

.cert-left-column {
  width: 32%;
  border-right: 1px solid #1e3a8a;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.cert-sb-title {
  font-size: 1.05rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 6px;
  color: #1e3a8a;
  letter-spacing: -0.01em;
}

.cert-sb-subtitle {
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
  margin: 0;
  color: #1e3a8a;
}

.cert-official-item {
  text-align: center;
  line-height: 1.3;
}

.cert-off-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
}

.cert-off-title {
  font-size: 0.72rem;
  color: #1e293b;
  font-weight: 700;
}

.cert-right-column {
  width: 100%;
  padding: 0 45px;
  display: flex;
  flex-direction: column;
  text-align: left;
  box-sizing: border-box;
}

.cert-preview-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #1e3a8a;
  text-align: center;
  margin-top: 35px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.2;
  align-self: center;
}

.cert-preview-no {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  text-align: right;
  margin-bottom: 25px;
  letter-spacing: 0.02em;
}

.cert-preview-body {
  font-size: 1.25rem;
  line-height: 1.85;
  color: #1e293b;
  text-align: justify;
}

.cert-p-to-whom {
  font-weight: 800;
  margin-bottom: 8px;
}
.cert-p-main-text {
  margin-bottom: 32px;
  text-indent: 0;
  white-space: pre-line;
  line-height: 1.85;
  text-align: justify;
}

.cert-preview-signatures-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-bottom: 30px;
}

.cert-p-captain {
  text-align: center;
  width: 55%;
}

.cert-p-name {
  font-weight: 800;
  font-size: 1.05rem;
  border-top: 1.5px solid #1e3a8a;
  padding-top: 4px;
  margin-bottom: 2px;
  color: #1e3a8a;
  white-space: nowrap;
}

.cert-p-title-sub {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 700;
}

.cert-p-seal-official {
  width: 110px;
  height: 110px;
  border: 1.5px dashed #1e3a8a;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  padding: 6px;
  box-sizing: border-box;
  transform: rotate(-10deg);
  opacity: 0.7;
}

.seal-outer-text {
  font-size: 0.55rem;
  font-weight: 800;
  color: #1e3a8a;
  line-height: 1.1;
  text-transform: uppercase;
}

.seal-inner-text {
  font-size: 0.58rem;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1.1;
  margin-top: 2px;
}
</style>
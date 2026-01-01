// src/services/projectReportService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Project Report Service
 * Generates comprehensive HTML reports for projects
 */
const projectReportService = {
  /**
   * Generate comprehensive project report
   * @param {Object} project - Project data
   * @returns {Promise<string>} HTML report
   */
  generateReport: async (project) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📊 Generating report for project:', project.name, 'ID:', project.dbId);
      
      // Fetch all related data with better error handling
      // Around line 20-35 in projectReportService.js
const fetchWithFallback = async (url, fallback) => {
  try {
    console.log('🌐 Fetching:', url);
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Response status for ${url}:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      return fallback;
    }
    
    const data = await response.json();
    console.log(`✅ Data from ${url}:`, JSON.stringify(data).substring(0, 200));
    
    // Validate the response structure
    if (!data || typeof data !== 'object') {
      console.warn(`⚠️ Invalid data structure from ${url}`);
      return fallback;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error.message);
    return fallback;
  }
};

      // Replace the Promise.all section with better ID handling
console.log('🔍 Fetching data for project:', {
  name: project.name,
  dbId: project.dbId,
  id: project.id
});

// Use the correct ID - try dbId first, fall back to id
const projectId = project.dbId || project.id;

if (!projectId) {
  throw new Error('Project ID is missing. Cannot generate report.');
}

console.log('📍 Using project ID:', projectId);

const [materialsRaw, labourRaw, contractsRaw, financialRaw] = await Promise.all([
  fetchWithFallback(
    `${API_BASE_URL}/usage-logs?projectId=${projectId}`,
    { success: false, usageLogs: [] }
  ),
  fetchWithFallback(
    `${API_BASE_URL}/labours/project/${projectId}`,
    { success: false, data: [] }
  ),
  fetchWithFallback(
    `${API_BASE_URL}/contracts/project/${projectId}`,
    { success: false, contracts: [] }
  ),
  fetchWithFallback(
    `${API_BASE_URL}/financial/projects/${projectId}`,
    { success: false, project: { expenses: [] } }
  )
]);

// ✅ Normalize the data structure to match what the rest of the code expects
const materials = {
  success: materialsRaw.success,
  logs: materialsRaw.usageLogs || materialsRaw.logs || []
};

const labour = {
  success: labourRaw.success,
  labourers: labourRaw.data || labourRaw.labourers || []
};

const contracts = {
  success: contractsRaw.success,
  contracts: contractsRaw.contracts || []
};

const financial = {
  success: financialRaw.success,
  project: financialRaw.project || { expenses: [] }
};
      // Add detailed logging
console.log('📊 RAW DATA RECEIVED:');
console.log('Materials:', {
  success: materials.success,
  count: materials.logs?.length || 0,
  sample: materials.logs?.[0] || 'none'
});
console.log('Labour:', {
  success: labour.success,
  count: labour.labourers?.length || 0,
  sample: labour.labourers?.[0] || 'none'
});
console.log('Contracts:', {
  success: contracts.success,
  count: contracts.contracts?.length || 0,
  sample: contracts.contracts?.[0] || 'none'
});
console.log('Financial:', {
  success: financial.success,
  expenseCount: financial.project?.expenses?.length || 0,
  sample: financial.project?.expenses?.[0] || 'none'
});

// Validate we got actual data
if (!materials.success && !labour.success && !contracts.success && !financial.success) {
  console.error('⚠️ WARNING: All API calls failed or returned no data!');
  console.error('This usually means:');
  console.error('1. Project ID is wrong');
  console.error('2. No data exists for this project');
  console.error('3. Backend API is not responding correctly');
}

      // Calculate costs with validation
      const materialCost = Array.isArray(materials.logs) 
        ? materials.logs.reduce((sum, log) => {
            const qty = parseFloat(log.quantity) || 0;
            const price = parseFloat(log.material?.unit_price) || 0;
            return sum + (qty * price);
          }, 0)
        : 0;

      const labourCost = Array.isArray(labour.labourers)
        ? labour.labourers.reduce((sum, lab) => {
            if (Array.isArray(lab.payments)) {
              return sum + lab.payments.reduce((pSum, payment) => 
                pSum + (parseFloat(payment.amount) || 0), 0
              );
            }
            return sum + (parseFloat(lab.totalPaid) || 0);
          }, 0)
        : 0;

      const contractCost = Array.isArray(contracts.contracts)
        ? contracts.contracts.reduce((sum, con) => 
            sum + (parseFloat(con.paidAmount) || 0), 0
          )
        : 0;

      // Categorize financial expenses
      const financialExpenses = Array.isArray(financial.project?.expenses) 
        ? financial.project.expenses 
        : [];
      
     // Separate material-related vs other expenses based on category
const materialCategories = [
  'material', 'paint', 'cement', 'steel', 'wood', 'tiles', 'hardware',
  'glass', 'glasses', 'window', 'door', 'aluminium', 'aluminum', 'iron',
  'brick', 'sand', 'aggregate', 'marble', 'granite', 'plywood', 'ply',
  'pipe', 'wire', 'cable', 'fixture', 'sanitary', 'plumbing', 'electrical'
];
      
      const financialMaterialCost = financialExpenses
  .filter(exp => {
    const category = (exp.category || '').toLowerCase();
    return materialCategories.some(mat => category.includes(mat));
  })
  .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      
      const financialOtherCost = financialExpenses
        .filter(exp => {
          const category = (exp.category || '').toLowerCase();
          return !materialCategories.some(mat => category.includes(mat));
        })
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      const totalCalculated = materialCost + financialMaterialCost + labourCost + contractCost + financialOtherCost;

      console.log('💰 Calculated costs:', {
        materialsFromUsageLogs: materialCost,
        materialsFromFinancial: financialMaterialCost,
        totalMaterials: materialCost + financialMaterialCost,
        labour: labourCost,
        contracts: contractCost,
        otherExpenses: financialOtherCost,
        total: totalCalculated
      });

      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount || 0);
      };

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Report - ${project.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #1f2937;
    }
    .container { 
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .header { 
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #1f2937;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header-meta {
      color: #6b7280;
      font-size: 14px;
    }
    .section { 
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title { 
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid { 
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item { 
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .info-label { 
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-value { 
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }
    .status-badge { 
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #e5e7eb;
    }
    .progress-bar { 
      width: 100%;
      height: 24px;
      background: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill { 
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      color: white;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    table { 
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td { 
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th { 
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    tr:hover { background: #f9fafb; }
    .cost-summary { 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      border: 1px solid #bae6fd;
    }
    .cost-row { 
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #bfdbfe;
    }
    .cost-row:last-child { 
      border-bottom: none;
      font-weight: 700;
      font-size: 18px;
      color: #1e40af;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 2px solid #3b82f6;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .empty { 
      text-align: center;
      padding: 30px;
      color: #9ca3af;
      font-style: italic;
    }
    .warning { 
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      color: #92400e;
      font-size: 14px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${project.name}</h1>
      <div class="header-meta">
        Project ID: ${project.id} | Generated: ${new Date().toLocaleString('en-IN', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Project Overview</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Client</div>
          <div class="info-value">${project.client || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Type</div>
          <div class="info-value">${project.type || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Location</div>
          <div class="info-value">${project.location || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value">
            <span class="status-badge">${project.status || 'N/A'}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Site Engineer</div>
          <div class="info-value">${project.assignedEngineerName || 'Not Assigned'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Timeline</div>
          <div class="info-value">${project.startDate || 'N/A'} to ${project.endDate || 'N/A'}</div>
        </div>
      </div>
      <div style="margin-top: 20px;">
        <div class="info-label">Project Progress</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${project.progress || 0}%">
            ${project.progress || 0}%
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Financial Summary</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Total Budget</div>
          <div class="info-value">${formatCurrency(project.budget || 0)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Spent</div>
          <div class="info-value">${formatCurrency(project.spent || totalCalculated)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Remaining Budget</div>
          <div class="info-value">${formatCurrency((project.budget || 0) - (project.spent || totalCalculated))}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Budget Utilization</div>
          <div class="info-value">${project.budget > 0 ? (((project.spent || totalCalculated) / project.budget) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      
      <div class="cost-summary">
        <div class="cost-row">
          <span>Materials Cost</span>
          <span>${formatCurrency(materialCost + financialMaterialCost)}</span>
        </div>
        ${materialCost > 0 ? `
        <div class="cost-row" style="padding-left: 20px; font-size: 14px; color: #6b7280; border: none;">
          <span>└ From Usage Logs</span>
          <span>${formatCurrency(materialCost)}</span>
        </div>
        ` : ''}
        ${financialMaterialCost > 0 ? `
        <div class="cost-row" style="padding-left: 20px; font-size: 14px; color: #6b7280; border: none;">
          <span>└ From Expenses (Material-related)</span>
          <span>${formatCurrency(financialMaterialCost)}</span>
        </div>
        ` : ''}
        <div class="cost-row">
          <span>Labour Cost</span>
          <span>${formatCurrency(labourCost)}</span>
        </div>
        <div class="cost-row">
          <span>Contract Payments</span>
          <span>${formatCurrency(contractCost)}</span>
        </div>
        ${financialOtherCost > 0 ? `
        <div class="cost-row">
          <span>Other Expenses</span>
          <span>${formatCurrency(financialOtherCost)}</span>
        </div>
        ` : ''}
        <div class="cost-row">
          <span>Total Calculated</span>
          <span>${formatCurrency(totalCalculated)}</span>
        </div>
      </div>
    </div>

    ${materials.logs && materials.logs.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Materials Used (${materials.logs.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Cost</th>
            <th>Date Used</th>
          </tr>
        </thead>
        <tbody>
          ${materials.logs.map(log => {
            const qty = parseFloat(log.quantity) || 0;
            const price = parseFloat(log.material?.unit_price) || 0;
            const total = qty * price;
            return `
            <tr>
              <td>${log.material?.name || 'Unknown Material'}</td>
              <td>${qty.toFixed(2)} ${log.material?.unit || ''}</td>
              <td>${formatCurrency(price)}</td>
              <td>${formatCurrency(total)}</td>
              <td>${new Date(log.usageDate).toLocaleDateString('en-IN')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Materials Used</h2>
      <div class="empty">No materials have been used in this project yet.</div>
    </div>
    `}

    ${labour.labourers && labour.labourers.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Labour Details (${labour.labourers.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Paid</th>
            <th>Payment Count</th>
          </tr>
        </thead>
        <tbody>
          ${labour.labourers.map(lab => {
            const totalPaid = Array.isArray(lab.payments) 
              ? lab.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
              : parseFloat(lab.totalPaid) || 0;
            return `
            <tr>
              <td>${lab.name || 'N/A'}</td>
              <td>${lab.phone || 'N/A'}</td>
              <td>${formatCurrency(totalPaid)}</td>
              <td>${lab.payments?.length || 0} payments</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Labour Details</h2>
      <div class="empty">No labour records found for this project.</div>
    </div>
    `}

    ${contracts.contracts && contracts.contracts.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Contracts (${contracts.contracts.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Contractor</th>
            <th>Work Type</th>
            <th>Contract Amount</th>
            <th>Paid Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${contracts.contracts.map(con => `
            <tr>
              <td>${con.contractorName || 'N/A'}</td>
              <td>${con.workType || 'N/A'}</td>
              <td>${formatCurrency(con.totalAmount || 0)}</td>
              <td>${formatCurrency(con.paidAmount || 0)}</td>
              <td><span class="status-badge">${con.status || 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Contracts</h2>
      <div class="empty">No contracts found for this project.</div>
    </div>
    `}

    ${financial.project?.expenses && financial.project.expenses.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Financial Expenses Breakdown (${financial.project.expenses.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Classification</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${financial.project.expenses.map(exp => {
            const category = (exp.category || '').toLowerCase();
            const isMaterial = materialCategories.some(mat => category.includes(mat));
            return `
            <tr>
              <td>${exp.category || 'N/A'}</td>
              <td>${formatCurrency(exp.amount || 0)}</td>
              <td>
                <span class="status-badge" style="${isMaterial ? 'background: #dbeafe; color: #1e40af;' : 'background: #fef3c7; color: #92400e;'}">
                  ${isMaterial ? 'Material-related' : 'Other Expense'}
                </span>
              </td>
              <td>${exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : 'N/A'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 15px; padding: 12px; background: #f0f9ff; border-left: 4px solid #3b82f6; font-size: 14px;">
        <strong>Note:</strong> Expenses with categories like "material", "paint", "cement", etc. are automatically classified as material costs.
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>This report was automatically generated on ${new Date().toLocaleString('en-IN', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}</p>
      <p style="margin-top: 8px;">Project Management System</p>
    </div>
  </div>
</body>
</html>`;
      
      return html;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  },

  /**
   * Download report as HTML file
   */
  downloadReport: (html, projectName) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_');
    const date = new Date().toISOString().split('T')[0];
    a.download = `${sanitizedName}_Report_${date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Generate all projects summary
   */
  downloadAllProjectsReport: async (projects) => {
    try {
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount || 0);
      };

      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Projects Summary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      background: #f5f5f5;
    }
    .container { 
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { 
      font-size: 32px;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .stats { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value { 
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stat-label { 
      font-size: 14px;
      text-transform: uppercase;
      opacity: 0.9;
    }
    table { 
      width: 100%;
      border-collapse: collapse;
    }
    th, td { 
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th { 
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    tr:hover { background: #f9fafb; }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>All Projects Summary</h1>
      <p>${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${projects.length}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
        <div class="stat-value">${projects.filter(p => p.status === 'In Progress').length}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
        <div class="stat-value">${projects.filter(p => p.status === 'Completed').length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
        <div class="stat-value">${formatCurrency(totalBudget)}</div>
        <div class="stat-label">Total Budget</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
        <div class="stat-value">${formatCurrency(totalSpent)}</div>
        <div class="stat-label">Total Spent</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Client</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Budget</th>
          <th>Spent</th>
          <th>Utilization</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(p => {
          const utilization = p.budget > 0 
            ? ((p.spent / p.budget) * 100).toFixed(1) 
            : '0.0';
          return `
          <tr>
            <td>
              <strong>${p.name}</strong><br/>
              <small style="color: #6b7280;">${p.id}</small>
            </td>
            <td>${p.client || 'N/A'}</td>
            <td><span style="padding: 4px 8px; background: #e5e7eb; border-radius: 12px; font-size: 12px;">${p.status || 'N/A'}</span></td>
            <td>${p.progress || 0}%</td>
            <td>${formatCurrency(p.budget || 0)}</td>
            <td>${formatCurrency(p.spent || 0)}</td>
            <td>${utilization}%</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
      <p style="margin-top: 8px;">Project Management System</p>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `All_Projects_Summary_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating all projects report:', error);
      throw error;
    }
  }
};

export default projectReportService;
// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import QuotationPDFView from './QuotationPDFView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('records');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = create, string = edit
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeView === 'records') {
      loadQuotations();
    }
  }, [activeView]);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://furnisure-quotation-system.onrender.com/api/quotations');

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quotations:', err);
      alert('⚠️ Could not load quotation records.');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    quotationDate: '',
    billTo: { name: '', address: '', city: '', mobile: '' },
    items: [{ description: '', price: '', quantity: '' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('billTo.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, billTo: { ...formData.billTo, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', price: '', quantity: '' }] });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const subtotal = formData.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
  const cgstAmount = 0;
  const sgstAmount = 0;
  const grandTotal = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quotationDate) {
      alert('Please select an invoice date.');
      return;
    }
    const payload = {
      quotationDate: formData.quotationDate,
      billTo: formData.billTo,
      items: formData.items.map(item => ({
        description: item.description,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10)
      })),
      subtotal,
      cgstAmount,
      sgstAmount,   // ⭐ REQUIRED ⭐
      grandTotal
    };


    console.log("PAYLOAD SENDING:", payload);   // 🔥 ADD THIS


    try {
      let response;
      if (editingId) {
        response = await fetch(`https://furnisure-quotation-system.onrender.com/api/quotations/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('https://furnisure-quotation-system.onrender.com/api/quotations/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();
      if (response.ok) {
        alert(editingId ? '✅ Quotation updated!' : '✅ Quotation saved!');
        setFormData({
          quotationDate: '',
          billTo: { name: '', address: '', city: '', mobile: '' },
          items: [{ description: '', price: '', quantity: '' }]
        });

        setEditingId(null);
        setActiveView('records');
        loadQuotations();
      } else {
        alert(`❌ Failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('⚠️ Backend not reachable.');
    }
  };

  const handleEdit = (quotation) => {
    setEditingId(quotation._id);
    setFormData({
      quotationDate: quotation.quotationDate.split('T')[0],
      billTo: {
        name: quotation.billTo.name || '',
        address: quotation.billTo.address || '',
        city: quotation.billTo.city || '',
        mobile: quotation.billTo.mobile || ''   // REQUIRED
      },
      items: quotation.items.map(item => ({
        description: item.description,
        price: item.price.toString(),
        quantity: item.quantity.toString()
      }))
    });
    setActiveView('create');
  };


  const handleDelete = async (id, quotationNumber) => {
    if (!window.confirm(`Delete Quotation ${quotationNumber}?`)) return;
    try {
      const response = await fetch(`https://furnisure-quotation-system.onrender.com/api/quotations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('🗑️ Deleted successfully!');
        loadQuotations();
      } else {
        const result = await response.json();
        alert(`❌ ${result.message || 'Delete failed'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('⚠️ Delete failed. Check backend.');
    }
  };

  const generatePDF = async () => {
    if (!selectedQuotation) return;

    // ⏳ WAIT for React to finish rendering updated layout
    await new Promise(resolve => setTimeout(resolve, 300));

    const input = document.getElementById('quotation-pdf');

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Quotation_${selectedQuotation.quotationNumber}.pdf`);

    setSelectedQuotation(null);
  };


  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            {/* <img src="/logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} /> */}
            <div className="sidebar-logo">Furnisure</div>
          </div>
          <nav>
            <div
              onClick={() => {
                setEditingId(null);
                setFormData({
                  quotationDate: '',
                  billTo: { name: '', address: '', city: '', mobile: '' },
                  items: [{ description: '', price: '', quantity: '' }]
                });
                setActiveView('create');
                setSidebarOpen(false);
              }}
              className={`nav-item ${activeView === 'create' ? 'active' : 'inactive'}`}
            >
              <span>➕</span> Create Quotation
            </div>
            <div
              onClick={() => {
                setActiveView('records');
                setSidebarOpen(false);
              }}
              className={`nav-item ${activeView === 'records' ? 'active' : 'inactive'}`}
            >
              <span>📋</span> Quotation Records
            </div>
          </nav>
        </div>
        <div className="sidebar-footer">
          © 2025 Furnisure
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className={`hamburger ${sidebarOpen ? 'hide' : ''}`} onClick={() => setSidebarOpen(true)}>
            ☰
          </div>
          <h2>Dashboard</h2>
          <div className="date">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="content">
          {activeView === 'create' ? (
            <div>
              <h3>{editingId ? 'Edit Quotation' : 'Create New Quotation'}</h3>
              <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                  <label className="form-label">Invoice Date:</label>
                  <input
                    type="date"
                    name="quotationDate"
                    value={formData.quotationDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <h4 className="form-section">Bill To</h4>
                  <input
                    type="text"
                    name="billTo.name"
                    value={formData.billTo.name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
                    name="billTo.mobile"
                    value={formData.billTo.mobile}
                    onChange={handleInputChange}
                    placeholder="Mobile Number"
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
                    name="billTo.address"
                    value={formData.billTo.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="billTo.city"
                    value={formData.billTo.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="form-input"
                  />
                </div>

                <h4>Items</h4>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="e.g. A4 size Certificate Print & Framming"
                              className="form-input"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              className="form-input"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="form-input"
                              required
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="btn btn-danger btn-small"
                              disabled={formData.items.length === 1}
                            >
                              –
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-success"
                >
                  + Add Item
                </button>

                <div className="totals">
                  <div>
                    <div>Sub Total: ₹{subtotal.toFixed(2)}</div>
                    <div style={{ fontWeight: 'bold' }}>Grand Total: ₹{grandTotal.toFixed(2)}</div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="records-header">
                <div>
                  <h3>Quotation Records</h3>
                  <p className="records-subtitle">Manage and track all your quotations</p>
                </div>
                <div className="records-count">
                  Total Quotations: {quotations.length}
                </div>
              </div>

              {loading ? (
                <p>Loading quotations...</p>
              ) : quotations.length === 0 ? (
                <p>No quotations found. Create one first!</p>
              ) : (
                <div className="records-table table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Quotation No.</th>
                        <th>Customer Name</th>
                        <th>Mobile Number</th>
                        <th>Grand Total</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {quotations.map((q) => (
                        <tr key={q._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{
                              backgroundColor: '#ffe0b2',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              #{q.quotationNumber.split('-')[0].replace('CE', '')}
                            </span>
                          </td>

                          <td style={{ padding: '12px 15px' }}>{q.billTo.name}</td>

                          <td style={{ padding: '12px 15px' }}>
                            {q.billTo.mobile || "N/A"}
                          </td>

                          <td style={{ padding: '12px 15px', color: '#28a745', fontWeight: 'bold' }}>
                            ₹{q.grandTotal?.toLocaleString()}
                          </td>

                          <td style={{ padding: '12px 15px' }}>
                            {new Date(q.quotationDate).toLocaleDateString('en-GB')}
                          </td>

                          <td style={{ padding: '12px 15px' }}>
                            <div className="action-buttons">
                              <button onClick={() => setSelectedQuotation(q)} className="btn btn-primary btn-small">
                                📥
                              </button>
                              <button onClick={() => handleEdit(q)} className="btn btn-warning btn-small">
                                ✏️
                              </button>
                              <button onClick={() => handleDelete(q._id, q.quotationNumber)} className="btn btn-danger btn-small">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal */}
      {selectedQuotation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <QuotationPDFView quotation={selectedQuotation} />
            <div className="modal-actions">
              <button onClick={generatePDF} className="btn btn-success">
                Download PDF
              </button>
              <button onClick={() => setSelectedQuotation(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
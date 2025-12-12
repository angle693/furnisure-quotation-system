// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import QuotationPDFView from './QuotationPDFView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [activeView, setActiveView] = useState('records');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = create, string = edit

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
    billTo: { name: '', address: '', city: '' },
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
  const cgstAmount = subtotal * 0.09;
  const grandTotal = subtotal + cgstAmount;

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
      grandTotal
    };

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
          billTo: { name: '', address: '', city: '' },
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
      billTo: quotation.billTo,
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
    const input = document.getElementById('quotation-pdf');
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Quotation_${selectedQuotation.quotationNumber}.pdf`);
    setSelectedQuotation(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{
        width: '200px',
        backgroundColor: '#fff',
        borderRight: '1px solid #dee2e6',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            {/* <img src="/logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} /> */}
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '22px' }}>Furnisure</div>
              {/* <div style={{ fontSize: '12px', color: '#6c757d' }}>Furnisure</div> */}
            </div>
          </div>
          <nav>
            <div
              onClick={() => {
                setEditingId(null);
                setFormData({
                  quotationDate: '',
                  billTo: { name: '', address: '', city: '' },
                  items: [{ description: '', price: '', quantity: '' }]
                });
                setActiveView('create');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeView === 'create' ? '#ffe0b2' : 'transparent',
                color: activeView === 'create' ? '#000' : '#495057',
                marginBottom: '8px'
              }}
            >
              <span style={{ marginRight: '10px' }}>➕</span> Create Quotation
            </div>
            <div
              onClick={() => setActiveView('records')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeView === 'records' ? '#ffe0b2' : 'transparent',
                color: activeView === 'records' ? '#000' : '#495057'
              }}
            >
              <span style={{ marginRight: '10px' }}>📋</span> Quotation Records
            </div>
          </nav>
        </div>
        <div style={{ fontSize: '10px', color: '#6c757d', textAlign: 'center' }}>
          © 2025 Furnisure
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '15px 20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Dashboard</h2>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {activeView === 'create' ? (
            <div>
              <h3>{editingId ? 'Edit Quotation' : 'Create New Quotation'}</h3>
              <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Invoice Date:</label>
                  <input
                    type="date"
                    name="quotationDate"
                    value={formData.quotationDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4>Bill To</h4>
                  <input
                    type="text"
                    name="billTo.name"
                    value={formData.billTo.name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', marginBottom: '8px' }}
                    required
                  />
                  <input
                    type="text"
                    name="billTo.address"
                    value={formData.billTo.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    name="billTo.city"
                    value={formData.billTo.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                  />
                </div>

                <h4>Items</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #dee2e6', padding: '8px' }}>Description</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #dee2e6', padding: '8px' }}>Price</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #dee2e6', padding: '8px' }}>Qty</th>
                      <th style={{ width: '40px' }}></th>
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
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{
                              padding: '2px 6px',
                              marginLeft: '4px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            disabled={formData.items.length === 1}
                          >
                            –
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addItem}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  + Add Item
                </button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div>Sub Total: ₹{subtotal.toFixed(2)}</div>
                    <div>CGST (9%): ₹{cgstAmount.toFixed(2)}</div>
                    <div style={{ fontWeight: 'bold' }}>Grand Total: ₹{grandTotal.toFixed(2)}</div>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {editingId ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>Quotation Records</h3>
                  <p style={{ color: '#6c757d', margin: 0 }}>Manage and track all your quotations</p>
                </div>
                <div style={{
                  backgroundColor: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ffc107',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffc107'
                }}>
                  Total Quotations: {quotations.length}
                </div>
              </div>

              {loading ? (
                <p>Loading quotations...</p>
              ) : quotations.length === 0 ? (
                <p>No quotations found. Create one first!</p>
              ) : (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Quotation No.</th>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Customer Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Mobile Number</th>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Grand Total</th>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '12px 15px', fontWeight: 'bold' }}>Actions</th>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setSelectedQuotation(q)} style={{ padding: '4px 8px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📥
          </button>
          <button onClick={() => handleEdit(q)} style={{ padding: '4px 8px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ✏️
          </button>
          <button onClick={() => handleDelete(q._id, q.quotationNumber)} style={{ padding: '4px 8px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflow: 'auto'
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '20px', maxWidth: '850px', margin: '20px' }}>
            <QuotationPDFView quotation={selectedQuotation} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={generatePDF}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', marginRight: '10px' }}
              >
                Download PDF
              </button>
              <button
                onClick={() => setSelectedQuotation(null)}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}
              >
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
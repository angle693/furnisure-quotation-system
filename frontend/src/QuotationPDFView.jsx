// frontend/src/QuotationPDFView.jsx
import React from 'react';

const QuotationPDFView = ({ quotation }) => {

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const customerName = quotation.billTo?.name || 'SHANTINATH AGENCY';
  const city = quotation.billTo?.city || 'BHARUCH';
  const mobileNumber = quotation.billTo?.mobile || '';
  const address = quotation.billTo?.address || '';

  const cgstAmount = quotation.cgstAmount || (quotation.subtotal * 0.09);
  const sgstAmount = quotation.sgstAmount || (quotation.subtotal * 0.09);
  const grandTotal = quotation.grandTotal || (quotation.subtotal + cgstAmount + sgstAmount);

  return (
    <div
      id="quotation-pdf"
      style={{
        width: '800px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        padding: '15px 20px',
        lineHeight: 1.3,
        color: '#6B3E26',
        backgroundColor: '#FBF6ED',
        position: 'relative',
        border: '1px solid #5A3420',
        boxSizing: 'border-box'
      }}
    >

      {/* Top Section */}
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ marginRight: '10px' }}>
          <img src="/logo.png" alt="Furnisure Logo" style={{ height: '80px' }} />
        </div>

        <div style={{ width: '2px', backgroundColor: '#5A3420', marginRight: '5px' }} />
        <div style={{ width: '2px', backgroundColor: '#C9A24D', marginRight: '10px' }} />

        <div style={{ flex: 1 }}>
          <div>📞 9737888669</div>
          <div>✉️ furnisure@gmail.com</div>
          <div>📍 618, Shreeji Park Society, Subhanpura, Vadodara-390021</div>
          <div style={{ borderBottom: '1px solid #5A3420', margin: '6px 0' }} />
          <b>GST. 24AAKFF2184J1ZB</b>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ backgroundColor: '#6B3E26', color: '#FBF6ED', padding: '6px 10px', fontWeight: 'bold' }}>
            INVOICE
          </div>

          <div style={{ borderBottom: '1px solid #5A3420', marginTop: '8px' }}>
            <b>INVOICE NO:</b> {quotation.quotationNumber}
          </div>
          <div style={{ borderBottom: '1px solid #5A3420' }}>
            <b>INVOICE DATE:</b> {formatDate(quotation.quotationDate)}
          </div>
          <div style={{ borderBottom: '1px solid #5A3420' }}>
            <b>TOTAL DUE:</b> ₹{grandTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: '15px' }}>
        <b>BILL TO,</b>
        <div><b>Customer Name:</b> {customerName}</div>
        <div><b>Address:</b> {address}</div>
        <div><b>City:</b> {city}</div>
        <div><b>Mobile No.:</b> {mobileNumber}</div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #5A3420' }}>
        <thead>
          <tr>
            {['DESCRIPTION', 'PRICE', 'QTY.', 'TOTAL'].map((h, i) => (
              <th key={i} style={{
                border: '1px solid #5A3420',
                padding: '6px',
                textAlign: i === 0 ? 'left' : 'right'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #5A3420', padding: '6px' }}>{item.description}</td>
              <td style={{ border: '1px solid #5A3420', padding: '6px', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
              <td style={{ border: '1px solid #5A3420', padding: '6px', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #5A3420', padding: '6px', textAlign: 'right' }}>
                {(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
        <table>
          <tbody>
            <tr><td>Sub Total</td><td>₹{quotation.subtotal.toFixed(2)}</td></tr>
            <tr><td>CGST (9%)</td><td>₹{cgstAmount.toFixed(2)}</td></tr>
            <tr><td>SGST (9%)</td><td>₹{sgstAmount.toFixed(2)}</td></tr>
            <tr><td><b>Grand Total</b></td><td><b>₹{grandTotal.toFixed(2)}</b></td></tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {/* Footer Section */}
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  fontSize: '11px',
  marginTop: '25px'
}}>

  {/* Left */}
  <div style={{ width: '33%' }}>
    <div style={{ fontWeight: 'bold' }}>
      Composition taxable person, not eligible to collect tax on supplies.
    </div>
  </div>

  {/* CENTER – Payment Info (Moved Here ✅) */}
  <div style={{ width: '33%' }}>
    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
      Payment Info.
    </div>
    <div>A/C NAME : FURNISURE</div>
    <div>A/C NUMBER :</div>
    <div>IFSC CODE :</div>
    <div>BANK :</div>
    <div>BRANCH :</div>
  </div>

  {/* RIGHT – Signature */}
  <div style={{ width: '33%', textAlign: 'right' }}>
    <div style={{ marginTop: '40px' }}>
      <div style={{ fontWeight: 'bold' }}>FURNISURE</div>
      <div>Proprietor</div>
      <div style={{ marginTop: '10px' }}>Authorised Sign.</div>
    </div>
  </div>

</div>


    </div>
  );
};

export default QuotationPDFView;

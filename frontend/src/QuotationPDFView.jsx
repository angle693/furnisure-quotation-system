// frontend/src/QuotationPDFView.jsx
import React from 'react';

const QuotationPDFView = ({ quotation }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const customerName = quotation.billTo.name || 'SHANTINATH AGENCY';
  const city = quotation.billTo.city || 'BHARUCH';
  const mobileNumber = quotation.billTo.mobile || '9909927738';
  const gstNo = '24B0GPG5365H1ZZ';

  // Calculate SGST and CGST (both 9%)
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
        color: '#000',
        position: 'relative',
        border: '1px solid #000',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Section: Logo + Contact Info */}
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        {/* Left: Logo */}
        <div style={{ marginRight: '10px', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="Furnisure Logo"
            style={{
              height: '80px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Vertical Lines */}
        <div style={{ width: '2px', backgroundColor: '#000', marginRight: '5px' }}></div>
        <div style={{ width: '2px', backgroundColor: '#FFD700', marginRight: '10px' }}></div>

        {/* Right: Contact Info Icons */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '5px' }}>📞</span>
            <span>9737888669</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '5px' }}>✉️</span>
            <span>furnisure@gmail.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '5px' }}>📍</span>
            <span>618,Shreeji Park Society, Hightention line road, Subhanpura, Vadodara-390021</span>
          </div>
          <div style={{ borderBottom: '1px solid #000', width: '100%', marginBottom: '8px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* <span style={{ marginRight: '5px' }}>🏷️</span> */}
            <span style={{ fontWeight: 'bold' }}>GST. </span>
          </div>
        </div>

        {/* Invoice Header */}
        <div style={{ textAlign: 'right', marginLeft: '20px' }}>
          <div style={{ backgroundColor: '#000', color: 'white', padding: '8px 12px', fontWeight: 'bold', marginBottom: '12px' }}>
            INVOICE
          </div>
          <div style={{ 
            marginBottom: '10px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            <div><strong>INVOICE NO.:</strong></div>
            <div>{quotation.quotationNumber}</div>
          </div>
          <div style={{ 
            marginBottom: '10px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            <div><strong>INVOICE DATE:</strong></div>
            <div>{formatDate(quotation.quotationDate)}</div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            <div><strong>TOTAL DUE:</strong></div>
            <div>₹{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold' }}>BILL TO,</div>
        <div><b>Customer Name: </b>{customerName}</div>
        <div><b>Address: </b>{quotation.billTo.address || ''}</div>
        <div><b>City: </b>{city}</div>
        <div><b>Mobile No.: </b>{mobileNumber}</div>
      </div>

      {/* Items Table with Full Borders */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '1px solid #000' }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              borderBottom: '1px solid #000',
              padding: '5px',
              borderRight: '1px solid #000',
              fontWeight: 'bold'
            }}>
              DESCRIPTION
            </th>
            <th style={{
              textAlign: 'right',
              borderBottom: '1px solid #000',
              padding: '5px',
              borderRight: '1px solid #000',
              fontWeight: 'bold'
            }}>
              PRICE
            </th>
            <th style={{
              textAlign: 'right',
              borderBottom: '1px solid #000',
              padding: '5px',
              borderRight: '1px solid #000',
              fontWeight: 'bold'
            }}>
              QTY.
            </th>
            <th style={{
              textAlign: 'right',
              borderBottom: '1px solid #000',
              padding: '5px',
              fontWeight: 'bold'
            }}>
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, i) => (
            <tr key={i} style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
              <td style={{
                padding: '5px',
                borderRight: '1px solid #000'
              }}>
                {item.description || 'A4 size Certificate Print & Framming'}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '5px',
                borderRight: '1px solid #000'
              }}>
                {parseFloat(item.price).toFixed(2) || '170.00'}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '5px',
                borderRight: '1px solid #000'
              }}>
                {item.quantity || '4'}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '5px'
              }}>
                {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2) || '680.00'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals - Right Aligned */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <table style={{ textAlign: 'right', fontSize: '12px' }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: '30px' }}>Sub Total</td>
              <td>₹{quotation.subtotal.toFixed(2) || '680.00'}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: '30px' }}>CGST (9%)</td>
              <td>₹{cgstAmount.toFixed(2) || '61.20'}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: '30px' }}>SGST (9%)</td>
              <td>₹{sgstAmount.toFixed(2) || '61.20'}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: '30px', fontWeight: 'bold' }}>Grand Total</td>
              <td style={{ fontWeight: 'bold' }}>₹{grandTotal.toFixed(2) || '802.40'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Section - Two Column Layout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '11px',
        marginTop: '25px'
      }}>
        {/* Left: Terms & Conditions */}
        <div style={{ width: '50%', paddingRight: '10px' }}>
          <div style={{ fontWeight: 'bold' }}>Terms & Conditions</div>
          <div>Please Include the Invoice Number in your Payment Notes</div>
          <div style={{ fontWeight: 'bold', marginTop: '10px' }}>THANK YOU</div>
          <div>FOR YOUR BUSINESS</div>
        </div>

        {/* Right: Payment Info */}
        <div style={{ width: '50%', paddingLeft: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Payment Info.</div>
          <div>A/C NAME : FURNISURE</div>
          <div>A/C NUMBER : </div>
          <div>IFSC CODE : </div>
          <div>BANK : </div>
          <div>BRANCH : </div>
          
          {/* Proprietor and Signature */}
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <div style={{ color: '#0066cc', fontWeight: 'bold' }}>FURNISURE</div>
            {/* Replaced text signature with image */}
            {/* <div style={{ textAlign: 'center', margin: '10px 0', marginLeft: '200px' }}>
              <img 
                src="/signature.png" 
                alt="R.T. Gonani Signature" 
                style={{ 
                  height: '40px',
                  width: '150px',
                  display: 'inline-block',
                  border: 'none'
                }} 
              /> */}
            </div>
            <div style={{ color: '#0066cc' }}>Proprietor</div>
            <div style={{ marginTop: '10px' }}>Authorised Sign.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPDFView;

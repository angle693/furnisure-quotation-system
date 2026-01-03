// frontend/src/QuotationPDFView.jsx
import React from 'react';
import './QuotationPDFView.css';

const QuotationPDFView = ({ quotation }) => {

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const customerName = quotation.billTo?.name || 'SHANTINATH AGENCY';
  const city = quotation.billTo?.city || 'BHARUCH';
  const mobileNumber = quotation.billTo?.mobile || '';
  const address = quotation.billTo?.address || '';

  const grandTotal = quotation.subtotal;

  return (
    <div id="quotation-pdf" className="quotation-pdf">

      {/* Top Section */}
      <div className="quotation-header">
        <div className="logo-section">
          <img src="/logo-Picsart-BackgroundRemover.png" alt="Furnisure Logo" className="logo-img" />
        </div>

        <div className="header-dividers">
          <div className="divider-brown" />
          <div className="divider-gold" />
        </div>

        <div className="contact-info">
          <div>📞 9737888669</div>
          <div>✉️ furnisure@gmail.com</div>
          <div>📍 618, Shreeji Park Society, Subhanpura, Vadodara-390021</div>
        </div>

        <div className="invoice-info">
          <div className="invoice-badge">
            INVOICE
          </div>

          <div className="invoice-detail">
            <b>INVOICE NO:</b> {quotation.quotationNumber}
          </div>
          <div className="invoice-detail">
            <b>INVOICE DATE:</b> {formatDate(quotation.quotationDate)}
          </div>
          <div className="invoice-detail">
            <b>TOTAL DUE:</b> ₹{grandTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="bill-to-section">
        <b>BILL TO,</b>
        <div><b>Customer Name:</b> {customerName}</div>
        <div><b>Address:</b> {address}</div>
        <div><b>City:</b> {city}</div>
        <div><b>Mobile No.:</b> {mobileNumber}</div>
      </div>

      {/* Items Table */}
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              {['DESCRIPTION', 'PRICE', 'QTY.', 'TOTAL'].map((h, i) => (
                <th key={i} className={i === 0 ? 'text-left' : 'text-right'}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, i) => (
              <tr key={i}>
                <td className="text-left">{item.description}</td>
                <td className="text-right">{item.price.toFixed(2)}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grand-total-section">
        <table>
          <tbody>
            <tr><td><b>Grand Total</b></td><td><b>₹{grandTotal.toFixed(2)}</b></td></tr>
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="footer-section">

        {/* Left */}
        <div className="footer-column terms-column">
          <div className="footer-title">
            Terms and Conditions
          </div>
          <div>E & O.E</div>
          <div>1. Goods once sold will not be taken back.</div>
          <div>2. Interest @ 18% p.a. will be charged if the payment for SRB infotech is not made within the stipulated time.</div>
          <div>3. Subject to 'Delhi' Jurisdiction only.</div>
        </div>

        {/* CENTER – Payment Info */}
        <div className="footer-column payment-column">
          <div className="footer-title">
            Payment Info.
          </div>
          <div>A/C NAME : FURNISURE</div>
          <div>A/C NUMBER :4150073488</div>
          <div>IFSC CODE :KKBK0002760</div>
          <div>BANK :Kotak Mahindra Bank</div>
          <div>UPI ID :9737888669@ptaxis</div>
        </div>

        {/* RIGHT – Signature */}
        <div className="footer-column signature-column">
          <div className="signature-content">
            <div className="signature-company">FURNISURE</div>
            <img src="/SIGNATURE.png" alt="Signature" className="signature-img" />
            <div>Proprietor</div>
            <div className="auth-sign">Authorised Sign.</div>
          </div>
        </div>

      </div>


    </div>
  );
};

export default QuotationPDFView;

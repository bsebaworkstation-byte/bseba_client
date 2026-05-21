export const printBarcode = (elementRef, quantity = 1) => {
  if (!elementRef?.current) {
    console.error("No element reference found for printing");
    return;
  }

  const original = elementRef.current.outerHTML;

  // Duplicate barcode by quantity
  let printContent = "";
  for (let i = 0; i < Number(quantity); i++) {
    printContent += `<div class="barcode-item">${original}</div>`;
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Collect all CSS (Tailwind + custom)
  let styles = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    styles += node.outerHTML;
  });

  const posPrintStyle = `
    <style>
      @media print {
  @page {
    size: auto;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    // font-family: Arial, sans-serif;
  }

.barcode-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap; 
  gap: 3mm;                 /* gap between barcodes */
  justify-items: center;
           /* outer margin */
  box-sizing: border-box;
}

.barcode-item {
  flex: 1 1 clamp(25%, 20vw, 40mm);
  /*        ↑      ↑       ↑
      min columns  screen   print-safe */

  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  page-break-inside: avoid;
}

  button {
    display: none !important;
  }
}
    </style>
  `;

  const printHTML = `
    <html>
      <head>
        ${styles}
        ${posPrintStyle}
      </head>
      <body>
        <div class="barcode-container">
          ${printContent}
        </div>
      </body>
    </html>
  `;

  if (isMobile) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  } else {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-1000px";
    iframe.style.top = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(printHTML);
    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 300);
    };
  }
};

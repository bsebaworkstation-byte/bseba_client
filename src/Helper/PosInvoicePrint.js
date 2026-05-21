import { getBusinessDetails } from "./SessionHelper";

export const printPosElement = (elementRef, title = "Document") => {
  if (!elementRef || !elementRef.current) {
    console.error("No element reference found for printing");
    return;
  }
  const businessDetails = getBusinessDetails();

  const printContent = elementRef.current.outerHTML;

  // Detect device type using userAgent (mobile vs desktop)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Collect all styles (Tailwind + custom)
  let styles = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    styles += node.outerHTML;
  });

  // 👉 Add POS printer-specific CSS
  const posPrintStyle = `
    <style>
      @media print {
        @page {
          size: ${
            businessDetails?.posInvoice || 80
          }mm auto; /* POS paper width */
          margin: 0;
        }
        body {
          width: ${businessDetails?.posInvoice || 80}mm;
          margin: 0;
          font-size: 11px;
          line-height: 1.3;
          font-family: Arial, sans-serif;
        }

        /* Hide UI buttons and modals */
        button, .global_button, .global_button_red {
          display: none !important;
        }

        /* Optional: center text, compact layout */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 2px 0;
        }
        hr {
          border: 0;
          border-top: 1px dashed #000;
          margin: 4px 0;
        }
      }
    </style>
  `;

  const printHTML = `
    <html>
      <head>
        <title>${title}</title>
        ${styles}
        ${posPrintStyle}
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `;

  if (isMobile) {
    // Mobile → window.open
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
    // Desktop → iframe print
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.left = "-1000px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(printHTML);
    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 200);
    };
  }
};

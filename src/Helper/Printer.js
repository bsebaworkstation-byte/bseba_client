export const printElement = (elementRef, title = "Document") => {
  if (!elementRef || !elementRef.current) {
    console.error("No element reference found for printing");
    return;
  }

  const printContent = elementRef.current.outerHTML;

  // Detect device type using userAgent (mobile vs desktop)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Collect all styles (Tailwind + custom)
  let styles = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    styles += node.outerHTML;
  });

  const printStyles = `
<style>
@media print {

  body {
    margin: 0;
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Snapshot roots are often off-screen on screen; reset for the print document */
  .print-snapshot-root {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: auto !important;
    pointer-events: auto !important;
  }

  * {
    overflow: visible !important;
  }

  table {
    page-break-inside: auto;
    width: 100%;
  }

  tr {
    page-break-inside: auto;
  }

  tr.no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  .print-footer {
    position: static !important;
  }

  .print-blank-space {
    min-height: 120px;
  }
}
</style>
`;

  const printHTML = `
    <html>
      <head>
        <title>${title}</title>
        ${styles}
        ${printStyles}
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
    // PC → iframe
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

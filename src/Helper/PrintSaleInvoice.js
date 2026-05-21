export const printSaleInvoice = (
  elementRef,
  title = "Document",
  copies = {}
) => {
  if (!elementRef || !elementRef.current) {
    console.error("No element reference found for printing");
    return;
  }

  // Get the selected copies
  const selectedCopies = Object.entries(copies).filter(([key, value]) => value);

  // If no copies are selected, print one copy without header
  if (selectedCopies.length === 0) {
    printSingleCopy(elementRef, title);
    return;
  }

  // Print each selected copy with its respective header
  selectedCopies.forEach(([copyType, _], index) => {
    const copyName = getCopyDisplayName(copyType);
    setTimeout(() => {
      printSingleCopy(elementRef, title, copyName);
    }, index * 1000); // Delay each print by 1 second to avoid conflicts
  });
};

const getCopyDisplayName = (copyType) => {
  const copyNames = {
    officer: "Officers Copy",
    office: "Office Copy",
    dealer: "Dealer Copy",
  };
  return copyNames[copyType] || copyType;
};

const printSingleCopy = (elementRef, title, copyHeader = null) => {
  const printContent = elementRef.current.outerHTML;

  // Detect device type using userAgent (mobile vs desktop)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Collect all styles (Tailwind + custom)
  let styles = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    styles += node.outerHTML;
  });

  // Add copy header if provided
  const headerHTML = copyHeader
    ? `
  <div style="
    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
    padding: 10px;
 
    z-index: 10;
  ">
    <h2 style="margin: 0; color: #006D2B; font-size: 18px; font-weight: bold;">
      ${copyHeader}
    </h2>
  </div>
  `
    : "";

  const printHTML = `
  <html>
    <head>
      <title>${title}${copyHeader ? ` - ${copyHeader}` : ""}</title>
      ${styles}
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .copy-header { page-break-inside: avoid; }
          .print-content { position: relative; margin-top: 0px; /* space for absolute header */ }
        }
      </style>
    </head>
    <body>
      ${headerHTML}
      <div class="print-content">
        ${printContent}
      </div>
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
      }, 1000);
    };
  }
};

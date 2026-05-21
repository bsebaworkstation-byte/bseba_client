export const printExpense = (elementRef, title = "Document") => {
  if (!elementRef || !elementRef.current) {
    console.error("No element reference found for printing");
    return;
  }

  const printContent = elementRef.current.outerHTML;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // Collect all styles (Tailwind + custom)
  let styles = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    styles += node.outerHTML;
  });

  const printHTML = `
    <html>
      <head>
        ${styles}
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

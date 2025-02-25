(function() {
    const conversionAPI = "https://api.exchangerate-api.com/v4/latest/AED";
    let conversionRate = null;
  
    // 1. Fetch and store the AED->USD conversion rate.
    async function fetchConversionRate() {
      try {
        const response = await fetch(conversionAPI);
        const data = await response.json();
        if (data && data.rates && data.rates.USD) {
          conversionRate = data.rates.USD; // e.g., 0.27 means 1 AED = 0.27 USD.
        } else {
          console.error("USD rate not found in API response.");
        }
      } catch (err) {
        console.error("Failed to fetch conversion rate:", err);
      }
    }
  
    // 2. Convert all AED amounts to USD in the document body.
    function convertAllAEDToUSD() {
      if (!conversionRate) return; // If we haven't fetched a rate yet, do nothing.
  
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
  
      let node;
      while ((node = walker.nextNode())) {
        const originalText = node.nodeValue;
  
        // Pattern A: [number] AED (with commas/decimals)
        let newText = originalText.replace(
          /(\d{1,3}(,\d{3})*(\.\d+)?)\s*AED/g,
          (match, amount) => {
            const normalized = amount.replace(/,/g, "");
            const num = parseFloat(normalized);
            if (!isNaN(num)) {
              const usd = (num * conversionRate).toFixed(2);
              return `${amount} AED (~${usd} USD)`;
            }
            return match;
          }
        );
  
        // Pattern B: AED [number] (with commas/decimals)
        newText = newText.replace(
          /AED\s*(\d{1,3}(,\d{3})*(\.\d+)?)/g,
          (match, amount) => {
            const normalized = amount.replace(/,/g, "");
            const num = parseFloat(normalized);
            if (!isNaN(num)) {
              const usd = (num * conversionRate).toFixed(2);
              return `AED${amount} (~${usd} USD)`;
            }
            return match;
          }
        );
  
        if (newText !== originalText) {
          node.nodeValue = newText;
        }
      }
    }
  
    // 3. Observe the DOM for changes and re-run conversion as new elements are added.
    function observeDOMChanges() {
      const observer = new MutationObserver((mutations) => {
        // For performance, you might only convert in newly added nodes,
        // but a simpler approach is to re-run the entire conversion each time:
        convertAllAEDToUSD();
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
    // 4. Initialization: fetch rate, convert once, and start observing.
    async function init() {
      await fetchConversionRate();
      convertAllAEDToUSD();
      observeDOMChanges();
    }
  
    // Run init() once the DOM is loaded
    document.addEventListener("DOMContentLoaded", init);
  })();
  
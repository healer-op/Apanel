const billNo = Date.now();
        document.getElementById("billNo").innerText = billNo;

        // Set default date and time to current
        const now = new Date();
        document.getElementById("dateInput").valueAsDate = now;
        document.getElementById("timeInput").value = now.toTimeString().slice(0, 5);

        // Live update time
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            document.getElementById("invDate").innerText = now.toLocaleDateString() + ' ' + timeString;
        }, 1000);

        let products = [];
        let cart = {};

        async function loadProducts() {
            try {
                const res = await fetch("https://api.healer.eu.org/api/products");
                products = await res.json();
                renderProducts(products);
            } catch (err) {
                console.error("Error loading products:", err);
            }
        }
        loadProducts();

        function renderProducts(productsToRender) {
            const container = document.getElementById("products");
            container.innerHTML = "";
            productsToRender.forEach(p => {
                const div = document.createElement("div");
                div.className = "product-item";
                div.setAttribute('data-product-id', p.id);
                div.innerHTML = `
            <input type="checkbox" id="chk_${p.id}" onchange="toggleItem('${p.id}')" ${cart[p.id] ? 'checked' : ''}>
            <img src="${p.thumbnail}" alt="${p.title}">
            <span style="flex:1">${p.title} - ₹${p.price}</span>
            <input type="number" min="1" value="${cart[p.id] ? cart[p.id].qty : '1'}" id="qty_${p.id}" style="width:60px" onchange="updateQty('${p.id}', this.value)">
          `;
                container.appendChild(div);
            });
        }

        function filterProducts() {
            const searchTerm = document.getElementById("search-input").value.toLowerCase();
            const productItems = document.querySelectorAll(".product-item");

            productItems.forEach(item => {
                const title = item.querySelector("span").innerText.toLowerCase();
                if (title.includes(searchTerm)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        }

        document.getElementById("search-input").addEventListener("input", filterProducts);

        function toggleItem(id) {
            const product = products.find(p => p.id === id);
            if (!product) return;

            const checkbox = document.getElementById("chk_" + id);
            const qtyInput = document.getElementById("qty_" + id);

            if (checkbox.checked) {
                cart[id] = {
                    ...product,
                    qty: parseInt(qtyInput.value) || 1
                };
            } else {
                delete cart[id];
            }
            updateInvoice();
        }

        function updateQty(id, qty) {
            if (cart[id]) {
                cart[id].qty = parseInt(qty) || 1;
                updateInvoice();
            }
        }

        function updateInvoice() {
            document.getElementById("invShopName").innerText = document.getElementById("shopName").value;
            document.getElementById("invShopAddress").innerText = document.getElementById("address").value;
            document.getElementById("invPhone").innerText = document.getElementById("phone").value;
            document.getElementById("invGstin").innerText = document.getElementById("gstin").value;
            document.getElementById("invCustomer").innerText = document.getElementById("customer").value;
            document.getElementById("invPayment").innerText = document.getElementById("paymentMode").value;

            // Add notes and E. & O.E
            document.getElementById("notes-container").innerText = document.getElementById("notes").value;
            document.getElementById("eoe-container").innerText = document.getElementById("eoe").value;

            // Get date and time from separate inputs
            const dateValue = document.getElementById("dateInput").value;
            const timeValue = document.getElementById("timeInput").value;
            const combinedDateTime = dateValue && timeValue ? `${dateValue} ${timeValue}` : '';
            document.getElementById("invDate").innerText = combinedDateTime;

            const tbody = document.getElementById("invItems");
            tbody.innerHTML = "";
            let subtotal = 0;

            Object.values(cart).forEach(item => {
                const row = document.createElement("tr");
                const total = item.qty * parseFloat(item.price);
                subtotal += total;
                row.innerHTML = `
          <td>${item.title}</td>
          <td>${item.qty}</td>
          <td style="text-align:right;">${total.toFixed(2)}</td>`;
                tbody.appendChild(row);
            });

            const discount = parseFloat(document.getElementById("discount").value) || 0;
            document.getElementById("invD").innerText = discount
            const cgst = parseFloat(document.getElementById("cgst").value) || 0;
            document.getElementById("invC").innerText = cgst
            const sgst = parseFloat(document.getElementById("sgst").value) || 0;
            document.getElementById("invS").innerText = sgst

            const discAmt = subtotal * (discount / 100);
            const afterDisc = subtotal - discAmt;
            const cgstAmt = afterDisc * (cgst / 100);
            const sgstAmt = afterDisc * (sgst / 100);
            const grandTotal = afterDisc + cgstAmt + sgstAmt;

            document.getElementById("subtotal").innerText = subtotal.toFixed(2);
            document.getElementById("discAmt").innerText = discAmt.toFixed(2);
            document.getElementById("cgstAmt").innerText = cgstAmt.toFixed(2);
            document.getElementById("sgstAmt").innerText = sgstAmt.toFixed(2);
            document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
        }

        // Initial update with pre-filled data
        updateInvoice();

        document.querySelectorAll("input, select, textarea").forEach(el => {
            el.addEventListener("input", updateInvoice);
            el.addEventListener("change", updateInvoice);
        });

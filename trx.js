(function () {
  // --- CSS ---
  const style = document.createElement("style");
  style.innerHTML = `
    .tx-popup-overlay { position: fixed; top:0;left:0;width:100%;height:100%;background: rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999; }
    .tx-popup { background:#fff;padding:20px;border-radius:12px;width:420px;font-family:Arial,sans-serif;color:#000;box-shadow:0 4px 15px rgba(0,0,0,0.2);}
    .tx-popup h2 { margin:0 0 15px;font-size:18px;text-align:center; }
    .tx-popup label { font-weight:bold;display:block;margin-top:10px;margin-bottom:4px; }
    .tx-popup input, .tx-popup select { width:100%;padding:6px 8px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;font-size:14px; }
    .tx-popup button { width:48%;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px; }
    .tx-popup .add-btn { background:#0faf59;color:white; }
    .tx-popup .cancel-btn { background:#ccc; }
    .tx-popup .btns { display:flex;justify-content:space-between; }
    .tx-popup .mode-select { display:flex; justify-content: space-between; margin-bottom:10px; }
    .tx-popup .mode-select label { flex:1; text-align:center; cursor:pointer; border:1px solid #ccc; border-radius:6px; padding:6px 0; }
    .tx-popup .mode-select input { display:none; }
    .tx-popup .mode-select label.active { background:#0faf59;color:#fff; border-color:#0faf59; }
  `;
  document.head.appendChild(style);

  // --- Popup Function ---
  function openPopup() {
    const overlay = document.createElement("div");
    overlay.className = "tx-popup-overlay";
    overlay.innerHTML = `
      <div class="tx-popup">
        <h2>Transaction Manager</h2>

        <div class="mode-select">
          <input type="radio" name="tx-mode" id="mode-add" checked>
          <label for="mode-add" class="active">Add New</label>
          <input type="radio" name="tx-mode" id="mode-edit">
          <label for="mode-edit">Edit Existing</label>
        </div>

        <div id="edit-section" style="display:none;">
          <label>Order Number</label>
          <select id="tx-existing-order">
            <option value="">Select Order</option>
          </select>
        </div>

        <label>Date & Time</label>
        <input type="text" id="tx-date" placeholder="22/08/2025, 22:27:52" />

        <label>Status</label>
        <select id="tx-status">
          <option value="Processing">Processing</option>
          <option value="Successful">Successful</option>
          <option value="Failed">Failed</option>
        </select>

        <label>Transaction Type</label>
        <select id="tx-type">
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
        </select>

        <label>Payment System</label>
        <input type="text" id="tx-method" placeholder="USDT (TRC-20)" />

        <label>Amount</label>
        <input type="text" id="tx-amount" placeholder="100" />

        <div class="btns">
          <button class="cancel-btn">Cancel</button>
          <button class="add-btn">Add / Update</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // --- Mode Switching ---
    const addLabel = overlay.querySelector('label[for="mode-add"]');
    const editLabel = overlay.querySelector('label[for="mode-edit"]');
    const editSection = overlay.querySelector("#edit-section");
    const orderSelect = overlay.querySelector("#tx-existing-order");

    function updateMode() {
      if(document.getElementById("mode-add").checked){
        addLabel.classList.add("active");
        editLabel.classList.remove("active");
        editSection.style.display="none";
      }else{
        addLabel.classList.remove("active");
        editLabel.classList.add("active");
        editSection.style.display="block";
        populateOrderList();
      }
    }

    addLabel.onclick = () => { document.getElementById("mode-add").checked=true; updateMode(); };
    editLabel.onclick = () => { document.getElementById("mode-edit").checked=true; updateMode(); };

    // Cancel button
    overlay.querySelector(".cancel-btn").onclick = () => overlay.remove();

    // --- Random Order Generator ---
    function generateOrder() { return "9" + Math.floor(1000000 + Math.random() * 9000000); }

    // Populate order list
    function populateOrderList(){
      orderSelect.innerHTML = '<option value="">Select Order</option>';
      document.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transactions-item--imQKR').forEach(tx=>{
        const id = tx.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__id--Ttk2j')?.innerText;
        if(id) orderSelect.innerHTML += `<option value="${id}">${id}</option>`;
      });
    }

    // Pre-fill data when selecting existing order
    orderSelect.onchange = function(){
      const selected = this.value;
      if(!selected) return;
      const txDiv = Array.from(document.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transactions-item--imQKR')).find(x=>x.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__id--Ttk2j').innerText===selected);
      if(!txDiv) return;
      document.getElementById("tx-date").value = txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__date--n6Gnu')?.innerText || "";
      const typeText = txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__type--yRiVa')?.innerText || "Deposit";
      document.getElementById("tx-type").value = typeText;
      const methodText = txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__method--oY8r8')?.innerText || "USDT (TRC-20)";
      document.getElementById("tx-method").value = methodText;
      let amtText = txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__amount--v9Gal')?.innerText || "0";
      amtText = amtText.replace(/[^0-9.-]/g,"");
      document.getElementById("tx-amount").value = amtText;
      let statusText = txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-text--JmjRX')?.innerText || "Processing";
      if(statusText.includes("Waiting")) statusText="Processing";
      else if(statusText.includes("Processing")) statusText="Processing";
      else if(statusText.includes("Failed")) statusText="Failed";
      else statusText="Successful";
      document.getElementById("tx-status").value = statusText;
    }

    // --- Add / Update Transaction ---
    overlay.querySelector(".add-btn").onclick = () => {
      const isEdit = document.getElementById("mode-edit").checked;
      let order = generateOrder();
      const date = document.getElementById("tx-date").value || new Date().toLocaleString();
      const status = document.getElementById("tx-status").value;
      const type = document.getElementById("tx-type").value;
      const method = document.getElementById("tx-method").value || "USDT (TRC-20)";
      let amount = document.getElementById("tx-amount").value || "0";

      // Format amount
      amount = Number(amount.replace(/[^\d.]/g,"")).toLocaleString();
      amount = "$" + amount;
      let color = type==="Withdrawal" ? "#db4635" : "#0faf59";
      if(type==="Withdrawal" && !amount.startsWith("-")) amount="-"+amount;
      if(type==="Deposit" && !amount.startsWith("+")) amount="+"+amount;

      // Status Block
      let statusBlock="";
      if(status==="Processing"){
        const text = type==="Withdrawal"?"Waiting confirmation":"Processing...";
        const desc = type==="Withdrawal"?"The withdrawal is currently being processed on the side of the financial operator. Please wait - the funds should be received within 48 hours.":"Please note that payments with this method could take up to 24 hours to get processed. If it's not on your balance by that time - please submit a support ticket. The status may appear as «Failed» until the funds are actually received on our side.";
        statusBlock = `<div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-block--srWT8">
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-icon--iGg0J ---react-ui-TransactionsScreenItem-styles-module__muted--FGTfS">
            <svg class="icon-pending"><use xlink:href="/profile/images/spritemap.svg#icon-pending"></use></svg>
          </div>
          <span class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-text--JmjRX" style="color:#f4f4f4">${text}</span>
        </div>
        <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-processed--B3z9o">${desc}</div>`;
      }else if(status==="Successful"){
        statusBlock = `<div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-block--srWT8">
          <span class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-text--JmjRX" style="color:#0faf59">Successed</span>
        </div>`;
      }else if(status==="Failed"){
        statusBlock = `<div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-block--srWT8">
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-icon--iGg0J ---react-ui-TransactionsScreenItem-styles-module__danger--YdX2Q">
            <svg class="icon-close-tiny"><use xlink:href="/profile/images/spritemap.svg#icon-close-tiny"></use></svg>
          </div>
          <span class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status-text--JmjRX ---react-ui-TransactionsScreenItem-styles-module__close-tiny--FF3r3">Failed</span>
        </div>`;
      }

      if(isEdit){
        const selectedOrder = orderSelect.value;
        if(!selectedOrder) return alert("Select an order to edit");
        const txDiv = Array.from(document.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transactions-item--imQKR'))
          .find(x=>x.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__id--Ttk2j')?.innerText===selectedOrder);
        if(!txDiv) return;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__date--n6Gnu').innerText = date;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__type--yRiVa').innerText = type;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__method--oY8r8').innerText = method;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__amount--v9Gal').innerText = amount;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__amount--v9Gal').style.color=color;
        txDiv.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transactions-item__status--iqTzO').innerHTML=statusBlock;
      }else{
        const tx = document.createElement("div");
        tx.className="---react-ui-TransactionsScreenItem-styles-module__transactions-item--imQKR";
        tx.innerHTML=`
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__id--Ttk2j">${order}</div>
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__date--n6Gnu">${date}</div>
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__status--iqTzO">${statusBlock}</div>
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__type--yRiVa">${type}</div>
          <div class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__method--oY8r8">${method}</div>
          <b class="---react-ui-TransactionsScreenItem-styles-module__transactions-item__amount--v9Gal" style="color:${color}">${amount}</b>`;
        document.querySelector(".transactions-list__header").after(tx);
      }

      overlay.remove();
    };

    updateMode();
  }

  const header = document.querySelector(".transactions-list__header");
  if(header){
    header.style.cursor="pointer";
    header.addEventListener("click", openPopup);
  }
})();

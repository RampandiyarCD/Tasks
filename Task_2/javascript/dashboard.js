document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.textContent = `Greetings ${
      currentUser.name.split(" ")[0]
    }!`;
  }
  function formatCurrency(amount) {
    if (amount === undefined || amount === null) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("₹", "")
      .trim();
  }
  function updateAccountCards() {
    const savingsAccount = currentUser.accounts.savings;
    const savingsCard = document.querySelector(".account-card:nth-child(1)");
    if (savingsCard && savingsAccount) {
      savingsCard.querySelector(".text-gray-700.font-medium").textContent =
        "Savings Account";
      savingsCard.querySelector(
        ".closing-balance"
      ).textContent = `Closing balance: ${formatCurrency(
        savingsAccount.current_balance
      )}`;

      const savingsDetails = savingsCard.querySelector(".account-details");
      if (savingsDetails) {
        savingsDetails.querySelector(".savings-account-number").textContent =
          savingsAccount.account_number;
        savingsDetails.querySelector(".savings-name").textContent =
          currentUser.name;
        savingsDetails.querySelector(".savings-branch").textContent =
          savingsAccount.branch;
        savingsDetails.querySelector(".savings-ifsc").textContent =
          savingsAccount.ifsc;
      }
    }
    const currentAccount = currentUser.accounts.current;
    const currentCard = document.querySelector(".account-card:nth-child(2)");
    if (currentCard && currentAccount) {
      currentCard.querySelector(".text-gray-700.font-medium").textContent =
        "Current Account";
      currentCard.querySelector(
        ".current-balance"
      ).textContent = `Closing balance: ${formatCurrency(
        currentAccount.current_balance
      )}`;
      const currentDetails = currentCard.querySelector(".account-details");
      if (currentDetails) {
        currentDetails.querySelector(".current-account-number").textContent =
          currentAccount.account_number;
        currentDetails.querySelector(".current-name").textContent =
          currentUser.name;
        currentDetails.querySelector(".current-branch").textContent =
          currentAccount.branch;
        currentDetails.querySelector(".current-ifsc").textContent =
          currentAccount.ifsc;
      }
    }
    const creditAccount = currentUser.accounts.credit;
    const creditCard = document.querySelector(".account-card:nth-child(3)");
    if (creditCard && creditAccount) {
      creditCard.querySelector(".text-gray-700.font-medium").textContent =
        "Credit Account";
      creditCard.querySelector(
        ".credit-balance"
      ).textContent = `Current balance: ${formatCurrency(
        creditAccount.current_balance
      )}`;

      const creditDetails = creditCard.querySelector(".account-details");
      if (creditDetails) {
        creditDetails.querySelector(".credit-name").textContent =
          currentUser.name;
        creditDetails.querySelector(
          ".credit-card-number"
        ).textContent = `${creditAccount.card_number.slice(
          0,
          4
        )}-${creditAccount.card_number.slice(
          4,
          8
        )}-${creditAccount.card_number.slice(
          8,
          12
        )}-${creditAccount.card_number.slice(12)}`;
        creditDetails.querySelector(".credit-card-type").textContent =
          creditAccount.card_type;
      }
    }
  }
  updateAccountCards();
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }
  const tabs = document.querySelectorAll("[data-target]");
  const tabContents = document.querySelectorAll(".tab-content");
  const accountCards = document.querySelectorAll(".account-card");
  activateTab(document.querySelector("[data-target].text-orange-600"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      activateTab(this);
    });
  });
  accountCards.forEach((card) => {
    const header = card.querySelector(".flex.items-center.space-x-2") || card;
    const details = card.querySelector(".account-details");
    header.addEventListener("click", function () {
      const isOpening = details.classList.toggle("hidden");
      card.classList.toggle("is-open", !isOpening);
      if (!isOpening) {
        accountCards.forEach((otherCard) => {
          if (otherCard !== card && otherCard.classList.contains("is-open")) {
            otherCard.classList.remove("is-open");
            otherCard.querySelector(".account-details").classList.add("hidden");
          }
        });
      }
    });
  });
  function activateTab(activeTab) {
    const targetId = activeTab.getAttribute("data-target");
    const targetContent = document.getElementById(targetId);
    tabContents.forEach((content) => {
      content.classList.add("hidden");
    });
    tabs.forEach((tab) => {
      tab.classList.remove(
        "text-orange-600",
        "border-orange-600",
        "bg-orange-50"
      );
      tab.classList.add(
        "text-gray-700",
        "hover:bg-gray-50",
        "hover:text-gray-900"
      );
    });
    targetContent.classList.remove("hidden");
    activeTab.classList.remove(
      "text-gray-700",
      "hover:bg-gray-50",
      "hover:text-gray-900"
    );
    activeTab.classList.add(
      "text-orange-600",
      "border-orange-600",
      "bg-orange-50"
    );
  }
  const statementModal = document.getElementById("statementModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModalBtn = document.getElementById("closeModal");
  const closeModalBottomBtn = document.getElementById("closeModalBottom");
  const statementTableBody = document.getElementById("statementTableBody");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = statementModal.querySelector(".bg-white");

  function closeModal() {
    statementModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  function openModal() {
    statementModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  [closeModalBtn, closeModalBottomBtn, modalOverlay].forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });
  });

  modalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !statementModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  function showStatement(accountType) {
    const account = currentUser.accounts[accountType];
    if (!account || !account.statement) return;

    modalTitle.textContent = `${
      accountType.charAt(0).toUpperCase() + accountType.slice(1)
    } Account Statement`;

    statementTableBody.innerHTML = "";

    account.statement.forEach((transaction) => {
      const row = document.createElement("tr");

      let amountClass = "text-green-600";
      let amountSign = "";
      if (transaction.amount < 0) {
        amountClass = "text-red-600";
        amountSign = "-";
      } else {
        amountSign = "+";
      }

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                  transaction.date
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                  transaction.description
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${amountClass} font-medium">${amountSign}${formatCurrency(
        Math.abs(transaction.amount)
      )}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(
                  transaction.balance || ""
                )}</td>
            `;

      statementTableBody.appendChild(row);
    });

    openModal();
  }

  document.querySelectorAll(".view-statement").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const accountType = button.getAttribute("data-account-type");
      showStatement(accountType);
    });
  });

  const transferForm = document.querySelector("#transferFundContent form");
  if (transferForm) {
    const accountSelect = document.getElementById("choose-account");
    const beneficiarySelect = document.getElementById("beneficiary-account");

    if (currentUser.accounts.savings) {
      const option = document.createElement("option");
      option.value = "savings";
      option.textContent = `Savings Account (${currentUser.accounts.savings.account_number.slice(
        -4
      )})`;
      accountSelect.appendChild(option);
    }

    if (currentUser.accounts.current) {
      const option = document.createElement("option");
      option.value = "current";
      option.textContent = `Current Account (${currentUser.accounts.current.account_number.slice(
        -4
      )})`;
      accountSelect.appendChild(option);
    }

    const dummyBeneficiaries = [
      { name: "John Doe", accountNumber: "1234567890" },
      { name: "Jane Smith", accountNumber: "0987654321" },
      { name: "Alice Brown", accountNumber: "1122334455" },
    ];

    dummyBeneficiaries.forEach((beneficiary) => {
      const option = document.createElement("option");
      option.value = beneficiary.accountNumber;
      option.textContent = `${
        beneficiary.name
      } (${beneficiary.accountNumber.slice(-4)})`;
      beneficiarySelect.appendChild(option);
    });

    transferForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const fromAccount = accountSelect.value;
      const toAccount = beneficiarySelect.value;
      const amount = parseFloat(document.getElementById("amount").value);
      const remarks = document.getElementById("remarks").value;

      if (!fromAccount || fromAccount === "--Select an account--") {
        alert("Please select a source account");
        return;
      }

      if (!toAccount || toAccount === "--Select a Beneficiary--") {
        alert("Please select a beneficiary");
        return;
      }

      if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      const selectedAccount = currentUser.accounts[fromAccount];
      if (amount > selectedAccount.current_balance) {
        alert("Insufficient balance in selected account");
        return;
      }

      console.log("Transfer details:", {
        fromAccount,
        toAccount,
        amount,
        remarks,
      });

      const selectedBeneficiaryText =
        beneficiarySelect.options[beneficiarySelect.selectedIndex].textContent;
      alert(
        `Successfully transferred ${formatCurrency(
          amount
        )} to ${selectedBeneficiaryText}!`
      );

      transferForm.reset();
    });
  }
});

document.title = "Money Manager";
let parentTransactionDiv = document.querySelector("#transactiondiv");

function deletefn() {
  if (parentTransactionDiv) {
    parentTransactionDiv.addEventListener("click", async (details) => {
      if (details.target.classList.contains("deletebtn")) {
        let transactionDiv = details.target.closest("[data-id]");

        if (transactionDiv) {
          let transactionId = transactionDiv.getAttribute("data-id");
          let transactionType = transactionDiv.getAttribute("data-type");
          let transactionDate = transactionDiv.getAttribute("data-date");

          try {
            let response = await axios.delete(
              `https://coin-tracker-lilac.vercel.app/user/deleteTransaction/${transactionType}/${transactionId}`
            );

            if (response.status === 200) {
              transactionDiv.remove();

              // Check if this is the last transaction for the date
              let transactionsForDate = document.querySelectorAll(
                `[data-date="${transactionDate}"] #transactions`
              );

              if (transactionsForDate.length === 0) {
                // If this was the last transaction, remove the date heading and the HR line
                let dateHeading = document.querySelector(
                  `div[data-date-heading="${transactionDate}"]`
                );

                if (dateHeading) {
                  let gridbottomMargin = dateHeading.nextElementSibling;
                  gridbottomMargin.classList.remove("mb-10")
                  dateHeading.remove();
                }
              }

              // Check if there are no more transactions
              if (document.querySelectorAll("#transactions").length === 0) {
                document.querySelector(".main-transactiondiv").innerHTML =
                  '<h2 class="text-white">Nothing to show here</h2>';
              }

              // Update the amounts
              let data = response.data;
              AmountUpdate(data);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }
      }
    });
  }
}

async function AmountUpdate() {
  let responses = await axios.get(`https://coin-tracker-lilac.vercel.app/user/getdataback`);
  let data = await responses.data.user;

  document.querySelector("#totalExpense").innerHTML = "$" + data.totalExpense;
  document.querySelector("#totalIncome").innerHTML = "$" + data.totalIncome;
  document.querySelector("#totalBalance").innerHTML = "$" + data.totalBalance;
}

function dateupdater() {
  let datespan = document.querySelector("#date-update");

  let date = new Date();
  let day = date.getDate();

  datespan.textContent = day;
}
dateupdater();
deletefn();
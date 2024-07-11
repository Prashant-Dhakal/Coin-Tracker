document.title = "Chart"
    let barChart; 
    async function updateBarChart(timeframe) {
        try {
            let response = await axios.get("https://coin-tracker-lilac.vercel.app/user/getdataback");
            let data = response.data.arr;

            if(data.length > 0){

            let incomeData = data.filter(elem => elem.type === 'income');
            let expenseData = data.filter(elem => elem.type === 'expense');

            incomeData.sort((a, b) => b.amount - a.amount);
            expenseData.sort((a, b) => b.amount - a.amount);

            let incomeLabels = [];
            let incomeDataValues = [];
            incomeData.slice(0, 3).forEach(elem => {
                incomeLabels.push(elem.title); 
                incomeDataValues.push(elem.amount);
            });
            if (incomeData.length > 3) {
                incomeLabels.push('Other');
                let otherIncomeTotal = incomeData.slice(3).reduce((total, elem) => total + elem.amount, 0);
                incomeDataValues.push(otherIncomeTotal);
            }

            let expenseLabels = [];
            let expenseDataValues = [];
            expenseData.slice(0, 3).forEach(elem => {
                expenseLabels.push(elem.title);
                expenseDataValues.push(elem.amount);
            });
            if (expenseData.length > 3) {
                expenseLabels.push('Other');
                let otherExpenseTotal = expenseData.slice(3).reduce((total, elem) => total + elem.amount, 0);
                expenseDataValues.push(otherExpenseTotal);
            }

            // Update bar chart with new data
            updateChart( incomeLabels, incomeDataValues, expenseLabels, expenseDataValues);

            }else{
              document.querySelector("#chart-showing-container").innerHTML = "Record a transaction to trigger the chart to display its valuable insights."
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to update bar chart with provided data
function updateChart(
    incomeLabels,
    incomeDataValues,
    expenseLabels,
    expenseDataValues
  ) {
    const ctx = document.querySelector("#barChart").getContext("2d");

    if (barChart) {
        barChart.destroy();
      }

     barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [...incomeLabels, ...expenseLabels],
        datasets: [
          {
            label: "Income",
            data: [...incomeDataValues, ...Array(expenseLabels.length).fill(0)],
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Expense",
            data: [...Array(incomeLabels.length).fill(0), ...expenseDataValues],
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "x",
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 14,
              },
              color: "#fff",
              align: 'center',
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.7)",
            titleFont: {
              size: 16,
            },
            bodyFont: {
              size: 14,
            },
            borderWidth: 1,
            borderColor: "#ddd",
          },
        },
      },
    });
  }

    document.getElementById('timeframe').addEventListener('change', function() {
        const timeframe = this.value;
        updateBarChart(timeframe);
    });

    updateBarChart('week');

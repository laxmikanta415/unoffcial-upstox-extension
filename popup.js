document.addEventListener('DOMContentLoaded', function () {
  var addDailyPL = document.getElementById('addDailyPL');
  var holdingData = document.getElementById('holdingData');
  // onClick's logic below:
  holdingData.addEventListener('click', function () {
    //  readMyProfitLoss();
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { from: 'popup', subject: 'fetch_holding_data' },

          // ...also specifying a callback to be called
          //    from the receiving end (content script).
          renderHoldingData,
        );
      },
    );
  });

  function renderHoldingData(data) {
    let invested_amt = 0;
    let currnet_amt = 0;

    data.forEach((d) => {
      invested_amt += d.net_qty * d.avg_price;
      currnet_amt += d.net_qty * d.ltp;
    });
    pl_percentage = (
      [(currnet_amt - invested_amt) / invested_amt] * 100
    ).toFixed(2);
    document.getElementById('invested_amt').innerHTML = formatToCurrency.format(
      invested_amt,
    );
    document.getElementById('current_amt').innerHTML = formatToCurrency.format(
      currnet_amt,
    );
    document.getElementById('holding_pl').innerHTML = pl_percentage + '%';
  }

  addDailyPL.addEventListener('click', function () {
    //  readMyProfitLoss();
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { from: 'popup', subject: 'add_pl_data' },

          // ...also specifying a callback to be called
          //    from the receiving end (content script).
          readMyProfitLoss,
        );
      },
    );
  });

  function readMyProfitLoss(data) {
    if (data) {
      alert('Profit loss daily added');
    } else {
      alert('Error occured');
    }
  }
});

var formatToCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

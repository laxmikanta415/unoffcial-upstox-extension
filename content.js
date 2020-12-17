chrome.runtime.sendMessage({
  from: 'content',
  subject: 'showPageAction',
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // First, validate the message's structure.
  if (msg.from === 'popup' && msg.subject === 'add_pl_data') {
    setInterval(addDailyPL, 1000);
    response(true);
  }

  if (msg.from === 'popup' && msg.subject === 'fetch_holding_data') {
    const data = convertHoldingTableToJson();
    renderInPage(data);
    response(data);
  }

  function addDailyPL() {
    let total = 0;
    jQuery('span[data-id="booksDayPnL"]').each((index, item) => {
      let pl = +item.innerHTML.replace(',', '');
      pl = isNaN(pl) ? 0 : pl;
      total = total + pl;
    });
    jQuery('#fake-one').remove();
    let dail_pl = '';
    if (total < 0) {
      dail_pl = `<div id="fake-one" class="_tabLabel_41640 _danger_41640 _tablePnl_ee8f1">Daily P&amp;L <span style="color: #E91E63;">${total.toFixed(
        2,
      )}</span></div>`;
    } else {
      dail_pl = `<div id="fake-one" class="_tabLabel_41640 _success_41640 _tablePnl_ee8f1">Daily P&amp;L <span style="color: rgb(56, 142, 60);">${total.toFixed(
        2,
      )}</span></div>`;
    }
    jQuery('div[data-id="HoldingsTab"]').append(dail_pl);
    return total;
  }

  function renderInPage(data) {
    jQuery('#holding_summary').remove();
    var formatToCurrency = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });
    let invested_amt = 0;
    let currnet_amt = 0;
    data.forEach((d) => {
      invested_amt += d.net_qty * d.avg_price;
      currnet_amt += d.net_qty * d.ltp;
    });
    pl_percentage = (
      [(currnet_amt - invested_amt) / invested_amt] * 100
    ).toFixed(2);
    let currnet_amt_fmt = formatToCurrency.format(currnet_amt);
    let invested_amt_fmt = formatToCurrency.format(invested_amt);
    const container = document.createElement('div');
    container.setAttribute('id', 'holding_summary');
    container.setAttribute(
      'style',
      'background: #392B58; margin: 5px; color: #fff; float: right; font-size: 14px; padding: 15px; border: 10px solid #645E9D;',
    );
    jQuery('table').parent()[0].append(container);
    const pl_row = document.createElement('div');
    pl_row.innerHTML = `<h2>Net P/L %: ${pl_percentage}%</h2><br/>`;
    container.insertAdjacentElement('afterBegin', pl_row);

    const invested_amt_row = document.createElement('div');
    invested_amt_row.innerHTML = ` <h2>Current Amount: ${currnet_amt_fmt}</h2> <br/>`;
    container.insertAdjacentElement('afterBegin', invested_amt_row);

    const current_amt_row = document.createElement('div');
    current_amt_row.innerHTML = `<h2>Invested Amount: ${invested_amt_fmt}</h2><br/>`;
    container.insertAdjacentElement('afterBegin', current_amt_row);
  }

  function convertHoldingTableToJson() {
    let headers = jQuery('table thead td>span')
      .contents()
      .filter(function () {
        return this.nodeType === 3;
      });
    let header_names = [];
    headers.each((index, item) => {
      item = item.textContent
        .toLowerCase()
        .replace(' ', '_')
        .replace('.', '')
        .replace('(', '')
        .replace(')', '')
        .replace('&', '_')
        .replace('%', 'precentage');
      header_names.push(item);
    });
    let rows = jQuery('table tbody tr').even();
    let data = [];
    rows.each((rowIndex, rowItem) => {
      let holdingItem = {};
      jQuery(rowItem)
        .children()
        .each((colIndex, colItem) => {
          if (colIndex < jQuery(rowItem).children().length - 1) {
            let colValue = colItem.textContent
              .replace(/,/gi, '')
              .replace(/%/gi, '');
            holdingItem[header_names[colIndex]] = isNaN(colValue)
              ? colValue
              : +colValue;
            // console.log(header_names[colIndex]);
            //  console.log(colItem.textContent);
          }
        });
      data.push(holdingItem);
    });
    return data;
  }
});

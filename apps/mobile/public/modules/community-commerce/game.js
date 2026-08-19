(function () {
  "use strict";

  var NAMESPACE = "CORE_INDUSTRY_SIM";
  var TARGET_ORIGIN = window.location.origin;
  var app = document.getElementById("app");

  var ROUNDS = [
    {
      id: "merchandise",
      title: "第 1 周 · 主推商品",
      scenario: "新店起步，货架有限。先决定主推品类，把订单量做起来。",
      options: [
        { id: "vegetable", label: "平价蔬菜包", hint: "薄利多销，价格敏感型用户多", effect: "订单量提升，毛利空间变薄", metrics: { orders: 30, margin: -4, repurchase: 2, newCustomer: 6 } },
        { id: "fruit", label: "本地水果礼盒", hint: "毛利较高，适合周末自提场景", effect: "毛利提升，复购更有保障", metrics: { orders: 12, margin: 7, repurchase: 6, newCustomer: 2 } },
        { id: "prepared", label: "冷冻预制菜", hint: "客单高，但需要冷柜与损耗管理", effect: "客单价提升，损耗风险上升", metrics: { orders: 8, margin: 3, repurchase: 1, newCustomer: 9 } }
      ]
    },
    {
      id: "promotion",
      title: "第 2 周 · 周末促销",
      scenario: "有了一批回头客，这周周末档期怎么安排？",
      options: [
        { id: "full_reduction", label: "满 50 减 8", hint: "典型拉单手段，抬升客单", effect: "订单量提升，毛利小幅下降", metrics: { orders: 26, margin: -5, repurchase: 3, newCustomer: 4 } },
        { id: "flash_sale", label: "爆品直降", hint: "用一款爆品把新客引进社群", effect: "新客占比提升，毛利承压", metrics: { orders: 14, margin: -1, repurchase: 2, newCustomer: 12 } },
        { id: "member_price", label: "会员专享价", hint: "给老客让利，稳住毛利结构", effect: "复购率提升，毛利稳定", metrics: { orders: 10, margin: 2, repurchase: 10, newCustomer: 1 } }
      ]
    },
    {
      id: "fulfillment",
      title: "第 3 周 · 履约方式",
      scenario: "单量起来了，自提和配送的比例决定成本和体验。",
      options: [
        { id: "pickup", label: "集中自提", hint: "省掉最后一公里配送成本", effect: "毛利提升，履约成本下降", metrics: { orders: 6, margin: 8, repurchase: 1, newCustomer: 0 } },
        { id: "delivery", label: "加强配送", hint: "当日达，体验更好但成本更高", effect: "复购率提升，成本上升", metrics: { orders: 10, margin: -3, repurchase: 8, newCustomer: 2 } },
        { id: "mixed", label: "混合模式", hint: "自提为主、重点区域配送", effect: "各项指标相对均衡", metrics: { orders: 8, margin: 2, repurchase: 4, newCustomer: 3 } }
      ]
    }
  ];

  var state = {
    roundIndex: 0,
    choices: []
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function post(payload) {
    if (window.parent === window) return;
    window.parent.postMessage({ source: NAMESPACE, payload: payload }, TARGET_ORIGIN);
  }

  function onMessage(event) {
    if (event.origin !== window.location.origin) return;
    var data = event.data;
    if (!data || data.source !== NAMESPACE) return;
    var payload = data.payload;
    if (payload && payload.type === "HOST_INIT") {
      startRun();
    }
  }

  function startRun() {
    state.roundIndex = 0;
    state.choices = [];
    post({ type: "DEMO_STARTED" });
    renderRound();
  }

  function choose(option) {
    state.choices.push(option);
    if (state.roundIndex < ROUNDS.length - 1) {
      state.roundIndex += 1;
      renderRound();
    } else {
      renderResult();
      post({ type: "DEMO_COMPLETED" });
    }
  }

  function computeResult() {
    var totals = { orders: 100, margin: 12, repurchase: 18, newCustomer: 10 };
    state.choices.forEach(function (option) {
      totals.orders += option.metrics.orders;
      totals.margin += option.metrics.margin;
      totals.repurchase += option.metrics.repurchase;
      totals.newCustomer += option.metrics.newCustomer;
    });
    totals.orders = totals.orders * 24;
    totals.margin = clamp(totals.margin, 5, 30);
    totals.repurchase = clamp(totals.repurchase, 5, 45);
    totals.newCustomer = clamp(totals.newCustomer, 5, 40);
    return totals;
  }

  function dominantStrategy() {
    var deltas = { orders: 0, margin: 0, repurchase: 0, newCustomer: 0 };
    state.choices.forEach(function (option) {
      deltas.orders += option.metrics.orders;
      deltas.margin += option.metrics.margin;
      deltas.repurchase += option.metrics.repurchase;
      deltas.newCustomer += option.metrics.newCustomer;
    });
    var key = Object.keys(deltas).sort(function (a, b) {
      return deltas[b] - deltas[a];
    })[0];
    var messages = {
      orders: "你的经营更看重规模，用走量策略把订单量顶了上去。如果长期这样，要留意毛利空间和履约压力。",
      margin: "你的选择更看重毛利，每一周都在为利润空间做平衡。盘子做稳之后，可以把规模再拉起来。",
      repurchase: "你把重心放在老客关系上，复购基础扎实，经营会更有韧性。后续可以再补一些拉新动作。",
      newCustomer: "你的打法偏扩张，新客占比更高、增长更快，但也要尽快把留存和复购做起来。"
    };
    return messages[key];
  }

  function headerHtml() {
    return (
      '<div class="app-header">' +
      '<div class="app-logo">团</div>' +
      '<div><div class="app-title">经营决策体验</div><div class="app-subtitle">社区团购经营模拟 · demo</div></div>' +
      "</div>"
    );
  }

  function dotsHtml() {
    var html = '<div class="progress-dots">';
    for (var i = 0; i < ROUNDS.length; i += 1) {
      html += i < state.roundIndex ? "<span class=\"done\"></span>" : "<span></span>";
    }
    return html + "</div>";
  }

  function renderRound() {
    var round = ROUNDS[state.roundIndex];
    var html = headerHtml();
    html += '<div class="card"><div class="round-meta"><span class="round-badge">第 ' + (state.roundIndex + 1) + " 周</span>" + dotsHtml() + "</div>";
    html += '<h2 class="round-title">' + round.title + "</h2>";
    html += '<p class="round-scenario">' + round.scenario + "</p>";
    round.options.forEach(function (option, index) {
      html +=
        '<button type="button" class="option" data-option="' + index + '">' +
        '<div class="option-label">' + option.label + "</div>" +
        '<div class="option-hint">' + option.hint + "</div>" +
        "</button>";
    });
    html += "</div>";
    app.innerHTML = html;
    Array.prototype.forEach.call(app.querySelectorAll(".option"), function (button) {
      button.addEventListener("click", function () {
        choose(round.options[Number(button.getAttribute("data-option"))]);
      });
    });
  }

  function renderResult() {
    var totals = computeResult();
    var html = headerHtml();
    html += '<div class="card"><div class="result-head"><div class="result-title">本次经营结果</div>';
    html += '<p class="result-note">经过三周的决策，你的社区团购店在本期模拟中交出了这样一份经营答卷。</p></div>';
    html += '<div class="metrics">';
    html += metricHtml("周订单量", totals.orders.toLocaleString("zh-CN") + " 单");
    html += metricHtml("综合毛利", totals.margin.toFixed(1) + "%");
    html += metricHtml("复购率", totals.repurchase.toFixed(0) + "%");
    html += metricHtml("新客占比", totals.newCustomer.toFixed(0) + "%");
    html += "</div>";
    html += '<div class="review-title">决策复盘</div><ul class="review-list">';
    state.choices.forEach(function (option, index) {
      html += '<li class="review-item">第 ' + (index + 1) + ' 周选择「' + option.label + "」：" + option.effect + "</li>";
    });
    html += "</ul>";
    html += '<div class="summary">' + dominantStrategy() + "</div>";
    html += "</div>";
    html += '<p class="disclaimer">结果仅供互动参考，不代表正式能力评价。本次体验不记录成绩，也不影响你的赛事、课程或个人档案。</p>';
    html += '<button type="button" class="end-link" id="end-link">结束体验并返回</button>';
    app.innerHTML = html;
    document.getElementById("end-link").addEventListener("click", function () {
      post({ type: "DEMO_EXIT_REQUESTED" });
    });
  }

  function metricHtml(label, value) {
    return '<div class="metric"><div class="metric-value">' + value + '</div><div class="metric-label">' + label + "</div></div>";
  }

  post({ type: "MODULE_READY" });
  window.addEventListener("message", onMessage);
})();

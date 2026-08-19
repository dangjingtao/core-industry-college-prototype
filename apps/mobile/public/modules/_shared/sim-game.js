(function () {
  "use strict";

  var cfg = window.SIM_GAME_CONFIG;
  if (!cfg || !Array.isArray(cfg.rounds) || !cfg.rounds.length || !Array.isArray(cfg.metrics) || !Array.isArray(cfg.virtualPlayers)) {
    return;
  }

  var NAMESPACE = "CORE_INDUSTRY_SIM";
  var TARGET_ORIGIN = window.location.origin;
  var app = document.getElementById("app");
  var state = { roundIndex: 0, choices: [] };

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
      state.roundIndex = 0;
      state.choices = [];
      post({ type: "DEMO_STARTED" });
      renderRound();
    }
  }

  function choose(option) {
    state.choices.push(option);
    if (state.roundIndex < cfg.rounds.length - 1) {
      state.roundIndex += 1;
      renderRound();
    } else {
      renderResult();
      post({ type: "DEMO_COMPLETED" });
    }
  }

  function metricKeys() {
    return cfg.metrics.map(function (m) {
      return m.key;
    });
  }

  function computeResult() {
    var totals = {};
    metricKeys().forEach(function (key) {
      totals[key] = cfg.base[key] || 0;
    });
    state.choices.forEach(function (option) {
      metricKeys().forEach(function (key) {
        if (option.metrics && typeof option.metrics[key] === "number") {
          totals[key] += option.metrics[key];
        }
      });
    });
    cfg.metrics.forEach(function (m) {
      if (m.clamp) totals[m.key] = clamp(totals[m.key], m.clamp[0], m.clamp[1]);
    });
    return totals;
  }

  function buildRanking(user) {
    var keys = metricKeys();
    var rows = cfg.virtualPlayers.map(function (p) {
      var values = {};
      keys.forEach(function (key) {
        values[key] = p[key] || 0;
      });
      return { name: p.name, virtual: true, values: values };
    });
    var me = { name: "你", virtual: false, values: {} };
    keys.forEach(function (key) {
      me.values[key] = user[key];
    });
    rows.push(me);

    keys.forEach(function (key) {
      var vals = rows.map(function (row) {
        return row.values[key];
      });
      var min = Math.min.apply(null, vals);
      var max = Math.max.apply(null, vals);
      var span = max - min || 1;
      rows.forEach(function (row) {
        row.norm = row.norm || {};
        row.norm[key] = ((row.values[key] - min) / span) * 100;
      });
    });

    rows.forEach(function (row) {
      var sum = 0;
      keys.forEach(function (key) {
        sum += row.norm[key];
      });
      row.composite = Math.round(sum / keys.length);
    });

    rows.sort(function (a, b) {
      return b.composite - a.composite;
    });
    rows.forEach(function (row, index) {
      row.rank = index + 1;
    });
    return rows;
  }

  function headerHtml() {
    return (
      '<div class="app-header">' +
      '<div class="app-logo">' + cfg.logo + "</div>" +
      "<div><div class=\"app-title\">" + cfg.title + "</div><div class=\"app-subtitle\">" + cfg.kicker + "</div></div>" +
      "</div>"
    );
  }

  function dotsHtml() {
    var html = '<div class="progress-dots">';
    for (var i = 0; i < cfg.rounds.length; i += 1) {
      html += i < state.roundIndex ? '<span class="done"></span>' : "<span></span>";
    }
    return html + "</div>";
  }

  function renderRound() {
    var round = cfg.rounds[state.roundIndex];
    var html = headerHtml();
    html += '<div class="card"><div class="round-meta"><span class="round-badge">第 ' + (state.roundIndex + 1) + cfg.roundUnit + "</span>" + dotsHtml() + "</div>";
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

  function metricHtml(label, value) {
    return '<div class="metric"><div class="metric-value">' + value + '</div><div class="metric-label">' + label + "</div></div>";
  }

  function renderResult() {
    var totals = computeResult();
    var html = headerHtml();
    html += '<div class="card"><div class="result-head"><div class="result-title">本次经营结果</div>';
    html += "<p class=\"result-note\">" + cfg.intro + "</p></div>";
    html += '<div class="metrics">';
    cfg.metrics.forEach(function (m) {
      var value = m.format ? m.format(totals[m.key]) : totals[m.key];
      html += metricHtml(m.label, value);
    });
    html += "</div>";
    html += '<div class="review-title">决策复盘</div><ul class="review-list">';
    state.choices.forEach(function (option, index) {
      html += '<li class="review-item">第 ' + (index + 1) + cfg.roundUnit + ' 选择「' + option.label + "」：" + option.effect + "</li>";
    });
    html += "</ul>";
    var summary = typeof cfg.summarize === "function" ? cfg.summarize(state.choices, totals) : "基于你的选择，本次模拟已经完成。";
    html += '<div class="summary">' + summary + "</div>";
    html += "</div>";
    html += rankingHtml(buildRanking(totals));
    html += '<p class="disclaimer">结果仅供互动参考，不代表正式能力评价。本次体验不记录成绩，也不影响你的赛事、课程或个人档案。</p>';
    html += '<button type="button" class="end-link" id="end-link">结束体验并返回</button>';
    app.innerHTML = html;
    document.getElementById("end-link").addEventListener("click", function () {
      post({ type: "DEMO_EXIT_REQUESTED" });
    });
  }

  function rankingHtml(rows) {
    var html = '<div class="card"><div class="round-meta"><span class="round-badge">本场排名</span></div>';
    html += '<p class="rank-note">与几位虚拟经营者同场对比，综合表现为各指标在虚拟参与者中的归一化均值。</p>';
    html += '<ol class="rank-list">';
    rows.forEach(function (row) {
      var cls = row.virtual ? "" : " is-me";
      html += '<li class="rank-item' + cls + '"><span class="rank-pos">' + row.rank + "</span>" +
        '<span class="rank-name">' + row.name + (row.virtual ? "" : "（本场）") + "</span>" +
        '<span class="rank-value">' + row.composite + "</span></li>";
    });
    html += "</ol>";
    html += '<p class="disclaimer">排名仅在本次模拟的虚拟参与者之间比较，不代表真实能力评价。</p>';
    html += "</div>";
    return html;
  }

  post({ type: "MODULE_READY" });
  window.addEventListener("message", onMessage);
})();

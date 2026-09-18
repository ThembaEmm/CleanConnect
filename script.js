(function(){
  var STORAGE_KEY = "cleanconnect_reports";
  var BASE_REPORTS = 120;
  var screen = document.getElementById("screen");

  function loadReports(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveReports(reports){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); }
    catch(e){ /* storage unavailable, continue silently */ }
  }
  function renderStats(reports){
    var el = document.getElementById("statReports");
    if(el) el.textContent = BASE_REPORTS + reports.length;
  }
  function escapeHtml(str){
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function renderStatusList(reports){
    var list = document.getElementById("statusList");
    if(!list) return;
    if(reports.length === 0){
      list.innerHTML = '<p class="empty-state">No reports yet — submit one above and it will show up here.</p>';
      return;
    }
    var html = "";
    reports.slice().reverse().forEach(function(r){
      var statusClass = r.status === "Resolved" ? "resolved" : (r.status === "In review" ? "review" : "pending");
      html += '' +
        '<div class="status-card">' +
          '<div class="where">📍 ' + escapeHtml(r.location) +
            '<span class="when">' + r.type + ' • ' + r.date + '</span>' +
          '</div>' +
          '<span class="status ' + statusClass + '">' + r.status + '</span>' +
        '</div>';
    });
    list.innerHTML = html;
  }
  function refresh(){
    var reports = loadReports();
    renderStats(reports);
    renderStatusList(reports);
  }

  var form = document.getElementById("reportForm");
  if(form){
    form.addEventListener("submit", function(event){
      event.preventDefault();
      var location = document.getElementById("location").value.trim();
      var type = document.getElementById("pollutionType").value;
      if(!location){ return; }
      var reports = loadReports();
      reports.push({
        location: location,
        type: type,
        status: "Pending",
        date: new Date().toLocaleDateString()
      });
      saveReports(reports);
      refresh();
      form.reset();
      var list = document.getElementById("statusList");
      if(list) list.scrollIntoView({ behavior:"smooth", block:"nearest" });
    });
  }

  var sections = ["top","report","map","contact"].map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".bottom-nav a"));

  function updateActiveNav(){
    var scrollPos = screen.scrollTop + 100;
    var currentId = "top";
    sections.forEach(function(sec){
      if(sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function(a){
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  screen.addEventListener("scroll", updateActiveNav, { passive:true });

  window.addEventListener("load", function(){
    refresh();
    updateActiveNav();

    var splash = document.getElementById("splash");
    var content = document.getElementById("appContent");
    content.classList.add("ready");

    setTimeout(function(){
      splash.classList.add("splash-hide");
      setTimeout(function(){ splash.style.display = "none"; }, 500);
    }, 1200);
  });
})();
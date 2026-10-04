const chart = document.getElementById("sales-chart");
    const tooltip = document.getElementById("chart-tooltip");
    const period = document.getElementById("period");
    const datasets = {
      7: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        current: [35, 52, 44, 69, 58, 82, 73],
        previous: [30, 43, 40, 52, 50, 66, 61]
      },
      30: {
        labels: ["May 6", "May 10", "May 14", "May 18", "May 22", "May 26", "May 30"],
        current: [36, 49, 43, 64, 55, 78, 71],
        previous: [30, 40, 45, 50, 48, 62, 59]
      },
      90: {
        labels: ["Mar 10", "Mar 24", "Apr 7", "Apr 21", "May 5", "May 19", "Jun 2"],
        current: [31, 45, 42, 61, 55, 72, 84],
        previous: [35, 41, 39, 51, 47, 58, 65]
      }
    };

    function renderChart(days) {
      const data = datasets[days];
      const width = 680, height = 220, left = 42, right = 8, top = 8, bottom = 28;
      const plotWidth = width - left - right, plotHeight = height - top - bottom;
      const y = value => top + (100 - value) / 100 * plotHeight;
      const x = index => left + index * plotWidth / (data.labels.length - 1);
      const points = values => values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
      const grid = [0, 1, 2, 3].map(index => {
        const gridY = top + index * plotHeight / 3;
        const label = ["$4k", "$3k", "$2k", "$1k"][index];
        return `<line x1="${left}" y1="${gridY}" x2="${width}" y2="${gridY}" stroke="#edf0eb" stroke-dasharray="3 4"/><text x="0" y="${gridY + 3}" fill="#a4aaa2" font-size="9">${label}</text>`;
      }).join("");
      const currentPoints = points(data.current);
      const previousPoints = points(data.previous);
      const area = `M ${x(0)} ${y(data.current[0])} ` + data.current.slice(1).map((v, i) => `L ${x(i + 1)} ${y(v)}`).join(" ") + ` L ${x(data.current.length - 1)} ${height - bottom} L ${x(0)} ${height - bottom} Z`;
      const labels = data.labels.map((label, index) => `<text x="${x(index)}" y="${height - 5}" text-anchor="middle" fill="#9da49b" font-size="9">${label}</text>`).join("");
      const dots = data.current.map((value, index) => `<circle class="chart-point" data-label="${data.labels[index]}" data-value="${value}" cx="${x(index)}" cy="${y(value)}" r="5" fill="#3b7551" stroke="#fff" stroke-width="2"/>`).join("");
      chart.innerHTML = `${grid}<path d="${area}" fill="#3b7551" opacity=".07"/><polyline points="${previousPoints}" fill="none" stroke="#d6dfd3" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${currentPoints}" fill="none" stroke="#4e8860" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}`;
      chart.querySelectorAll(".chart-point").forEach(point => {
        point.addEventListener("mouseenter", event => {
          tooltip.innerHTML = `<strong>${event.currentTarget.dataset.label}</strong>$${(Number(event.currentTarget.dataset.value) * 60).toLocaleString()} revenue`;
          tooltip.style.display = "block";
          const bounds = chart.getBoundingClientRect();
          const pointBounds = event.currentTarget.getBoundingClientRect();
          tooltip.style.left = `${Math.min(bounds.width - 115, Math.max(36, pointBounds.left - bounds.left))}px`;
          tooltip.style.top = `${Math.max(0, pointBounds.top - bounds.top - 42)}px`;
        });
        point.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });
      });
    }
    renderChart(period.value);
    period.addEventListener("change", () => {
      renderChart(period.value);
      const labels = { "7": ["$11,620", "684", "$16.99", "2,018"], "30": ["$48,294", "2,846", "$16.98", "8,392"], "90": ["$139,840", "8,214", "$17.02", "24,116"] };
      const values = labels[period.value];
      document.querySelector('[data-metric="revenue"]').textContent = values[0];
      document.querySelector('[data-metric="orders"]').textContent = values[1];
      document.querySelector('[data-metric="aov"]').textContent = values[2];
      document.querySelector('[data-metric="items"]').textContent = values[3];
    });

    let toastTimer;
    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
    }
    document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));
    document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(".crumb b").textContent = button.dataset.nav;
      if (button.dataset.nav !== "Overview") showToast(`${button.dataset.nav} view selected.`);
    }));
    document.getElementById("export").addEventListener("click", () => {
      const rows = [
        ["Metric", "Value"],
        ["Revenue", document.querySelector('[data-metric="revenue"]').textContent],
        ["Orders", document.querySelector('[data-metric="orders"]').textContent],
        ["Average order value", document.querySelector('[data-metric="aov"]').textContent],
        ["Items sold", document.querySelector('[data-metric="items"]').textContent]
      ];
      const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      link.download = "marketday-sales-report.csv";
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("Your sales report has been downloaded.");
    });

// script.js — Interactions: theme, modal, CRUD (projects/posts/tasks), particles, typing, sounds
(() => {
  // Elements helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // sound
  const clickAudio = $("#clickSnd");

  function playClick() {
    try {
      clickAudio.currentTime = 0;
      clickAudio.play();
    } catch (e) {
      /* ignore */
    }
  }

  // THEME
  const themeBtn = $("#btnTheme");
  themeBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    playClick();
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  });
  if (localStorage.getItem("theme") === "dark")
    document.documentElement.classList.add("dark");

  // MODAL
  const modal = $("#modal");
  const modalInner = $("#modalInner");
  const modalClose = $("#modalClose");
  modalClose.addEventListener("click", () => modal.classList.remove("open"));
  function openModal(html) {
    modalInner.innerHTML = html;
    modal.classList.add("open");
  }

  // UTILS
  function escapeHtml(s = "") {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function download(filename, text) {
    const a = document.createElement("a");
    const blob = new Blob([text], { type: "application/json" });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ABOUT (editable)
  $("#openProfileEdit").addEventListener("click", () => {
    const cur = localStorage.getItem("about") || $("#aboutText").textContent;
    openModal(
      `<h3>Edit Tentang Saya</h3>
       <textarea id="aboutEdit" style="width:100%;height:160px">${escapeHtml(
         cur
       )}</textarea>
       <div style="text-align:right;margin-top:10px"><button id="saveAbout" class="btn">Simpan</button></div>`
    );
    $("#saveAbout").addEventListener("click", () => {
      const v = $("#aboutEdit").value.trim();
      localStorage.setItem("about", v);
      $("#aboutText").textContent = v;
      modal.classList.remove("open");
      playClick();
    });
  });
  if (localStorage.getItem("about"))
    $("#aboutText").textContent = localStorage.getItem("about");

  // PROJECTS CRUD
  function renderProjects() {
    const arr = JSON.parse(localStorage.getItem("projects") || "[]");
    const wrap = $("#projects");
    wrap.innerHTML = "";
    arr.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "project fade";
      el.innerHTML = `
        <div class="proj-actions">
          <button class="btn small" data-i="${i}" data-act="edit">Edit</button>
          <button class="btn ghost small" data-i="${i}" data-act="del">Hapus</button>
        </div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc)}</p>
      `;
      wrap.appendChild(el);
    });
  }
  $("#addProject").addEventListener("click", () => {
    openModal(`
      <h3>Tambah Proyek</h3>
      <input id="projTitle" placeholder="Judul proyek">
      <textarea id="projDesc" style="height:120px"></textarea>
      <div style="text-align:right;margin-top:10px"><button id="saveProj" class="btn">Simpan</button></div>
    `);
    $("#saveProj").addEventListener("click", () => {
      const t = $("#projTitle").value.trim();
      const d = $("#projDesc").value.trim();
      if (!t || !d) return alert("Isi semua bidang");
      const arr = JSON.parse(localStorage.getItem("projects") || "[]");
      arr.unshift({ title: t, desc: d });
      localStorage.setItem("projects", JSON.stringify(arr));
      modal.classList.remove("open");
      renderProjects();
      playClick();
    });
  });
  $("#projects").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const i = Number(b.dataset.i);
    const act = b.dataset.act;
    const arr = JSON.parse(localStorage.getItem("projects") || "[]");
    if (act === "del") {
      if (!confirm("Hapus proyek?")) return;
      arr.splice(i, 1);
      localStorage.setItem("projects", JSON.stringify(arr));
      renderProjects();
      playClick();
    }
    if (act === "edit") {
      const p = arr[i];
      openModal(`
        <h3>Edit Proyek</h3>
        <input id="projTitle" value="${escapeHtml(p.title)}">
        <textarea id="projDesc" style="height:120px">${escapeHtml(
          p.desc
        )}</textarea>
        <div style="text-align:right;margin-top:10px"><button id="saveProjEdit" class="btn">Simpan</button></div>
      `);
      $("#saveProjEdit").addEventListener("click", () => {
        arr[i].title = $("#projTitle").value.trim();
        arr[i].desc = $("#projDesc").value.trim();
        localStorage.setItem("projects", JSON.stringify(arr));
        modal.classList.remove("open");
        renderProjects();
        playClick();
      });
    }
  });
  $("#exportProjects").addEventListener("click", () => {
    const data = localStorage.getItem("projects") || "[]";
    download("projects.json", data);
    playClick();
  });

  // POSTS CRUD
  function renderPosts() {
    const arr = JSON.parse(localStorage.getItem("posts") || "[]");
    const wrap = $("#posts");
    wrap.innerHTML = "";
    arr.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "post fade";
      el.innerHTML = `<h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(
        p.body
      )}</p>
        <div style="margin-top:8px"><button class="btn small" data-i="${i}" data-act="editPost">Edit</button> <button class="btn ghost small" data-i="${i}" data-act="delPost">Hapus</button></div>`;
      wrap.appendChild(el);
    });
  }
  $("#addPost").addEventListener("click", () => {
    openModal(`
      <h3>Tulis Post</h3>
      <input id="postTitle" placeholder="Judul">
      <textarea id="postBody" style="height:160px"></textarea>
      <div style="text-align:right;margin-top:10px"><button id="savePost" class="btn">Simpan</button></div>
    `);
    $("#savePost").addEventListener("click", () => {
      const t = $("#postTitle").value.trim();
      const b = $("#postBody").value.trim();
      if (!t || !b) return alert("Isi semua");
      const arr = JSON.parse(localStorage.getItem("posts") || "[]");
      arr.unshift({ title: t, body: b, created: Date.now() });
      localStorage.setItem("posts", JSON.stringify(arr));
      modal.classList.remove("open");
      renderPosts();
      playClick();
    });
  });
  $("#posts").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const i = Number(b.dataset.i);
    const act = b.dataset.act;
    const arr = JSON.parse(localStorage.getItem("posts") || "[]");
    if (act === "delPost") {
      if (!confirm("Hapus post?")) return;
      arr.splice(i, 1);
      localStorage.setItem("posts", JSON.stringify(arr));
      renderPosts();
      playClick();
    }
    if (act === "editPost") {
      const p = arr[i];
      openModal(`
        <h3>Edit Post</h3>
        <input id="postTitle" value="${escapeHtml(p.title)}">
        <textarea id="postBody" style="height:160px">${escapeHtml(
          p.body
        )}</textarea>
        <div style="text-align:right;margin-top:10px"><button id="savePostEdit" class="btn">Simpan</button></div>
      `);
      $("#savePostEdit").addEventListener("click", () => {
        arr[i].title = $("#postTitle").value.trim();
        arr[i].body = $("#postBody").value.trim();
        localStorage.setItem("posts", JSON.stringify(arr));
        modal.classList.remove("open");
        renderPosts();
        playClick();
      });
    }
  });
  $("#exportPosts").addEventListener("click", () => {
    const data = localStorage.getItem("posts") || "[]";
    download("posts.json", data);
    playClick();
  });

  // TASKS
  function renderTasks() {
    const arr = JSON.parse(localStorage.getItem("daftarTugas") || "[]");
    const wrap = $("#taskList");
    wrap.innerHTML = "";
    arr.forEach((t, i) => {
      const d = document.createElement("div");
      d.className = "task";
      d.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${escapeHtml(t.title)}</strong>
            <div><button class="btn small" data-i="${i}" data-act="delTask">Hapus</button></div>
          </div>
          <div style="margin-top:8px;white-space:pre-wrap">${escapeHtml(
            t.body
          )}</div>
        `;
      wrap.appendChild(d);
    });
  }
  $("#saveTask").addEventListener("click", () => {
    const title = $("#taskTitle").value.trim();
    const body = $("#taskBody").value.trim();
    if (!title || !body) return alert("Isi judul dan isi");
    const arr = JSON.parse(localStorage.getItem("daftarTugas") || "[]");
    arr.unshift({ title, body, created: Date.now() });
    localStorage.setItem("daftarTugas", JSON.stringify(arr));
    $("#taskTitle").value = "";
    $("#taskBody").value = "";
    renderTasks();
    playClick();
  });
  $("#taskList").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const i = Number(b.dataset.i);
    const act = b.dataset.act;
    const arr = JSON.parse(localStorage.getItem("daftarTugas") || "[]");
    if (act === "delTask") {
      if (!confirm("Hapus tugas?")) return;
      arr.splice(i, 1);
      localStorage.setItem("daftarTugas", JSON.stringify(arr));
      renderTasks();
      playClick();
    }
  });
  $("#clearAll").addEventListener("click", () => {
    if (!confirm("Hapus semua tugas?")) return;
    localStorage.removeItem("daftarTugas");
    renderTasks();
    playClick();
  });

  // INIT render from storage
  renderProjects();
  renderPosts();
  renderTasks();

  // header typing effect (small)
  const tagEl = document.querySelector(".tag");
  const types = [
    "Mahasiswa Teknologi Informasi",
    "Penulis Esai",
    "Calon Pengembang",
  ];
  let ti = 0,
    tj = 0;
  (function typeLoop() {
    const cur = types[ti];
    tagEl.textContent = cur.slice(0, ++tj);
    if (tj === cur.length) {
      ti = (ti + 1) % types.length;
      tj = 0;
      setTimeout(typeLoop, 900);
    } else setTimeout(typeLoop, 70);
  })();

  // PARTICLE BACKGROUND
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  let W, H;
  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  addEventListener("resize", resize);
  resize();
  const particles = [];
  for (let i = 0; i < 140; i++)
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.6 + 0.15,
      a: Math.random() * 0.6 + 0.12,
    });
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.y += p.vy;
      if (p.y > H + 10) {
        p.y = -10;
        p.x = Math.random() * W;
      }
      ctx.beginPath();
      const alpha = document.documentElement.classList.contains("dark")
        ? p.a
        : p.a * 0.9;
      ctx.fillStyle = document.documentElement.classList.contains("dark")
        ? "rgba(139,92,246," + alpha + ")"
        : "rgba(255,255,255," + alpha + ")";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  // keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "n") $("#addPost").click();
    if (e.key === "p") $("#addProject").click();
    if (e.key === "t") $("#taskTitle").focus();
  });

  // play sound for clickable elements
  document.addEventListener("click", (e) => {
    if (e.target.closest("button")) playClick();
  });
})();

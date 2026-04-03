/* ═══════════════════════════════════════════════════════════
   TOKEN MANAGER — app.js
   Dữ liệu lưu trong localStorage của trình duyệt.
   Bạn có thể sửa trực tiếp file này theo ý muốn.
═══════════════════════════════════════════════════════════ */

/* ── Translations (EN / VN) ─────────────────────────────── */
const LANG = {
  en: {
    appName: "Token Manager",         appSub: "Facebook token vault",
    addToken: "Add Token",            total: "Total Tokens",
    active: "Active",                 expired: "Expired",
    invalid: "Invalid",
    registry: "Token Registry",       registrySub: "Manage and monitor your Facebook tokens",
    search: "Search by FB ID...",     allStatus: "All status",
    deleteAll: "🗑 Delete all",
    colId: "ID",  colFbId: "FB ID",  colToken: "Token",  colCookie: "Cookie",
    colStatus: "Status",  colNote: "Note",  colCreated: "Created",  colActions: "Actions",
    loading: "Loading...",            noTokens: "No tokens found.",
    changeStatus: "Set status...",
    apply: "Apply",                   deleteSelected: "🗑 Delete selected",
    clear: "✕ Clear",
    selectedCount: n => `${n} selected`,
    addTokenTitle: "Add Token",       editTokenTitle: "Edit Token",
    manual: "Manual Input",           importFile: "Import File",
    fileFormat: "File format (CSV or TXT) — one token per line:",
    fileNote: "Delimiter: pipe (|) or comma (,) both supported",
    dropTitle: "Drag & drop or click to select",
    clearFile: "Clear",
    lbFbId: "FB ACCOUNT ID",         lbToken: "ACCESS TOKEN",
    lbCookie: "COOKIE",              lbCookieOpt: "(optional)",
    lbStatus: "STATUS",              lbNote: "NOTE",  lbNoteOpt: "(optional)",
    notePlaceholder: "Add a note...",
    cancel: "Cancel",                save: "Save changes",
    createBtn: "Add Token",
    sActive: "Active", sExpired: "Expired", sInvalid: "Invalid",
    selectStatus: "Select status",
    deleteTitle: "Delete Token",
    deleteDesc: id => `Are you sure you want to delete the token for FB ID "${id}"? This cannot be undone.`,
    bulkDeleteTitle: "Delete Selected",
    bulkDeleteDesc: n => `Delete ${n} token${n!==1?"s":""}? This cannot be undone.`,
    deleteAllTitle: "Delete All Tokens",
    deleteAllDesc: "This will permanently delete ALL tokens. This cannot be undone.",
    confirmBtn: "Delete",
    copiedToken: "Token copied",      copiedCookie: "Cookie copied",
    copiedDesc: "Copied to clipboard.",
    validCount: n => `${n} valid`,
    errorCount: n => `${n} error${n!==1?"s":""}`,
    importReady: n => `${n} token${n!==1?"s":""} ready to import`,
    importBtn: n => `Import ${n}`,
    toastCreated: "Token created",    toastCreatedDesc: "Added successfully.",
    toastUpdated: "Token updated",    toastUpdatedDesc: "Changes saved.",
    toastDeleted: "Token deleted",    toastDeletedDesc: "Token removed.",
    toastBulkStatus: "Status updated",toastBulkStatusDesc: n => `Updated ${n} token${n!==1?"s":""}`,
    toastBulkDeleted: "Tokens deleted",toastBulkDeletedDesc: n => `${n} token${n!==1?"s":""} deleted.`,
    toastDeleteAll: "All tokens deleted", toastDeleteAllDesc: "All tokens removed.",
    toastImported: "Import complete", toastImportedDesc: (ok, fail) => `${ok} imported${fail>0?`, ${fail} failed`:"."}.`,
    errFbId: "FB ID is required.",    errToken: "Token is required.",
    missingFbId: "Missing FB ID",     missingToken: "Missing token",
    // Pagination
    perPage: "Rows per page:",
    allRows: "All",
    pageInfo: (from, to, total) => `${from}–${to} of ${total}`,
    pagePrev: "‹",  pageNext: "›",
    pageFirst: "«", pageLast: "»",
    // Tabs
    tabTokens: "Tokens",
    tabSettings: "Settings",
    // Settings page
    settingsTitle: "Settings",
    settingsDesc: "Manage appearance, token rotation, and data.",
    sectionAppearance: "Appearance",
    sectionAppearanceDesc: "Language, theme and pagination defaults.",
    settingLang: "Language",
    settingLangDesc: "Switch display language",
    settingTheme: "Theme",
    settingThemeDesc: "Light or dark interface",
    themeLight: "Light",
    themeDark: "Dark",
    settingRows: "Default rows per page",
    settingRowsDesc: "Pagination default on load",
    // Token Rotation
    sectionRotation: "Token Rotation",
    sectionRotationDesc: "Configure how tokens are cycled.",
    rotConc: "Max concurrent tokens",
    rotConcDesc: "Max tokens running at the same time",
    rotCool: "Cooldown between tokens",
    rotCoolDesc: "Wait time before switching to next token",
    rotMode: "Rotation mode",
    rotModeDesc: "Strategy used to pick the next token",
    rotModeRound: "Round-robin",
    rotModeRandom: "Random",
    rotModePriority: "By status priority",
    rotReq: "Max requests per token",
    rotReqDesc: "Switch token after this many requests. 0 = unlimited.",
    rotSkip: "Skip invalid & expired tokens",
    rotSkipDesc: "Automatically skip tokens with bad status",
    rotMark: "Auto-mark failed tokens",
    rotMarkDesc: "Mark token as invalid when it returns an auth error",
    unlimited: "Unlimited",
    customDots: "Custom…",
    cooldown0s: "0s", cooldown10s: "10s", cooldown30s: "30s",
    cooldown1m: "1 min", cooldown5m: "5 min", cooldown10m: "10 min", cooldown30m: "30 min", cooldown1h: "1h",
    // Data Management
    dataTitle: "Data Management",
    dataDesc: "Export or back up your token data.",
    exportTitle: "Export as CSV",
    exportDesc: "Download all tokens as a CSV file",
    exportBtn: "Download CSV",
    rotSaved: "Settings saved",
    // Danger Zone
    dangerTitle: "Danger Zone",
    dangerDesc: "Irreversible actions. Be careful.",
    clearBtn: "Delete All Tokens",
    clearDesc: "Permanently remove all tokens. Cannot be undone.",
  },
  vi: {
    appName: "Quản lý Token",         appSub: "Kho lưu token Facebook",
    addToken: "Thêm Token",           total: "Tổng Token",
    active: "Hoạt động",              expired: "Hết hạn",
    invalid: "Không hợp lệ",
    registry: "Danh sách Token",      registrySub: "Quản lý và theo dõi token Facebook của bạn",
    search: "Tìm theo FB ID...",      allStatus: "Tất cả",
    deleteAll: "🗑 Xóa tất cả",
    colId: "ID",  colFbId: "FB ID",  colToken: "Token",  colCookie: "Cookie",
    colStatus: "Trạng thái",  colNote: "Ghi chú",  colCreated: "Ngày tạo",  colActions: "Thao tác",
    loading: "Đang tải...",           noTokens: "Không tìm thấy token nào.",
    changeStatus: "Đổi trạng thái...",
    apply: "Áp dụng",                 deleteSelected: "🗑 Xóa đã chọn",
    clear: "✕ Bỏ chọn",
    selectedCount: n => `Đã chọn ${n}`,
    addTokenTitle: "Thêm Token",      editTokenTitle: "Chỉnh sửa Token",
    manual: "Nhập thủ công",          importFile: "Nhập từ file",
    fileFormat: "Định dạng file (CSV hoặc TXT) — mỗi dòng 1 token:",
    fileNote: "Dấu phân cách: pipe (|) hoặc dấu phẩy (,) đều được",
    dropTitle: "Kéo thả hoặc click để chọn file",
    clearFile: "Xóa",
    lbFbId: "ID TÀI KHOẢN FB",       lbToken: "ACCESS TOKEN",
    lbCookie: "COOKIE",              lbCookieOpt: "(không bắt buộc)",
    lbStatus: "TRẠNG THÁI",          lbNote: "GHI CHÚ",  lbNoteOpt: "(không bắt buộc)",
    notePlaceholder: "Nhập ghi chú...",
    cancel: "Hủy",                   save: "Lưu thay đổi",
    createBtn: "Thêm Token",
    sActive: "Hoạt động", sExpired: "Hết hạn", sInvalid: "Không hợp lệ",
    selectStatus: "Chọn trạng thái",
    deleteTitle: "Xóa Token",
    deleteDesc: id => `Bạn có chắc muốn xóa token của FB ID "${id}"? Hành động này không thể hoàn tác.`,
    bulkDeleteTitle: "Xóa đã chọn",
    bulkDeleteDesc: n => `Xóa ${n} token đã chọn? Không thể hoàn tác.`,
    deleteAllTitle: "Xóa tất cả Token",
    deleteAllDesc: "Thao tác này sẽ xóa TOÀN BỘ token. Không thể hoàn tác.",
    confirmBtn: "Xóa",
    copiedToken: "Đã sao chép Token", copiedCookie: "Đã sao chép Cookie",
    copiedDesc: "Đã sao chép vào clipboard.",
    validCount: n => `${n} hợp lệ`,
    errorCount: n => `${n} lỗi`,
    importReady: n => `${n} token sẵn sàng nhập`,
    importBtn: n => `Nhập ${n}`,
    toastCreated: "Đã tạo token",     toastCreatedDesc: "Token đã được thêm.",
    toastUpdated: "Đã cập nhật",      toastUpdatedDesc: "Thay đổi đã được lưu.",
    toastDeleted: "Đã xóa token",     toastDeletedDesc: "Token đã bị xóa.",
    toastBulkStatus: "Đã cập nhật",   toastBulkStatusDesc: n => `Đã đổi trạng thái ${n} token.`,
    toastBulkDeleted: "Đã xóa",       toastBulkDeletedDesc: n => `Đã xóa ${n} token.`,
    toastDeleteAll: "Đã xóa tất cả",  toastDeleteAllDesc: "Tất cả token đã bị xóa.",
    toastImported: "Nhập hoàn tất",   toastImportedDesc: (ok, fail) => `Đã nhập ${ok} token${fail>0?`, ${fail} thất bại`:""}.`,
    errFbId: "FB ID không được để trống.", errToken: "Token không được để trống.",
    missingFbId: "Thiếu FB ID",        missingToken: "Thiếu token",
    // Pagination
    perPage: "Số dòng mỗi trang:",
    allRows: "Tất cả",
    pageInfo: (from, to, total) => `${from}–${to} / ${total}`,
    pagePrev: "‹",  pageNext: "›",
    pageFirst: "«", pageLast: "»",
    // Tabs
    tabTokens: "Tokens",
    tabSettings: "Cài đặt",
    // Settings page
    settingsTitle: "Cài đặt",
    settingsDesc: "Quản lý giao diện, xoay vòng token và dữ liệu.",
    sectionAppearance: "Giao diện",
    sectionAppearanceDesc: "Ngôn ngữ, chủ đề và phân trang mặc định.",
    settingLang: "Ngôn ngữ",
    settingLangDesc: "Chuyển đổi ngôn ngữ hiển thị",
    settingTheme: "Chủ đề",
    settingThemeDesc: "Giao diện sáng hoặc tối",
    themeLight: "Sáng",
    themeDark: "Tối",
    settingRows: "Số dòng mặc định mỗi trang",
    settingRowsDesc: "Phân trang mặc định khi mở",
    // Token Rotation
    sectionRotation: "Xoay vòng Token",
    sectionRotationDesc: "Cấu hình cách token được luân phiên.",
    rotConc: "Số token chạy đồng thời",
    rotConcDesc: "Giới hạn số token hoạt động cùng lúc",
    rotCool: "Thời gian nghỉ giữa các token",
    rotCoolDesc: "Thời gian chờ trước khi chuyển token tiếp theo",
    rotMode: "Kiểu xoay vòng",
    rotModeDesc: "Chiến lược chọn token tiếp theo",
    rotModeRound: "Tuần tự (Round-robin)",
    rotModeRandom: "Ngẫu nhiên",
    rotModePriority: "Theo trạng thái",
    rotReq: "Số request tối đa mỗi token",
    rotReqDesc: "Chuyển token sau số request này. 0 = không giới hạn.",
    rotSkip: "Bỏ qua token lỗi / hết hạn",
    rotSkipDesc: "Tự động bỏ qua token có trạng thái xấu",
    rotMark: "Tự động đánh dấu token thất bại",
    rotMarkDesc: "Đổi trạng thái thành không hợp lệ khi lỗi xác thực",
    unlimited: "Không giới hạn",
    customDots: "Tuỳ chỉnh…",
    cooldown0s: "0 giây", cooldown10s: "10 giây", cooldown30s: "30 giây",
    cooldown1m: "1 phút", cooldown5m: "5 phút", cooldown10m: "10 phút", cooldown30m: "30 phút", cooldown1h: "1 giờ",
    // Data Management
    dataTitle: "Quản lý dữ liệu",
    dataDesc: "Xuất hoặc sao lưu dữ liệu token.",
    exportTitle: "Xuất ra CSV",
    exportDesc: "Tải toàn bộ token xuống dạng file CSV",
    exportBtn: "Tải CSV",
    rotSaved: "Đã lưu cài đặt",
    // Danger Zone
    dangerTitle: "Vùng nguy hiểm",
    dangerDesc: "Các thao tác không thể hoàn tác. Cẩn thận.",
    clearBtn: "Xóa tất cả Token",
    clearDesc: "Xóa vĩnh viễn toàn bộ token. Không thể hoàn tác.",
  }
};

/* ── State ──────────────────────────────────────────────── */
let state = {
  lang: "en",
  theme: "light",
  tokens: [],          // Array of token objects
  nextId: 1,           // Auto-increment ID
  selectedIds: new Set(),
  editingId: null,
  parsedImport: [],    // Tokens parsed from file
  confirmCallback: null,
  // Pagination
  currentPage: 1,
  perPage: 25,         // 0 = show all
  // Active tab
  activeTab: "tokens",
  // Token Rotation config
  rotation: {
    maxConcurrent: "1",
    cooldownSec: "0",
    rotationMode: "round-robin",
    maxRequests: "0",
    skipInvalid: true,
    autoMark: true,
  },
};

/* ── LocalStorage ───────────────────────────────────────── */
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("tokenManager") || "{}");
    if (saved.lang)   state.lang   = saved.lang;
    if (saved.theme)  state.theme  = saved.theme;
    if (Array.isArray(saved.tokens)) state.tokens = saved.tokens;
    if (saved.nextId) state.nextId = saved.nextId;
    if (saved.perPage !== undefined) state.perPage = Number(saved.perPage);
    if (saved.rotation) state.rotation = { ...state.rotation, ...saved.rotation };
  } catch (_) {}
}

function saveState() {
  localStorage.setItem("tokenManager", JSON.stringify({
    lang: state.lang,
    theme: state.theme,
    tokens: state.tokens,
    nextId: state.nextId,
    perPage: state.perPage,
    rotation: state.rotation,
  }));
}

const t = () => LANG[state.lang];

/* ── Theme ──────────────────────────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.getElementById("btn-theme").innerHTML = state.theme === "dark" ? "&#9728;" : "&#9790;";
}
function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  applyTheme(); saveState();
}

/* ── Language ───────────────────────────────────────────── */
function applyLang() {
  const T = t();
  document.getElementById("txt-appName").textContent    = T.appName;
  document.getElementById("txt-appSub").textContent     = T.appSub;
  document.getElementById("txt-addToken").textContent   = "+ " + T.addToken;
  document.getElementById("txt-total").textContent      = T.total;
  document.getElementById("txt-active").textContent     = T.active;
  document.getElementById("txt-expired").textContent    = T.expired;
  document.getElementById("txt-invalid").textContent    = T.invalid;
  document.getElementById("txt-registry").textContent   = T.registry;
  document.getElementById("txt-registrySub").textContent= T.registrySub;
  document.getElementById("search-input").placeholder   = T.search;
  document.getElementById("txt-deleteAll").innerHTML    = T.deleteAll;
  document.getElementById("col-id").textContent         = T.colId;
  document.getElementById("col-fbid").textContent       = T.colFbId;
  document.getElementById("col-token").textContent      = T.colToken;
  document.getElementById("col-cookie").textContent     = T.colCookie;
  document.getElementById("col-status").textContent     = T.colStatus;
  document.getElementById("col-note").textContent       = T.colNote;
  document.getElementById("col-created").textContent    = T.colCreated;
  document.getElementById("col-actions").textContent    = T.colActions;
  document.getElementById("opt-all").textContent        = T.allStatus;
  document.getElementById("opt-active").textContent     = T.active;
  document.getElementById("opt-expired").textContent    = T.expired;
  document.getElementById("opt-invalid").textContent    = T.invalid;
  document.getElementById("txt-apply").textContent      = T.apply;
  document.getElementById("txt-deleteSelected").innerHTML = T.deleteSelected;
  document.getElementById("txt-clear").innerHTML        = T.clear;
  document.getElementById("opt-changeStatus").textContent = T.changeStatus;
  document.getElementById("bopt-active").textContent   = T.sActive;
  document.getElementById("bopt-expired").textContent  = T.sExpired;
  document.getElementById("bopt-invalid").textContent  = T.sInvalid;
  document.getElementById("tab-manual").textContent     = T.manual;
  document.getElementById("tab-file").textContent       = T.importFile;
  document.getElementById("txt-fileFormat").textContent = T.fileFormat;
  document.getElementById("txt-fileNote").textContent   = T.fileNote;
  document.getElementById("txt-dropTitle").textContent  = T.dropTitle;
  document.getElementById("txt-clearFile").textContent  = T.clearFile;
  document.getElementById("lbl-fbId").innerHTML         = T.lbFbId;
  document.getElementById("lbl-token").innerHTML        = T.lbToken;
  document.getElementById("lbl-cookie").innerHTML       = T.lbCookie + ' <span class="label-opt">' + T.lbCookieOpt + "</span>";
  document.getElementById("lbl-status").textContent     = T.lbStatus;
  document.getElementById("lbl-note").innerHTML         = T.lbNote + ' <span class="label-opt">' + T.lbNoteOpt + "</span>";
  document.getElementById("inp-note").placeholder       = T.notePlaceholder;
  document.getElementById("sopt-active").textContent   = T.sActive;
  document.getElementById("sopt-expired").textContent  = T.sExpired;
  document.getElementById("sopt-invalid").textContent  = T.sInvalid;
  document.getElementById("txt-perPage").textContent   = T.perPage;
  document.getElementById("opt-all-rows").textContent  = T.allRows;

  if (state.lang === "en") {
    document.getElementById("lang-en").className = "lang-active";
    document.getElementById("lang-vi").className = "lang-dim";
  } else {
    document.getElementById("lang-en").className = "lang-dim";
    document.getElementById("lang-vi").className = "lang-active";
  }

  // Tab labels
  setText("txt-tabTokens", T.tabTokens);
  setText("txt-tabSettings", T.tabSettings);
  // Settings page
  setText("s-txt-title", T.settingsTitle);
  setText("s-txt-desc", T.settingsDesc);
  setText("s-txt-appearance", T.sectionAppearance);
  setText("s-txt-appearanceDesc", T.sectionAppearanceDesc);
  setText("s-txt-lang", T.settingLang);
  setText("s-txt-langDesc", T.settingLangDesc);
  setText("s-txt-theme", T.settingTheme);
  setText("s-txt-themeDesc", T.settingThemeDesc);
  setText("s-txt-light", T.themeLight);
  setText("s-txt-dark", T.themeDark);
  setText("s-txt-rows", T.settingRows);
  setText("s-txt-rowsDesc", T.settingRowsDesc);
  setText("s-txt-allRows", T.allRows);
  // Rotation
  setText("s-txt-rotation", T.sectionRotation);
  setText("s-txt-rotationDesc", T.sectionRotationDesc);
  setText("s-txt-rotConc", T.rotConc);
  setText("s-txt-rotConcDesc", T.rotConcDesc);
  setText("s-txt-rotCool", T.rotCool);
  setText("s-txt-rotCoolDesc", T.rotCoolDesc);
  setText("s-txt-rotMode", T.rotMode);
  setText("s-txt-rotModeDesc", T.rotModeDesc);
  setText("s-txt-modeRound", T.rotModeRound);
  setText("s-txt-modeRandom", T.rotModeRandom);
  setText("s-txt-modePriority", T.rotModePriority);
  setText("s-txt-rotReq", T.rotReq);
  setText("s-txt-rotReqDesc", T.rotReqDesc);
  setText("s-txt-rotSkip", T.rotSkip);
  setText("s-txt-rotSkipDesc", T.rotSkipDesc);
  setText("s-txt-rotMark", T.rotMark);
  setText("s-txt-rotMarkDesc", T.rotMarkDesc);
  // Cooldown option labels
  setText("s-txt-0s", T.cooldown0s);
  setText("s-txt-10s", T.cooldown10s);
  setText("s-txt-30s", T.cooldown30s);
  setText("s-txt-1m", T.cooldown1m);
  setText("s-txt-5m", T.cooldown5m);
  setText("s-txt-10m", T.cooldown10m);
  setText("s-txt-30m", T.cooldown30m);
  setText("s-txt-1h", T.cooldown1h);
  // Unlimited options
  setText("s-txt-unlimited", T.unlimited);
  setText("s-txt-unlim2", T.unlimited);
  setText("s-txt-custom1", T.customDots);
  setText("s-txt-custom2", T.customDots);
  setText("s-txt-custom3", T.customDots);
  // Data / Danger
  setText("s-txt-dataTitle", T.dataTitle);
  setText("s-txt-dataDesc", T.dataDesc);
  setText("s-txt-exportTitle", T.exportTitle);
  setText("s-txt-exportDesc", T.exportDesc);
  setText("s-txt-exportBtn", T.exportBtn);
  setText("s-txt-dangerTitle", T.dangerTitle);
  setText("s-txt-dangerDesc", T.dangerDesc);
  setText("s-txt-clearBtn", T.clearBtn);
  setText("s-txt-clearDesc", T.clearDesc);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function toggleLang() {
  state.lang = state.lang === "en" ? "vi" : "en";
  applyLang(); renderTable(); saveState();
}

/* ── Stats ──────────────────────────────────────────────── */
function renderStats() {
  const total   = state.tokens.length;
  const active  = state.tokens.filter(tk => tk.status === "active").length;
  const expired = state.tokens.filter(tk => tk.status === "expired").length;
  const invalid = state.tokens.filter(tk => tk.status === "invalid").length;
  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-active").textContent  = active;
  document.getElementById("stat-expired").textContent = expired;
  document.getElementById("stat-invalid").textContent = invalid;
}

/* ── Helpers ─────────────────────────────────────────────── */
function getStatusLabel(status) {
  const T = t();
  if (status === "active") return T.sActive;
  if (status === "expired") return T.sExpired;
  return T.sInvalid;
}
function statusBadge(status) {
  return `<span class="badge badge-${status}">${getStatusLabel(status)}</span>`;
}
function copyCell(value, type) {
  if (!value) return `<span class="dash">—</span>`;
  const short = value.length > 16 ? value.slice(0, 16) + "…" : value;
  const escaped = value.replace(/\\/g,"\\\\").replace(/'/g, "\\'");
  return `<span class="copy-cell" onclick="copyText('${escaped}','${type}')">
    <span class="copy-val">${short}</span>
    <span class="copy-icon">&#10697;</span>
  </span>`;
}
function escHtml(str) {
  return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Table + Pagination ─────────────────────────────────── */
function resetPage() { state.currentPage = 1; }

function renderTable() {
  const T = t();
  const search = document.getElementById("search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;

  // Filter
  const filtered = state.tokens.filter(tk => {
    if (search && !tk.fbId.toLowerCase().includes(search)) return false;
    if (statusFilter !== "all" && tk.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const perPage = state.perPage; // 0 = all

  // Clamp currentPage
  const totalPages = perPage === 0 ? 1 : Math.max(1, Math.ceil(total / perPage));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  if (state.currentPage < 1) state.currentPage = 1;

  // Slice for current page
  let paged;
  if (perPage === 0 || total === 0) {
    paged = filtered;
  } else {
    const start = (state.currentPage - 1) * perPage;
    paged = filtered.slice(start, start + perPage);
  }

  const tbody = document.getElementById("table-body");

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">${T.noTokens}</td></tr>`;
  } else {
    tbody.innerHTML = paged.map(tk => {
      const sel = state.selectedIds.has(tk.id);
      const created = new Date(tk.createdAt).toLocaleString("sv-SE").slice(0, 16);
      const note = tk.note ? `<span class="truncate">${escHtml(tk.note)}</span>` : `<span class="dash">—</span>`;
      return `<tr class="${sel ? "selected" : ""}" data-id="${tk.id}">
        <td><input type="checkbox" onchange="toggleRow(${tk.id},this)" ${sel ? "checked" : ""} /></td>
        <td class="mono" style="color:var(--text-muted);font-size:12px">${tk.id}</td>
        <td><strong class="mono" style="font-size:13px">${escHtml(tk.fbId)}</strong></td>
        <td>${copyCell(tk.token, "token-" + tk.id)}</td>
        <td>${copyCell(tk.cookie, "cookie-" + tk.id)}</td>
        <td>${statusBadge(tk.status)}</td>
        <td style="max-width:140px">${note}</td>
        <td class="mono" style="font-size:11px;color:var(--text-muted);white-space:nowrap">${created}</td>
        <td>
          <div class="actions">
            <button class="icon-btn" onclick="openEditModal(${tk.id})">&#9998;</button>
            <button class="icon-btn danger" onclick="confirmDeleteOne(${tk.id})">&#128465;</button>
          </div>
        </td>
      </tr>`;
    }).join("");
  }

  renderPagination(total, totalPages);
  updateBulkBar();
  updateSelectAllCheckbox(filtered);

  // Sync per-page dropdown
  document.getElementById("per-page-select").value = String(perPage);
}

/* ── Pagination rendering ───────────────────────────────── */
function renderPagination(total, totalPages) {
  const T = t();
  const perPage = state.perPage;
  const page    = state.currentPage;
  const bar     = document.getElementById("pagination-bar");

  if (total === 0) { bar.style.display = "none"; return; }
  bar.style.display = "flex";

  // Info text
  const from = perPage === 0 ? 1 : Math.min((page - 1) * perPage + 1, total);
  const to   = perPage === 0 ? total : Math.min(page * perPage, total);
  document.getElementById("pagination-info").textContent = T.pageInfo(from, to, total);

  // Page buttons
  if (perPage === 0 || totalPages <= 1) {
    document.getElementById("page-nav").innerHTML = "";
    return;
  }

  // Show: « ‹ [pages] › »
  // Sliding window: show at most 5 page numbers
  let pages = [];
  const WINDOW = 2; // pages around current
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - WINDOW && i <= page + WINDOW)) {
      pages.push(i);
    }
  }
  // Insert ellipsis gaps
  let navHtml = "";
  navHtml += pageBtn(T.pageFirst, 1, page === 1, "page-first");
  navHtml += pageBtn(T.pagePrev,  page - 1, page === 1, "page-prev");

  let prev = 0;
  for (const p of pages) {
    if (prev && p - prev > 1) navHtml += `<span class="page-ellipsis">…</span>`;
    navHtml += `<button class="page-num ${p === page ? "active" : ""}" onclick="goToPage(${p})">${p}</button>`;
    prev = p;
  }

  navHtml += pageBtn(T.pageNext, page + 1, page === totalPages, "page-next");
  navHtml += pageBtn(T.pageLast, totalPages, page === totalPages, "page-last");

  document.getElementById("page-nav").innerHTML = navHtml;
}

function pageBtn(label, target, disabled, cls) {
  return `<button class="page-num ${cls} ${disabled ? "disabled" : ""}" onclick="${disabled ? "" : "goToPage(" + target + ")"}">${label}</button>`;
}

function goToPage(page) {
  state.currentPage = page;
  renderTable();
}

function changePerPage(value) {
  state.perPage = Number(value);
  state.currentPage = 1;
  saveState();
  renderTable();
}

/* ── Selection ──────────────────────────────────────────── */
function toggleRow(id, checkbox) {
  if (checkbox.checked) state.selectedIds.add(id);
  else state.selectedIds.delete(id);
  const row = checkbox.closest("tr");
  row.classList.toggle("selected", checkbox.checked);
  updateBulkBar();
  const search = document.getElementById("search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;
  const filtered = state.tokens.filter(tk => {
    if (search && !tk.fbId.toLowerCase().includes(search)) return false;
    if (statusFilter !== "all" && tk.status !== statusFilter) return false;
    return true;
  });
  updateSelectAllCheckbox(filtered);
}

function toggleSelectAll(masterChk) {
  const search = document.getElementById("search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;
  const visible = state.tokens.filter(tk => {
    if (search && !tk.fbId.toLowerCase().includes(search)) return false;
    if (statusFilter !== "all" && tk.status !== statusFilter) return false;
    return true;
  });
  visible.forEach(tk => {
    if (masterChk.checked) state.selectedIds.add(tk.id);
    else state.selectedIds.delete(tk.id);
  });
  renderTable();
}

function clearSelection() {
  state.selectedIds.clear();
  renderTable();
}

function updateSelectAllCheckbox(filtered) {
  const chkAll = document.getElementById("chk-all");
  if (!chkAll || !filtered) return;
  const allSel  = filtered.length > 0 && filtered.every(tk => state.selectedIds.has(tk.id));
  const someSel = filtered.some(tk => state.selectedIds.has(tk.id));
  chkAll.checked       = allSel;
  chkAll.indeterminate = someSel && !allSel;
}

function updateBulkBar() {
  const T = t();
  const count = state.selectedIds.size;
  const bar   = document.getElementById("bulk-bar");
  bar.style.display = count > 0 ? "flex" : "none";
  document.getElementById("bulk-count").textContent = T.selectedCount(count);
  document.getElementById("bulk-status-select").value = "";
}

/* ── Bulk Operations ────────────────────────────────────── */
function applyBulkStatus() {
  const status = document.getElementById("bulk-status-select").value;
  if (!status) return;
  const T = t();
  state.tokens.forEach(tk => { if (state.selectedIds.has(tk.id)) tk.status = status; });
  const count = state.selectedIds.size;
  state.selectedIds.clear();
  saveState(); renderStats(); renderTable();
  showToast(T.toastBulkStatus, T.toastBulkStatusDesc(count));
}

function confirmBulkDelete() {
  const T = t();
  const count = state.selectedIds.size;
  openConfirm(T.bulkDeleteTitle, T.bulkDeleteDesc(count), () => {
    state.tokens = state.tokens.filter(tk => !state.selectedIds.has(tk.id));
    state.selectedIds.clear();
    saveState(); renderStats(); resetPage(); renderTable();
    showToast(T.toastBulkDeleted, T.toastBulkDeletedDesc(count), false);
  });
}

function confirmDeleteAll() {
  const T = t();
  openConfirm(T.deleteAllTitle, T.deleteAllDesc, () => {
    state.tokens = []; state.selectedIds.clear();
    saveState(); renderStats(); resetPage(); renderTable();
    showToast(T.toastDeleteAll, T.toastDeleteAllDesc, false);
  });
}

function confirmDeleteOne(id) {
  const T = t();
  const tk = state.tokens.find(t => t.id === id);
  if (!tk) return;
  openConfirm(T.deleteTitle, T.deleteDesc(tk.fbId), () => {
    state.tokens = state.tokens.filter(t => t.id !== id);
    state.selectedIds.delete(id);
    saveState(); renderStats(); renderTable();
    showToast(T.toastDeleted, T.toastDeletedDesc, false);
  });
}

/* ── Confirm Modal ──────────────────────────────────────── */
function openConfirm(title, desc, callback) {
  const T = t();
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-desc").textContent  = desc;
  document.getElementById("btn-confirmOk").textContent = T.confirmBtn;
  document.getElementById("btn-confirmCancel").textContent = T.cancel;
  state.confirmCallback = callback;
  openModal("modal-confirm");
}
function confirmAction() {
  if (state.confirmCallback) { state.confirmCallback(); state.confirmCallback = null; }
  closeModal("modal-confirm");
}

/* ── Add / Edit Modal ───────────────────────────────────── */
function openAddModal() {
  const T = t();
  state.editingId = null;
  document.getElementById("modal-form-title").textContent = T.addTokenTitle;
  document.getElementById("form-tabs").style.display      = "flex";
  document.getElementById("btn-save").textContent         = T.createBtn;
  document.getElementById("btn-cancel").textContent       = T.cancel;
  clearForm(); switchTab("manual"); openModal("modal-form");
}

function openEditModal(id) {
  const T = t();
  const tk = state.tokens.find(t => t.id === id);
  if (!tk) return;
  state.editingId = id;
  document.getElementById("modal-form-title").textContent = T.editTokenTitle;
  document.getElementById("form-tabs").style.display      = "none";
  document.getElementById("btn-save").textContent         = T.save;
  document.getElementById("btn-cancel").textContent       = T.cancel;
  document.getElementById("inp-fbId").value    = tk.fbId;
  document.getElementById("inp-token").value   = tk.token;
  document.getElementById("inp-cookie").value  = tk.cookie || "";
  document.getElementById("inp-status").value  = tk.status;
  document.getElementById("inp-note").value    = tk.note || "";
  clearErrors(); showPanel("manual"); openModal("modal-form");
}

function clearForm() {
  document.getElementById("inp-fbId").value   = "";
  document.getElementById("inp-token").value  = "";
  document.getElementById("inp-cookie").value = "";
  document.getElementById("inp-status").value = "active";
  document.getElementById("inp-note").value   = "";
  clearErrors();
}
function clearErrors() {
  document.getElementById("err-fbId").textContent  = "";
  document.getElementById("err-token").textContent = "";
}

function saveToken() {
  const T = t();
  const fbId   = document.getElementById("inp-fbId").value.trim();
  const token  = document.getElementById("inp-token").value.trim();
  const cookie = document.getElementById("inp-cookie").value.trim();
  const status = document.getElementById("inp-status").value;
  const note   = document.getElementById("inp-note").value.trim();

  clearErrors();
  let valid = true;
  if (!fbId)  { document.getElementById("err-fbId").textContent  = T.errFbId;  valid = false; }
  if (!token) { document.getElementById("err-token").textContent = T.errToken; valid = false; }
  if (!valid) return;

  if (state.editingId !== null) {
    const tk = state.tokens.find(t => t.id === state.editingId);
    if (tk) { tk.fbId = fbId; tk.token = token; tk.cookie = cookie || null; tk.status = status; tk.note = note || null; tk.updatedAt = new Date().toISOString(); }
    showToast(T.toastUpdated, T.toastUpdatedDesc);
  } else {
    state.tokens.push({ id: state.nextId++, fbId, token, cookie: cookie || null, status, note: note || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    showToast(T.toastCreated, T.toastCreatedDesc);
  }

  saveState(); renderStats(); renderTable(); closeModal("modal-form");
}

/* ── Tabs ─────────────────────────────────────────────────── */
function switchTab(name) {
  document.getElementById("tab-manual").classList.toggle("active", name === "manual");
  document.getElementById("tab-file").classList.toggle("active", name === "file");
  showPanel(name);
}
function showPanel(name) {
  document.getElementById("panel-manual").style.display = name === "manual" ? "block" : "none";
  document.getElementById("panel-file").style.display   = name === "file"   ? "block" : "none";
}

/* ── File Import ────────────────────────────────────────── */
const VALID_STATUSES = ["active", "expired", "invalid"];

function parseFile(content) {
  const T = t();
  return content.split(/\r?\n/).map(l => l.trim()).filter(l => l).map(line => {
    const delim = line.includes("|") ? "|" : ",";
    const parts = line.split(delim).map(p => p.trim());
    const [fbId="", token="", cookieOrStatus="", statusOrNote="", ...rest] = parts;
    let cookie = "", status = "active", note = "";
    if (VALID_STATUSES.includes(cookieOrStatus.toLowerCase())) {
      status = cookieOrStatus.toLowerCase();
      note   = [statusOrNote, ...rest].join(delim).trim();
    } else {
      cookie = cookieOrStatus;
      if (VALID_STATUSES.includes(statusOrNote.toLowerCase())) status = statusOrNote.toLowerCase();
      note   = rest.join(delim).trim();
    }
    let error = null;
    if (!fbId)  error = T.missingFbId;
    else if (!token) error = T.missingToken;
    return { fbId, token, cookie, status, note, error };
  });
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
}
function handleFileSelect(e) { const file = e.target.files[0]; if (file) readFile(file); }
function readFile(file) {
  const reader = new FileReader();
  reader.onload = ev => { state.parsedImport = parseFile(ev.target.result); renderPreview(file.name); };
  reader.readAsText(file);
}

function renderPreview(filename) {
  const T = t();
  const valid  = state.parsedImport.filter(p => !p.error);
  const errors = state.parsedImport.filter(p => p.error);
  document.getElementById("preview-filename").textContent = filename;
  document.getElementById("preview-valid").textContent    = T.validCount(valid.length);
  document.getElementById("preview-error").textContent    = errors.length > 0 ? T.errorCount(errors.length) : "";
  document.getElementById("txt-importReady").textContent  = T.importReady(valid.length);
  document.getElementById("btn-import").textContent       = T.importBtn(valid.length);
  document.getElementById("btn-cancelImport").textContent = T.cancel;
  document.getElementById("preview-body").innerHTML = state.parsedImport.map((p, i) =>
    `<tr class="${p.error ? "error-row" : ""}">
      <td>${p.error ? `<span class="error-text">${p.error}</span>` : escHtml(p.fbId)}</td>
      <td>${p.token ? p.token.slice(0,16)+"…" : "-"}</td>
      <td>${p.cookie ? p.cookie.slice(0,14)+"…" : '<span class="dash">-</span>'}</td>
      <td>${!p.error ? `<select class="select select-sm" onchange="state.parsedImport[${i}].status=this.value" style="min-width:80px">
        <option value="active"${p.status==="active"?" selected":""}>active</option>
        <option value="expired"${p.status==="expired"?" selected":""}>expired</option>
        <option value="invalid"${p.status==="invalid"?" selected":""}>invalid</option>
      </select>` : ""}</td>
    </tr>`
  ).join("");
  document.getElementById("dropzone").style.display     = "none";
  document.getElementById("file-preview").style.display = "block";
}

function clearFile() {
  state.parsedImport = [];
  document.getElementById("file-input").value = "";
  document.getElementById("dropzone").style.display     = "block";
  document.getElementById("file-preview").style.display = "none";
}

function importTokens() {
  const T = t();
  const valid = state.parsedImport.filter(p => !p.error);
  if (!valid.length) return;
  valid.forEach(p => {
    state.tokens.push({ id: state.nextId++, fbId: p.fbId, token: p.token, cookie: p.cookie || null, status: p.status, note: p.note || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });
  saveState(); renderStats(); resetPage(); renderTable(); closeModal("modal-form"); clearFile();
  showToast(T.toastImported, T.toastImportedDesc(valid.length, 0));
}

/* ── Copy to clipboard ──────────────────────────────────── */
function copyText(value, type) {
  const T = t();
  navigator.clipboard.writeText(value).then(() => {
    showToast(type.startsWith("token-") ? T.copiedToken : T.copiedCookie, T.copiedDesc);
  });
}

/* ── Modal helpers ──────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add("open"); }
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  if (id === "modal-form") { clearFile(); state.editingId = null; state.parsedImport = []; }
}
function closeIfBackdrop(event, id) {
  if (event.target === document.getElementById(id)) closeModal(id);
}

/* ── Toast ──────────────────────────────────────────────── */
function showToast(title, desc, success = true) {
  const el = document.createElement("div");
  el.className = "toast " + (success ? "toast-success" : "toast-error");
  el.innerHTML = `<div class="toast-title">${escHtml(title)}</div><div class="toast-desc">${escHtml(desc)}</div>`;
  document.getElementById("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ── Tab switching ──────────────────────────────────────── */
function switchMainTab(tab) {
  state.activeTab = tab;
  const isTokens = tab === "tokens";
  document.getElementById("tab-tokens-panel").style.display   = isTokens ? "" : "none";
  document.getElementById("tab-settings-panel").style.display = isTokens ? "none" : "";
  document.getElementById("btn-add-token").style.display      = isTokens ? "" : "none";
  document.getElementById("tab-btn-tokens").classList.toggle("active", isTokens);
  document.getElementById("tab-btn-settings").classList.toggle("active", !isTokens);
  if (!isTokens) applySettingsPanel();
}

/* ── Settings panel sync ────────────────────────────────── */
function applySettingsPanel() {
  const rot = state.rotation;
  // Language buttons
  document.getElementById("s-lang-en").classList.toggle("active", state.lang === "en");
  document.getElementById("s-lang-vi").classList.toggle("active", state.lang === "vi");
  // Theme buttons
  document.getElementById("s-theme-light").classList.toggle("active", state.theme === "light");
  document.getElementById("s-theme-dark").classList.toggle("active", state.theme === "dark");
  // Rows per page
  document.getElementById("s-rows-select").value = String(state.perPage);
  // Rotation selects – sync each, handle custom values
  syncRotSelect("s-rot-concurrent", rot.maxConcurrent);
  syncRotSelect("s-rot-cooldown",   rot.cooldownSec);
  syncRotSelect("s-rot-mode",       rot.rotationMode);
  syncRotSelect("s-rot-maxreq",     rot.maxRequests);
  // Switches
  applySwitchState("s-rot-skipInvalid", rot.skipInvalid);
  applySwitchState("s-rot-autoMark",    rot.autoMark);
}

function syncRotSelect(selectId, value) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const options = Array.from(sel.options).map(o => o.value).filter(v => v !== "__custom__");
  if (options.includes(value)) {
    sel.value = value;
    const customWrap = document.getElementById(selectId + "-custom");
    if (customWrap) customWrap.style.display = "none";
  } else {
    // Custom value – show the input
    sel.value = "__custom__";
    const customWrap = document.getElementById(selectId + "-custom");
    if (customWrap) {
      customWrap.style.display = "flex";
      const inp = document.getElementById(selectId + "-input");
      if (inp) inp.value = value;
    }
  }
}

function applySwitchState(id, on) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.toggle("on", on);
  btn.setAttribute("aria-checked", String(on));
}

/* ── Settings: Appearance ───────────────────────────────── */
function setLang(lang) {
  state.lang = lang;
  applyLang(); renderTable(); saveState();
  applySettingsPanel();
}

function setTheme(theme) {
  state.theme = theme;
  applyTheme(); saveState();
  applySettingsPanel();
}

function setDefaultRows(value) {
  state.perPage = Number(value);
  document.getElementById("per-page-select").value = value;
  saveState();
}

/* ── Settings: Token Rotation ───────────────────────────── */
function setRotation(field, value) {
  state.rotation[field] = value;
  saveState();
  showToast(t().rotSaved, "");
}

function toggleRotation(field) {
  state.rotation[field] = !state.rotation[field];
  applySwitchState("s-rot-" + (field === "skipInvalid" ? "skipInvalid" : "autoMark"), state.rotation[field]);
  saveState();
  showToast(t().rotSaved, "");
}

function handleRotSelect(field, selectId, value) {
  if (value === "__custom__") {
    const wrap = document.getElementById(selectId + "-custom");
    if (wrap) { wrap.style.display = "flex"; }
    const inp = document.getElementById(selectId + "-input");
    if (inp) { inp.value = state.rotation[field]; inp.focus(); inp.select(); }
  } else {
    const wrap = document.getElementById(selectId + "-custom");
    if (wrap) wrap.style.display = "none";
    setRotation(field, value);
  }
}

function commitRotCustom(field, selectId) {
  const inp = document.getElementById(selectId + "-input");
  if (!inp) return;
  const n = parseInt(inp.value, 10);
  if (!isNaN(n) && n >= 0) {
    setRotation(field, String(n));
    const wrap = document.getElementById(selectId + "-custom");
    if (wrap) wrap.style.display = "none";
    syncRotSelect(selectId, String(n));
  } else {
    inp.value = state.rotation[field];
  }
}

function cancelRotCustom(selectId) {
  const field = selectId === "s-rot-concurrent" ? "maxConcurrent"
    : selectId === "s-rot-cooldown" ? "cooldownSec"
    : selectId === "s-rot-maxreq"   ? "maxRequests" : "";
  const wrap = document.getElementById(selectId + "-custom");
  if (wrap) wrap.style.display = "none";
  syncRotSelect(selectId, state.rotation[field] || "0");
}

/* ── Settings: Export CSV ───────────────────────────────── */
function exportCsv() {
  const T = t();
  const header = "ID,FB ID,Token,Cookie,Status,Note,Created At";
  const rows = state.tokens.map(tk =>
    [tk.id, `"${(tk.fbId||"").replace(/"/g,'""')}"`, `"${(tk.token||"").replace(/"/g,'""')}"`,
     `"${(tk.cookie||"").replace(/"/g,'""')}"`, tk.status,
     `"${(tk.note||"").replace(/"/g,'""')}"`, tk.createdAt].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokens_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(T.exportTitle, `${state.tokens.length} tokens exported.`);
}

/* ── Init ───────────────────────────────────────────────── */
function init() {
  loadState();
  applyTheme();
  applyLang();
  // Sync per-page dropdown to loaded value
  document.getElementById("per-page-select").value = String(state.perPage);
  // Reset page on search/filter change
  document.getElementById("search-input").addEventListener("input", () => { resetPage(); renderTable(); });
  document.getElementById("status-filter").addEventListener("change", () => { resetPage(); renderTable(); });
  renderStats();
  renderTable();
}

init();

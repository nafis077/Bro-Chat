export type Lang = "en" | "vi";

export const translations = {
  en: {
    appName: "Token Manager",
    appSubtitle: "Facebook token vault",
    addToken: "Add Token",

    totalTokens: "Total Tokens",
    active: "Active",
    expired: "Expired",
    invalid: "Invalid",

    tokenRegistry: "Token Registry",
    tokenRegistryDesc: "Manage and monitor your Facebook tokens",
    searchPlaceholder: "Search by FB ID...",
    allStatus: "All status",

    colId: "ID",
    colFbId: "FB ID",
    colToken: "Token",
    colCookie: "Cookie",
    colStatus: "Status",
    colNote: "Note",
    colCreated: "Created",
    colActions: "Actions",

    loading: "Loading tokens...",
    noTokens: "No tokens found.",

    copiedToken: "Token copied",
    copiedCookie: "Cookie copied",
    copiedDesc: "Copied to clipboard.",

    editToken: "Edit Token",
    editTokenDesc: "Modify token details below.",
    newToken: "Add Token",
    newTokenDesc: "Enter details manually or import from a file.",

    manualInput: "Manual Input",
    importFile: "Import File",

    fileFormatTitle: "File format (CSV or TXT) — one token per line:",
    fileFormatFull: "id | token | cookie | status | note",
    fileFormatNoCookie: "id | token | cookie  (default status: active)",
    fileFormatMinimal: "id | token  (no cookie)",
    fileFormatNote: "Delimiter: pipe (|) or comma (,) both supported",

    dropZoneTitle: "Drag & drop file or click to select",
    dropZoneHint: ".csv or .txt",

    validCount: (n: number) => `${n} valid`,
    errorCount: (n: number) => `${n} error${n !== 1 ? "s" : ""}`,
    clearFile: "Clear",

    readyToImport: (n: number) => `${n} token${n !== 1 ? "s" : ""} ready to import`,
    cancel: "Cancel",
    importBtn: (n: number) => `Import ${n} Token${n !== 1 ? "s" : ""}`,

    labelFbId: "FB Account ID",
    labelToken: "Access Token",
    labelCookie: "Cookie",
    labelCookieOptional: "(optional)",
    labelStatus: "Status",
    labelNote: "Note",
    labelNoteOptional: "(optional)",
    placeholderNote: "Add a note...",

    save: "Save changes",
    createBtn: "Add Token",

    statusActive: "Active",
    statusExpired: "Expired",
    statusInvalid: "Invalid",
    selectStatus: "Select status",

    deleteTitle: "Delete Token",
    deleteConfirm: (fbId: string) =>
      `Are you sure you want to delete the token for FB ID ${fbId}? This action cannot be undone.`,
    deleteCancel: "Cancel",
    deleteBtn: "Delete",
    deleting: "Deleting...",

    // Bulk operations
    selectedCount: (n: number) => `${n} selected`,
    clearSelection: "Clear",
    bulkChangeStatus: "Set status",
    bulkDeleteSelected: "Delete selected",
    bulkDeleteAll: "Delete all",

    bulkStatusTitle: "Change Status",
    bulkStatusDesc: (n: number) => `Change status for ${n} selected token${n !== 1 ? "s" : ""}`,
    bulkDeleteTitle: "Delete Selected",
    bulkDeleteDesc: (n: number) =>
      `Delete ${n} selected token${n !== 1 ? "s" : ""}? This cannot be undone.`,
    bulkDeleteAllTitle: "Delete All Tokens",
    bulkDeleteAllDesc: "This will permanently delete ALL tokens in the system. This cannot be undone.",
    confirmDelete: "Delete",
    applying: "Applying...",

    toastBulkStatusUpdated: "Status updated",
    toastBulkStatusUpdatedDesc: (n: number) => `Updated status for ${n} token${n !== 1 ? "s" : ""}.`,
    toastBulkDeleted: "Tokens deleted",
    toastBulkDeletedDesc: (n: number) => `${n} token${n !== 1 ? "s" : ""} deleted.`,
    toastDeleteAll: "All tokens deleted",
    toastDeleteAllDesc: "All tokens have been removed.",
    toastBulkError: "Operation failed",
    toastBulkErrorDesc: "An error occurred. Please try again.",

    toastCreated: "Token created",
    toastCreatedDesc: "Token has been added successfully.",
    toastCreateError: "Error creating token",
    toastCreateErrorDesc: "Please check your inputs and try again.",
    toastUpdated: "Token updated",
    toastUpdatedDesc: "Changes have been saved.",
    toastUpdateError: "Error updating token",
    toastUpdateErrorDesc: "Please try again.",
    toastDeleted: "Token deleted",
    toastDeletedDesc: "The token has been removed.",
    toastDeleteError: "Error deleting token",
    toastDeleteErrorDesc: "An error occurred. Please try again.",
    toastImported: "Import complete",
    toastImportedDesc: (ok: number, fail: number) =>
      `${ok} token${ok !== 1 ? "s" : ""} imported${fail > 0 ? `, ${fail} failed` : ""}.`,

    validFbId: "Facebook ID is required",
    validToken: "Token is required",

    missingFbId: "Missing FB ID",
    missingToken: "Missing token",
  },

  vi: {
    appName: "Quản lý Token",
    appSubtitle: "Kho lưu token Facebook",
    addToken: "Thêm Token",

    totalTokens: "Tổng Token",
    active: "Hoạt động",
    expired: "Hết hạn",
    invalid: "Không hợp lệ",

    tokenRegistry: "Danh sách Token",
    tokenRegistryDesc: "Quản lý và theo dõi token Facebook của bạn",
    searchPlaceholder: "Tìm theo FB ID...",
    allStatus: "Tất cả",

    colId: "ID",
    colFbId: "FB ID",
    colToken: "Token",
    colCookie: "Cookie",
    colStatus: "Trạng thái",
    colNote: "Ghi chú",
    colCreated: "Ngày tạo",
    colActions: "Thao tác",

    loading: "Đang tải token...",
    noTokens: "Không tìm thấy token nào.",

    copiedToken: "Đã sao chép Token",
    copiedCookie: "Đã sao chép Cookie",
    copiedDesc: "Đã sao chép vào clipboard.",

    editToken: "Chỉnh sửa Token",
    editTokenDesc: "Chỉnh sửa thông tin token bên dưới.",
    newToken: "Thêm Token",
    newTokenDesc: "Nhập thủ công hoặc nhập từ file.",

    manualInput: "Nhập thủ công",
    importFile: "Nhập từ file",

    fileFormatTitle: "Định dạng file (CSV hoặc TXT) — mỗi dòng 1 token:",
    fileFormatFull: "id | token | cookie | status | ghi_chu",
    fileFormatNoCookie: "id | token | cookie  (mặc định: active)",
    fileFormatMinimal: "id | token  (không có cookie)",
    fileFormatNote: "Dấu phân cách: pipe (|) hoặc dấu phẩy (,) đều được",

    dropZoneTitle: "Kéo thả file hoặc click để chọn",
    dropZoneHint: ".csv hoặc .txt",

    validCount: (n: number) => `${n} hợp lệ`,
    errorCount: (n: number) => `${n} lỗi`,
    clearFile: "Xóa",

    readyToImport: (n: number) => `${n} token sẵn sàng nhập`,
    cancel: "Hủy",
    importBtn: (n: number) => `Nhập ${n} Token`,

    labelFbId: "ID tài khoản FB",
    labelToken: "Access Token",
    labelCookie: "Cookie",
    labelCookieOptional: "(không bắt buộc)",
    labelStatus: "Trạng thái",
    labelNote: "Ghi chú",
    labelNoteOptional: "(không bắt buộc)",
    placeholderNote: "Nhập ghi chú...",

    save: "Lưu thay đổi",
    createBtn: "Thêm Token",

    statusActive: "Hoạt động",
    statusExpired: "Hết hạn",
    statusInvalid: "Không hợp lệ",
    selectStatus: "Chọn trạng thái",

    deleteTitle: "Xóa Token",
    deleteConfirm: (fbId: string) =>
      `Bạn có chắc muốn xóa token của FB ID ${fbId}? Hành động này không thể hoàn tác.`,
    deleteCancel: "Hủy",
    deleteBtn: "Xóa",
    deleting: "Đang xóa...",

    // Bulk operations
    selectedCount: (n: number) => `Đã chọn ${n}`,
    clearSelection: "Bỏ chọn",
    bulkChangeStatus: "Đổi trạng thái",
    bulkDeleteSelected: "Xóa đã chọn",
    bulkDeleteAll: "Xóa tất cả",

    bulkStatusTitle: "Đổi trạng thái",
    bulkStatusDesc: (n: number) => `Đổi trạng thái cho ${n} token đã chọn`,
    bulkDeleteTitle: "Xóa đã chọn",
    bulkDeleteDesc: (n: number) =>
      `Xóa ${n} token đã chọn? Hành động này không thể hoàn tác.`,
    bulkDeleteAllTitle: "Xóa tất cả Token",
    bulkDeleteAllDesc: "Thao tác này sẽ xóa TOÀN BỘ token trong hệ thống. Không thể hoàn tác.",
    confirmDelete: "Xóa",
    applying: "Đang xử lý...",

    toastBulkStatusUpdated: "Đã cập nhật trạng thái",
    toastBulkStatusUpdatedDesc: (n: number) => `Đã cập nhật ${n} token.`,
    toastBulkDeleted: "Đã xóa token",
    toastBulkDeletedDesc: (n: number) => `Đã xóa ${n} token.`,
    toastDeleteAll: "Đã xóa tất cả",
    toastDeleteAllDesc: "Tất cả token đã được xóa.",
    toastBulkError: "Thao tác thất bại",
    toastBulkErrorDesc: "Đã xảy ra lỗi. Vui lòng thử lại.",

    toastCreated: "Đã tạo token",
    toastCreatedDesc: "Token đã được thêm thành công.",
    toastCreateError: "Lỗi tạo token",
    toastCreateErrorDesc: "Vui lòng kiểm tra lại thông tin và thử lại.",
    toastUpdated: "Đã cập nhật token",
    toastUpdatedDesc: "Thay đổi đã được lưu.",
    toastUpdateError: "Lỗi cập nhật token",
    toastUpdateErrorDesc: "Vui lòng thử lại.",
    toastDeleted: "Đã xóa token",
    toastDeletedDesc: "Token đã được xóa khỏi hệ thống.",
    toastDeleteError: "Lỗi xóa token",
    toastDeleteErrorDesc: "Đã xảy ra lỗi. Vui lòng thử lại.",
    toastImported: "Nhập hoàn tất",
    toastImportedDesc: (ok: number, fail: number) =>
      `Đã nhập ${ok} token${fail > 0 ? `, ${fail} thất bại` : ""}.`,

    validFbId: "Facebook ID không được để trống",
    validToken: "Token không được để trống",

    missingFbId: "Thiếu FB ID",
    missingToken: "Thiếu token",
  },
} as const;

export type T = (typeof translations)["en"];

class ApiResponse {
  static success(data, meta = null) {
    const response = { success: true, data };
    if (meta) response.meta = meta;
    return response;
  }

  static error(code, message, status = 500, details = null) {
    const response = {
      success: false,
      error: { code, message, status },
    };
    if (details) response.error.details = details;
    return response;
  }

  static paginated(data, meta) {
    return {
      success: true,
      data,
      meta,
    };
  }
}

module.exports = ApiResponse;

export function sendResponse(res, code, success, message, data = null, error = null) {
  const response = {
    code,
    success,
    message,
  }

  if (data) {
    response.data = data
  }

  if (error) {
    response.error = error
  }

  return res.status(code).json(response)
}

export function respData(data: any, status = 200) {
  return respJson(0, 'ok', data || [], status);
}

export function respOk(status = 200) {
  return respJson(0, 'ok', undefined, status);
}

export function respErr(message: string, status = 400) {
  return respJson(-1, message, undefined, status);
}

export function respJson(
  code: number,
  message: string,
  data?: any,
  status = code === 0 ? 200 : 400
) {
  let json = {
    code: code,
    message: message,
    data: data,
  };
  if (data) {
    json['data'] = data;
  }

  return Response.json(json, { status });
}

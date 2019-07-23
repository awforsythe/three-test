function expectJson(response) {
  return response.json().then(data => {
    if (!response.ok) {
      if (data && data.message) {
        if (data.message instanceof Object) {
          throw new Error(JSON.stringify(data.message));
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error(response.statusText);
      }
    }
    return data;
  });
}

function expect204(response) {
  if (response.status !== 204) {
    return response.json().then(data => {
      throw new Error((!response.ok && data.message) || response.statusText);
    });
  }
  return null;
}

function post(url, params) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}

export { expectJson, expect204, post };

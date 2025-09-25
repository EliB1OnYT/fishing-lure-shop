export async function api(path, opts) {
  const headers = opts && opts.headers ? opts.headers : {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch('/api/' + path, {...opts, headers});
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  return res.json();
}

export const getProducts = () => api('products', {method: 'GET'});
export const createProduct = (data) => api('product-create', {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}});
export const deleteProduct = (id) => api('product-delete?id=' + id, {method: 'DELETE'});
export const signup = (data) => api('auth-signup', {method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'}});
export const login = (data) => api('auth-login', {method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'}});
export const adminLogin = (data) => api('admin-login', {method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'}});
export const createCheckout = (items) => api('create-checkout-session', {method:'POST', body: JSON.stringify({items}), headers:{'Content-Type':'application/json'}});
export const getOrders = () => api('orders', {method:'GET'});

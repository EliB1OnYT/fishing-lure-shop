import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, deleteProduct, signup, login, adminLogin, createCheckout, getOrders } from './api';

function Nav({ setView, user, logout }) {
  return (
    <div className="header container">
      <h1>Fishing Lure Shop</h1>
      <nav>
        <a href="#" onClick={e=>{e.preventDefault(); setView('home')}}>Home</a>
        <a href="#" onClick={e=>{e.preventDefault(); setView('shop')}}>Shop</a>
        <a href="#" onClick={e=>{e.preventDefault(); setView('cart')}}>Cart</a>
        {!user && <a href="#" onClick={e=>{e.preventDefault(); setView('login')}}>Login</a>}
        {!user && <a href="#" onClick={e=>{e.preventDefault(); setView('signup')}}>Signup</a>}
        <a href="#" onClick={e=>{e.preventDefault(); setView('admin')}}>Admin</a>
        {user && <button className="button" onClick={logout}>Logout</button>}
      </nav>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(()=>{ fetchProducts(); const t=localStorage.getItem('token'); if (t) setUser({}); },[]);

  async function fetchProducts(){ try{ const p = await getProducts(); setProducts(p); }catch(e){ console.error(e); } }

  function addToCart(p){ setCart(prev=>{ const copy={...prev}; copy[p.id]=(copy[p.id]||0)+1; return copy; }); }
  function removeFromCart(id){ setCart(prev=>{ const copy={...prev}; if(!copy[id]) return copy; copy[id]--; if(copy[id]<=0) delete copy[id]; return copy; }); }
  function cartItems(){ return Object.entries(cart).map(([id,qty])=> ({...products.find(x=>String(x.id)===String(id)), qty})).filter(Boolean); }

  async function doSignup(data){ try{ const res = await signup(data); localStorage.setItem('token', res.token); setUser({}); setView('shop'); }catch(e){ alert('Signup failed'); } }
  async function doLogin(data){ try{ const res = await login(data); localStorage.setItem('token', res.token); setUser({}); setView('shop'); }catch(e){ alert('Login failed'); } }
  async function doAdminLogin(password){ try{ const res = await adminLogin({password}); localStorage.setItem('token', res.token); setAdminToken(res.token); setView('admin'); alert('Admin login success'); }catch(e){ alert('Admin login failed'); } }

  async function doCreateProduct(product){ try{ await createProduct(product); fetchProducts(); alert('Created'); }catch(e){ alert('Create product failed'); } }
  async function doDelete(id){ try{ await deleteProduct(id); fetchProducts(); }catch(e){ alert('Delete failed'); } }

  async function checkout(){ const items = cartItems().map(i=>({id:i.id, title:i.title, price:i.price, qty:i.qty})); try{ const res = await createCheckout(items); if(res.url) window.location = res.url; }catch(e){ alert('Checkout failed'); } }

  async function loadOrders(){ try{ const o = await getOrders(); setOrders(o);}catch(e){ console.error(e); } }

  function logout(){ localStorage.removeItem('token'); setUser(null); setAdminToken(null); setView('home'); }

  return (
    <div>
      <Nav setView={setView} user={user} logout={logout} />
      <div className="container" style={{marginTop:20}}>
        {view==='home' && <div className="card"><h2>Welcome</h2><p className="small">Buy premium fishing lures.</p></div>}
        {view==='shop' && <div>
          <h2>Shop</h2>
          <div className="grid">
            {products.map(p=>(
              <div className="card" key={p.id}>
                <h3>{p.title}</h3>
                <div className="small">${Number(p.price).toFixed(2)}</div>
                <p className="small">{p.description}</p>
                <button className="button" onClick={()=>addToCart(p)}>Add to cart</button>
              </div>
            ))}
          </div>
        </div>}
        {view==='cart' && <div><h2>Cart</h2>
          <div className="card">
            {cartItems().map(i=> <div key={i.id} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div>{i.title} x {i.qty}</div><div>${(i.price*i.qty).toFixed(2)}</div></div>)}
            <div style={{marginTop:12}}><button className="button" onClick={checkout}>Checkout</button></div>
          </div>
        </div>}
        {view==='signup' && <AuthForm mode="signup" onSubmit={doSignup} />}
        {view==='login' && <AuthForm mode="login" onSubmit={doLogin} />}
        {view==='admin' && <AdminPanel onCreate={doCreateProduct} products={products} onDelete={doDelete} loadOrders={loadOrders} orders={orders} onAdminLogin={doAdminLogin} />}
      </div>
    </div>
  )
}

function AuthForm({mode,onSubmit}){
  const [email,setEmail]=React.useState('');
  const [password,setPassword]=React.useState('');
  return <div className="card" style={{maxWidth:420}}>
    <h3>{mode==='signup'?'Signup':'Login'}</h3>
    <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
    <div style={{height:8}} />
    <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
    <div style={{height:12}} />
    <button className="button" onClick={()=>onSubmit({email,password})}>{mode==='signup'?'Create account':'Sign in'}</button>
  </div>
}

function AdminPanel({onCreate, products, onDelete, loadOrders, orders, onAdminLogin}){
  const [title,setTitle]=React.useState(''); const [price,setPrice]=React.useState(9.99); const [desc,setDesc]=React.useState(''); const [adminPass,setAdminPass]=React.useState('');
  return <div>
    <div className="card" style={{marginBottom:12}}>
      <h3>Admin Login</h3>
      <input className="input" placeholder="Admin password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} />
      <div style={{height:8}} />
      <button className="button" onClick={()=>onAdminLogin(adminPass)}>Login as Admin</button>
    </div>

    <div className="card">
      <h3>Create Product</h3>
      <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <div style={{height:8}} />
      <input className="input" placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} />
      <div style={{height:8}} />
      <input className="input" placeholder="Short description" value={desc} onChange={e=>setDesc(e.target.value)} />
      <div style={{height:8}} />
      <button className="button" onClick={()=>{ onCreate({title,price:parseFloat(price),description:desc}); setTitle(''); setDesc(''); }}>Create</button>
    </div>

    <div style={{height:12}} />
    <div className="card">
      <h3>Products</h3>
      {products.map(p=> <div key={p.id} style={{display:'flex',justifyContent:'space-between', marginBottom:8}}><div>{p.title} - ${Number(p.price).toFixed(2)}</div><div><button onClick={()=>onDelete(p.id)} className="button">Delete</button></div></div>)}
    </div>

    <div style={{height:12}} />
    <div className="card">
      <h3>Orders</h3>
      <button className="button" onClick={loadOrders}>Load orders</button>
      {orders.map(o=> <div key={o.id} style={{marginTop:8}} className="small">Order {o.id} - {o.status} - ${Number(o.amount/100).toFixed(2)}</div>)}
    </div>
  </div>
}

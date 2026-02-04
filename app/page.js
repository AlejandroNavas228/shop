'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = 'https://nnntvjrmdkcmkwzvcliq.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubnR2anJtZGtjbWt3enZjbGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzM1NzAsImV4cCI6MjA4NTgwOTU3MH0.UVOR0sWNX2YVb4jb85pyIAJdx-wuKRVXbYtLaNmDyLg';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar productos de Supabase
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        let { data, error } = await supabase
          .from('camisetas')
          .select('*')
          .order('id', { ascending: false });
        
        if (!error && data) {
          setProductos(data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, []);

  const enviarPedidoWhatsApp = () => {
    const telefono = "584142843660"; 
    const mensaje = carrito.map(p => `- ${p.nombre} ($${p.precio})`).join('\n');
    const total = carrito.reduce((acc, p) => acc + p.precio, 0);
    const url = `https://wa.me/${telefono}?text=Hola! Quiero comprar:\n${encodeURIComponent(mensaje)}\n\nTotal: $${total}`;
    window.open(url, '_blank');
  };

  const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta camiseta?")) {
      const { error } = await supabase.from('camisetas').delete().eq('id', id);
      if (!error) {
        setProductos(productos.filter(p => p.id !== id));
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  const entrarComoAdmin = () => {
    const pass = prompt("Introduce la contraseña para editar:");
    if (pass === "Aaronsoy2008#") { 
      setEsAdmin(true);
    } else {
      alert("Clave incorrecta");
    }
  };

  if (cargando) return <div className="flex justify-center items-center h-screen bg-white text-black">Cargando catálogo...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans text-black">
      
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-tighter italic">FUTBOL STORE</h1>
        <button 
          onClick={esAdmin ? () => setEsAdmin(false) : entrarComoAdmin} 
          className={`text-[10px] px-3 py-1 rounded-full border transition-all ${esAdmin ? 'bg-red-500 border-red-500 font-bold' : 'border-white opacity-70'}`}
        >
          {esAdmin ? 'CERRAR ADMIN' : 'ADMIN'}
        </button>
      </header>

      {/* Formulario de Carga (Admin) */}
      {esAdmin && (
        <div className="m-4 p-5 bg-white rounded-2xl border-2 border-blue-500 shadow-xl">
          <h3 className="font-bold mb-3 text-blue-600">Nueva Camiseta</h3>
          <div className="space-y-3">
            <input id="n-nom" placeholder="Nombre (Ej: Real Madrid Local)" className="w-full p-2 bg-gray-50 border rounded-lg outline-none focus:border-blue-500" />
            <input id="n-pre" type="number" placeholder="Precio ($)" className="w-full p-2 bg-gray-50 border rounded-lg outline-none focus:border-blue-500" />
            <input id="n-img" placeholder="URL de la imagen" className="w-full p-2 bg-gray-50 border rounded-lg outline-none focus:border-blue-500" />
            <button 
              onClick={async () => {
                const nombre = document.getElementById('n-nom').value;
                const precio = document.getElementById('n-pre').value;
                const imagen_url = document.getElementById('n-img').value;
                
                if(!nombre || !precio || !imagen_url) return alert("Completa todos los campos");

                const { error } = await supabase
                  .from('camisetas')
                  .insert([{ nombre, precio: parseInt(precio), imagen_url, stock: true }]);
                  
                if (!error) {
                  alert("¡Añadida!");
                  window.location.reload();
                } else {
                  alert("Error al subir: " + error.message);
                }
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold shadow-md active:scale-95 transition-transform"
            >
              GUARDAR PRODUCTO
            </button>
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 gap-3 p-3 pt-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
            <div className="relative bg-gray-100 aspect-square">
              {/* CORRECCIÓN: Solo renderiza img si la URL no está vacía */}
              {prod.imagen_url ? (
                <img 
                  src={prod.imagen_url} 
                  alt={prod.nombre} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-[10px]">Sin foto</div>
              )}

              {!prod.stock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">AGOTADO</div>
              )}
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <h2 className="text-[13px] font-semibold leading-tight text-gray-800 h-8 line-clamp-2">{prod.nombre}</h2>
              <p className="text-lg font-black text-blue-600 mt-1">${prod.precio}</p>

              {esAdmin && (
                <button 
                  onClick={() => eliminarProducto(prod.id)}
                  className="mt-2 bg-red-50 text-red-500 text-[9px] py-1 rounded font-bold uppercase border border-red-100"
                >
                  Eliminar
                </button>
              )}
              
              {!esAdmin && (
                <button 
                  disabled={!prod.stock}
                  onClick={() => setCarrito([...carrito, prod])}
                  className={`w-full mt-3 text-white text-[11px] py-2 rounded-lg font-bold transition-all active:scale-90 ${!prod.stock ? 'bg-gray-300' : 'bg-blue-600 shadow-md shadow-blue-100'}`}
                >
                  {prod.stock ? 'AGREGAR +' : 'SIN STOCK'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Carrito Flotante */}
      {!esAdmin && carrito.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-50">
          <div>
            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">{carrito.length} Items</p>
            <p className="font-bold text-xl">${carrito.reduce((acc, p) => acc + p.precio, 0)}</p>
          </div>
          <button 
            onClick={enviarPedidoWhatsApp}
            className="bg-white text-green-700 px-6 py-2 rounded-xl font-black text-sm active:scale-95 transition-transform"
          >
            COMPRAR
          </button>
        </div>
      )}
    </div>
  );
}
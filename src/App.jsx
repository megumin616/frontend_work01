import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Package,
  UserPlus,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";

// ⚠️ เปลี่ยน URL นี้เป็น Backend API ของคุณ
const API_URL = "https://service-work01.onrender.com/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form States
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load products when logged in
  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "ไม่สามารถโหลดสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/login`, loginForm);
      setUser(response.data);
      setSuccess("เข้าสู่ระบบสำเร็จ!");
      setView("products");
      setLoginForm({ username: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/register`, registerForm);
      setSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      setView("login");
      setRegisterForm({ username: "", password: "", email: "" });
    } catch (err) {
      setError(err.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView("login");
    setProducts([]);
    setSuccess("ออกจากระบบสำเร็จ");
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingProduct) {
        await axios.put(
          `${API_URL}/products/${editingProduct.id}`,
          productForm,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setSuccess("แก้ไขสินค้าสำเร็จ!");
      } else {
        await axios.post(`${API_URL}/products`, productForm, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccess("เพิ่มสินค้าสำเร็จ!");
      }
      loadProducts();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "ดำเนินการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("คุณต้องการลบสินค้านี้หรือไม่?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess("ลบสินค้าสำเร็จ!");
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", stock: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", stock: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
              ระบบจัดการสินค้า
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">สวัสดี, {user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Alert Messages */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Login View */}
        {view === "login" && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <LogIn className="text-indigo-600 mr-2" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setView("register")}
                className="text-indigo-600 hover:underline"
              >
                ยังไม่มีบัญชี? สมัครสมาชิก
              </button>
            </div>
          </div>
        )}

        {/* Register View */}
        {view === "register" && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <UserPlus className="text-indigo-600 mr-2" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">สมัครสมาชิก</h2>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setView("login")}
                className="text-indigo-600 hover:underline"
              >
                มีบัญชีแล้ว? เข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}

        {/* Products View */}
        {view === "products" && user && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package size={28} />
                รายการสินค้า
              </h2>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
                เพิ่มสินค้าใหม่
              </button>
            </div>

            {loading && products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                กำลังโหลดข้อมูล...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">ยังไม่มีสินค้าในระบบ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-indigo-600">
                        ฿{parseFloat(product.price).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        คงเหลือ: {product.stock} ชิ้น
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        <Edit size={18} />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 size={18} />
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด
                </label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคา (บาท)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนในสต็อก
                </label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

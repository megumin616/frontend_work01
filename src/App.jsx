import { useState, useEffect, createContext, useContext } from "react";
import {
  ShoppingCart,
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  X,
  Menu,
} from "lucide-react";

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// API Configuration
// const API_URL = "https://service-work01.onrender.com/api";
const API_URL = "http://localhost:3001/api";

// API Helper
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }

    return response.json();
  },
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .request("/auth/me")
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (username, email, password) => {
    await api.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Navbar Component
function Navbar({ cart, onShowCart, onShowLogin, onShowRegister }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">MyShop</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{user.username}</span>
                  {user.role === "admin" && (
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
                      ADMIN
                    </span>
                  )}
                </span>
                <button
                  onClick={onShowCart}
                  className="relative bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onShowLogin}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={onShowRegister}
                  className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 py-2">
                  <User className="w-5 h-5" />
                  <span>{user.username}</span>
                  {user.role === "admin" && (
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    onShowCart();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart {cart.length > 0 && `(${cart.length})`}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onShowLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onShowRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Login Modal
function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Login</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

// Register Modal
function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      setSuccess(true);
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Register</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            Registration successful! Redirecting to login...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

// Product Card
function ProductCard({ product, onAddToCart, onEdit, onDelete, isAdmin }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={product.image || "https://via.placeholder.com/400x300"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ฿{parseFloat(product.price).toLocaleString()}
          </span>
          <span
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Stock: {product.stock}
          </span>
        </div>
        <div className="flex gap-2">
          {!isAdmin && (
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                product.stock > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(product)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Form Modal
function ProductFormModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    image: product?.image || "",
    price: product?.price || "",
    stock: product?.stock || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (฿)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Cart Modal
function CartModal({ cart, onClose, onCheckout, onUpdateQuantity, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-blue-600 font-bold">
                      ฿{parseFloat(item.price).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total:</span>
                <span className="text-blue-600">฿{total.toLocaleString()}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.request("/products");
      setProducts(data);
    } catch (err) {
      showMessage("Failed to load products", "error");
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showMessage("Cannot add more than available stock", "error");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showMessage("Added to cart!");
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      await api.request("/orders", {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      setCart([]);
      setShowCart(false);
      showMessage("Order placed successfully!");
      loadProducts();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        await api.request(`/products/${editingProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        showMessage("Product updated successfully!");
      } else {
        await api.request("/products", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        showMessage("Product created successfully!");
      }
      setShowProductForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.request(`/products/${id}`, { method: "DELETE" });
      showMessage("Product deleted successfully!");
      loadProducts();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cart={cart}
        onShowCart={() => setShowCart(true)}
        onShowLogin={() => setShowLogin(true)}
        onShowRegister={() => setShowRegister(true)}
      />

      {message && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            message.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {message.text}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {user?.role === "admin" && (
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onEdit={(p) => {
                setEditingProduct(p);
                setShowProductForm(true);
              }}
              onDelete={handleDeleteProduct}
              isAdmin={user?.role === "admin"}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">No products available</p>
          </div>
        )}
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveFromCart}
        />
      )}

      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}


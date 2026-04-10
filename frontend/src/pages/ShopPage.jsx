import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProductStore } from '../store/productStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { Card, Badge, Button, Input, Select, SkeletonCard, Pagination, Empty } from '../components/UI';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'sports', label: 'Sports' },
  { value: 'food', label: 'Food' },
];

const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt',  label: 'Oldest First' },
  { value: 'price',      label: 'Price: Low → High' },
  { value: '-price',     label: 'Price: High → Low' },
  { value: 'name',       label: 'Name A–Z' },
  { value: '-name',      label: 'Name Z–A' },
];

function ProductCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await onAddToCart(product);
    setAdding(false);
  };

  const stockColor = product.stock === 0 ? 'var(--red)' : product.stock < 5 ? 'var(--orange)' : 'var(--green)';

  return (
    <Card hover style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      {/* Image */}
      <div style={{
        height: 180, background: 'var(--bg3)',
        backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', position: 'relative',
      }}>
        {!product.images?.[0] && '📦'}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <Badge label={product.category} type="user" />
        </div>
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,11,16,0.7)', display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: '14px' }}>OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}
          className="truncate">{product.name}</div>

        {product.description && (
          <p style={{ color: 'var(--text2)', fontSize: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>
            ₹{product.price.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: stockColor, fontWeight: 600 }}>
            {product.stock} left
          </span>
        </div>

        <Button onClick={handleAdd} loading={adding} disabled={product.stock === 0} size="sm" style={{ width: '100%', marginTop: '4px' }}>
          {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
        </Button>
      </div>
    </Card>
  );
}

export default function ShopPage() {
  const { products, meta, isLoading, isCached, filters, setFilters, setPage, fetchProducts } = useProductStore();
  const { placeOrder } = useOrderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cart, setCart] = useState({}); // { productId: { product, quantity } }
  const [placingOrder, setPlacingOrder] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search });
  };

  const addToCart = (product) => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    setCart(c => ({
      ...c,
      [product._id]: { product, quantity: (c[product._id]?.quantity || 0) + 1 },
    }));
    toast.success(`${product.name} added to cart`);
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;
    setPlacingOrder(true);
    const items = cartItems.map(({ product, quantity }) => ({ productId: product._id, quantity }));
    const res = await placeOrder(items);
    setPlacingOrder(false);
    if (res.success) {
      setCart({});
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Hero Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>Browse Products</h1>
          {isCached && <Badge label="⚡ Cached" type="cached" />}
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          {meta ? `${meta.total} products found` : 'Discover our catalog'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Sidebar Filters ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: 80 }}>
          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', marginBottom: '16px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters</div>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Search" placeholder="Name or category…" value={search} onChange={e => setSearch(e.target.value)} />

              <Select label="Category" value={filters.category} options={CATEGORIES}
                onChange={e => setFilters({ category: e.target.value })} />

              <Select label="Sort By" value={filters.sort} options={SORTS}
                onChange={e => setFilters({ sort: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input label="Min ₹" type="number" placeholder="0" value={filters.minPrice}
                  onChange={e => setFilters({ minPrice: e.target.value })} />
                <Input label="Max ₹" type="number" placeholder="∞" value={filters.maxPrice}
                  onChange={e => setFilters({ maxPrice: e.target.value })} />
              </div>

              <Button type="submit" size="sm" style={{ width: '100%' }}>Apply</Button>
              <Button type="button" variant="ghost" size="sm" style={{ width: '100%' }}
                onClick={() => { setSearch(''); setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' }); }}>
                Clear
              </Button>
            </form>
          </Card>

          {/* Cart */}
          {cartItems.length > 0 && (
            <Card style={{ padding: '20px', border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.04)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', marginBottom: '14px', color: 'var(--accent)' }}>
                🛒 Cart ({cartItems.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {cartItems.map(({ product, quantity }) => (
                  <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text2)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>×{quantity}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total</span>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>₹{cartTotal.toLocaleString()}</span>
              </div>
              <Button onClick={handlePlaceOrder} loading={placingOrder} variant="green" size="sm" style={{ width: '100%' }}>
                Place Order
              </Button>
            </Card>
          )}
        </div>

        {/* ── Product Grid ─────────────────────────────────────── */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <Empty icon="🔍" title="No products found" subtitle="Try adjusting your filters" />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
                ))}
              </div>
              <Pagination meta={meta} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

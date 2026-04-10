import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useProductStore } from '../store/productStore';
import { Card, Button, Input, Select, Modal, Badge, Pagination, Empty, SkeletonCard } from '../components/UI';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', stock: '', images: '' };
const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing',    label: 'Clothing'    },
  { value: 'books',       label: 'Books'       },
  { value: 'furniture',   label: 'Furniture'   },
  { value: 'sports',      label: 'Sports'      },
  { value: 'food',        label: 'Food'        },
];

function ProductForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock),
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Product Name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Wireless Headphones" />
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Product description…"
          style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-body)' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input label="Price (₹)" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
        <Input label="Stock" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required />
      </div>
      <Select label="Category" value={form.category} options={[{ value: '', label: 'Select category…' }, ...CATEGORIES]}
        onChange={e => set('category', e.target.value)} />
      <Input label="Image URLs (comma-separated)" value={form.images} onChange={e => set('images', e.target.value)}
        placeholder="https://example.com/img.jpg, …" />
      <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: '4px' }}>
        {initial ? 'Save Changes' : 'Create Product'}
      </Button>
    </form>
  );
}

export default function AdminProductsPage() {
  const { products, meta, isLoading, isCached, filters, setFilters, setPage, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const [modal, setModal] = useState(null); // null | 'create' | { product }
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (payload) => {
    setSaving(true);
    const res = await createProduct(payload);
    setSaving(false);
    if (res.success) { toast.success('Product created!'); setModal(null); }
    else toast.error(res.message);
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    const res = await updateProduct(modal.product._id, payload);
    setSaving(false);
    if (res.success) { toast.success('Product updated!'); setModal(null); await fetchProducts(); }
    else toast.error(res.message);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    const res = await deleteProduct(product._id);
    if (res.success) toast.success('Product deleted');
    else toast.error(res.message);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Products</h1>
            {isCached && <Badge label="⚡ Cached" type="cached" />}
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{meta?.total || 0} products total</p>
        </div>
        <Button onClick={() => setModal('create')}>+ New Product</Button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setFilters({ search })}
          style={{ flex: 1, padding: '10px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px' }}
        />
        <Button onClick={() => setFilters({ search })} variant="secondary">Search</Button>
        <Button onClick={() => { setSearch(''); setFilters({ search: '' }); }} variant="ghost">Clear</Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Empty icon="📦" title="No products yet" subtitle="Click 'New Product' to add one" />
      ) : (
        <>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p._id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg3)', backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {!p.images?.[0] && '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                          {p.description && <div style={{ color: 'var(--text3)', fontSize: '12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><Badge label={p.category} type="user" /></td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>₹{p.price.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: p.stock === 0 ? 'var(--red)' : p.stock < 5 ? 'var(--orange)' : 'var(--green)', fontWeight: 700, fontSize: '14px' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button size="sm" variant="secondary" onClick={() => setModal({ product: p })}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}

      {/* Create Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="New Product">
        <ProductForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!modal?.product} onClose={() => setModal(null)} title="Edit Product">
        {modal?.product && (
          <ProductForm
            initial={{ ...modal.product, images: modal.product.images?.join(', ') || '' }}
            onSubmit={handleUpdate}
            loading={saving}
          />
        )}
      </Modal>
    </div>
  );
}

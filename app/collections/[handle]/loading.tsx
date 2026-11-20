export default function CollectionLoading() {
  return <main id="main-content" className="page-container new-arrivals-page" aria-label="Loading products">
    <div className="arrivals-toolbar" aria-hidden="true">
      <div className="arrivals-desktop-filters">{[80, 48, 64, 48, 64].map((width, index) => <span className="skeleton" key={index} style={{ width, height: 16 }} />)}</div>
      <span className="arrivals-item-count skeleton" style={{ width: 60, height: 16 }} />
      <span className="skeleton" style={{ width: 40, height: 16 }} />
    </div>
    <div className="product-grid">{Array.from({ length: 8 }, (_, index) => <div key={index}><div className="skeleton skeleton-product" /><div className="skeleton skeleton-line" /></div>)}</div>
  </main>;
}

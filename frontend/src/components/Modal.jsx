function Modal({ titre, onFermer, children }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1050 }}
      onClick={onFermer}
    >
      <div
        className="card-cpg bg-white p-4"
        style={{ width: '480px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{titre}</h5>
          <button onClick={onFermer} className="btn btn-sm btn-light">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
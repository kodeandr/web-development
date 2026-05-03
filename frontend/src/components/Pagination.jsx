export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Назад</button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} style={{ margin: '0 5px', background: currentPage === p ? '#007bff' : '#6c757d' }}>{p}</button>
      ))}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Вперёд</button>
    </div>
  );
}
export default function Lightbox({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img
        src={imageUrl}
        alt="Zoomed preview"
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
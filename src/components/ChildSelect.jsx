export default function ChildSelect({ children, onSelectChild, onParentClick }) {
  return (
    <div className="landing">
      <h1 className="landing__title">💰 우리집 용돈</h1>
      <div className="landing__children">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            className="child-avatar"
            style={{ backgroundColor: child.color }}
            onClick={() => onSelectChild(child)}
          >
            <span className="child-avatar__emoji">🙂</span>
            <span className="child-avatar__name">{child.name}</span>
          </button>
        ))}
        {children.length === 0 && (
          <p className="landing__empty">등록된 자녀가 없어요. 부모 모드에서 추가해주세요.</p>
        )}
      </div>
      <button type="button" className="btn btn--ghost landing__parent-btn" onClick={onParentClick}>
        🔒 부모 모드
      </button>
    </div>
  )
}

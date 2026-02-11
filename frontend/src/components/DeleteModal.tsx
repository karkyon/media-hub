interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">削除確認</h2>
        <p className="text-gray-700 mb-2">本当にこのコンテンツを削除しますか？</p>
        <p className="text-danger font-semibold mb-6">この操作は元に戻せません。</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button onClick={onConfirm} className="btn-danger">
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

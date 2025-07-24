import { FC, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../../../components/Button';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { ButtonBox } from '../../../../../components/ButtonBox';
import { useViewRecordApi } from '../hooks/useViewRecordApi';

interface CommentDialogPropsIF {
  closeDialog: () => void;
  isOpen: boolean;
  jsonKey: string;
}

export const CommentDialog: FC<CommentDialogPropsIF> = ({ isOpen, closeDialog, jsonKey }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToastStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { createComment } = useViewRecordApi();

  // Memoize the click outside handler to prevent recreation on every render
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeDialog();
      }
    },
    [closeDialog]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // Memoize the click handler to prevent recreation on every render
  const onClickHandler = useCallback(async () => {
    if (!`${comment}`.trim()) return;
    setLoading(true);
    const res = await createComment(comment, jsonKey);
    if (res) {
      setLoading(false);
      closeDialog();
    }
  }, [comment, createComment, closeDialog, jsonKey]);

  // Memoize the textarea change handler
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }, []);

  // Memoize the close handler (in case it's not already memoized in parent)
  const handleClose = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  // Memoize computed values
  const isCommentEmpty = useMemo(() => !`${comment}`.trim(), [comment]);
  const buttonText = useMemo(() => (loading ? 'Saving...' : 'Save'), [loading]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="absolute top-19 right-2 z-10 flex w-[calc(100%-10px)] max-w-md flex-col items-end gap-2 rounded-lg border bg-white px-4 py-2 text-lg shadow-xl"
    >
      <header className="w-full font-bold text-gray-600">Add Comment</header>
      <textarea
        value={comment}
        onChange={handleCommentChange}
        className="w-full rounded-lg border p-2 text-sm text-gray-700 focus:outline-1"
        rows={3}
        placeholder="Add your comment here..."
      />
      <ButtonBox>
        <Button onClick={handleClose} small outlined>
          Close
        </Button>
        <Button onClick={onClickHandler} disabled={isCommentEmpty} small className="w-fit" outlined>
          {buttonText}
        </Button>
      </ButtonBox>
    </div>
  );
};

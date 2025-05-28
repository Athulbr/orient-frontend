import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '../../../../../components/button/Button';

interface CommentDialogPropsIF {
  closeDialog: () => void;
  isOpen: boolean;
}
export const CommentDialog: FC<CommentDialogPropsIF> = ({ isOpen, closeDialog }) => {
  const [comment, setComment] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeDialog();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDialog]);

  const onClickHandler = () => {
    alert('Comment saved: ' + comment);
    closeDialog();
  };
  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="absolute top-16 right-2 z-10 flex w-[calc(100%-10px)] flex-col items-end gap-2 rounded-lg border bg-white px-4 py-2 text-lg shadow-xl"
    >
      <header className="w-full font-bold text-gray-600">Add Comment</header>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full rounded-lg border p-2 text-sm text-gray-700 focus:outline-1"
        rows={3}
        placeholder="Add your comment here..."
      />
      <Button onClick={onClickHandler} small className="w-fit" outlined>
        Save
      </Button>
    </div>
  );
};

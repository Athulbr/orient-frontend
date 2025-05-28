import { FC } from 'react';

interface ValidateSkuButtonIF {
  label?: string;
}
export const ValidateSkuButton: FC<ValidateSkuButtonIF> = ({ label }) => {
  const onClick = () => {};
  if (label !== 'Sku Number' && label !== 'Rehab Id') return null;
  return (
    <span onClick={onClick} className="cursor-pointer pr-2 text-xs text-sky-500 hover:text-sky-600 hover:underline">
      Validate
    </span>
  );
};

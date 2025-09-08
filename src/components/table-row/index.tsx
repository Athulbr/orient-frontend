
import { TableRowPropsIF } from "../../interface/component.interface";
import DropdownMenu from "../dropdown";
import style from "./table-row.module.css";

const TableRow: React.FC<TableRowPropsIF> = ({ options, row, setRow }) => {
  return (
    <DropdownMenu onChange={(e: string) => setRow(e)} options={options}>
      <div className={style.tableRow}>
        Rows<span>{row}</span>
      </div>
    </DropdownMenu>
  );
};

export default TableRow;

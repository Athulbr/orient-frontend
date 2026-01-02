import { Edit, Trash2 } from 'lucide-react';
import Tooltip from '../../../../../../components/Tooltip';
import { useAlertStore } from '../../../../../../components/alert/AlertStore';
import { usePermissionStore } from '../../../../../../zustand-store/PermissionStore';

export const ActionButtons: React.FC<{ row: any }> = ({ row }) => {
    const { checkPermission } = usePermissionStore();
    const alert = useAlertStore();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement edit logic
        console.log('Edit clicked for row:', row);
    };
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();

        alert.showAlert({
            alertText: 'Are you sure you want to delete this?',
            primaryButtonText: 'Delete',
            onPrimaryAction: () => {
                // TODO: Implement delete logic
                console.log('Delete clicked for row:', row);
                alert.closeAlert();
            }
        });
    };

    return (
        <div className={`flex gap-4`}>
            {checkPermission('update:record') && (
                <Tooltip text="Edit" position="bottom">
                    <Edit onClick={handleEdit} className="cursor-pointer hover:text-blue-500" size={18} />
                </Tooltip>
            )}
            {checkPermission('delete:record') && (
                <Tooltip text="Delete" position="bottom">
                    <Trash2 onClick={handleDelete} className="cursor-pointer hover:text-red-500" size={18} />
                </Tooltip>
            )}
        </div>
    );
};

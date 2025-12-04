import { Button } from '../../../components/Button';
import { TextAreaComponent } from '../../../components/Textarea';

export default function RightContainer() {
    return (
        <div className=" flex flex-col overflow-y-auto flex-1 h-full p-4 pt-0 gap-2">
            <div className="p-2">
                <p className="text-xl font-semibold">Content Details</p>
            </div>
            <TextAreaComponent rows={10} />
            <Button>Submit</Button>
        </div>
    );
}

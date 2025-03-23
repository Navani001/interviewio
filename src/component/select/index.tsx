import { Select, SelectItem } from "@heroui/react";

interface SelectItem {
    key: string;
    label: string;
}
interface SelectComponentProps{
    contents: SelectItem[];
    value: string;
    setValue:(val:string)=>void
}
export function SelectComponent({ contents,setValue,value }: SelectComponentProps) {
    return (
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select
            onChange={(e)=>{
                    setValue(e.target.value)
            }}
                value={value}
            
            classNames={{
                base:"h-10",
                trigger: "min-h-10 py-0 h-10 pt-1",
            }} label="Select an animal">
                {contents.map((content) => (
                    <SelectItem key={content.key}>{content.label}</SelectItem>
                ))}
            </Select>
        </div>
    );
}

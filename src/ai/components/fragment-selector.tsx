import { ChevronRight } from "lucide-react";

interface Props {
  webUrl: string;
}

export const FragmentSelector = ({ webUrl }: Props) => {
  console.log(webUrl);
  return (
    <div className="w-[200px] flex justify-between items-center p-4 border rounded-xl">
      <div>
        <h2>Fragment</h2>
        <p className="text-sm text-muted-foreground">Preview</p>
      </div>
      <ChevronRight />
    </div>
  );
};

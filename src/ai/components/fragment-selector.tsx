import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  webUrl: string;
  setPreviewUrl: Dispatch<SetStateAction<string | null>>;
  previewUrl: string | null;
  setAppPreview: Dispatch<SetStateAction<boolean>>;
}

export const FragmentSelector = ({
  webUrl,
  setPreviewUrl,
  setAppPreview,
  previewUrl,
}: Props) => {
  console.log(previewUrl);
  return (
    <div
      className={cn(
        "w-[200px] cursor-pointer flex justify-between items-center p-4 border rounded-xl",
        previewUrl === webUrl && "bg-primary text-white"
      )}
      onClick={() => {
        if (previewUrl === webUrl) {
          setPreviewUrl(null);
          setAppPreview(false);
        } else {
          setAppPreview(true);
          setPreviewUrl(webUrl);
        }
      }}
    >
      <div>
        <h2>Fragment</h2>
        <p className="text-sm text-muted-foreground">
          {previewUrl === webUrl ? "Previewing..." : "Preview"}
        </p>
      </div>
      <ChevronRight />
    </div>
  );
};

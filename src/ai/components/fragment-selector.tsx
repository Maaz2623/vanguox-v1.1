import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { AppBuilder } from "../tools";

interface Props {
  webUrl: AppBuilder["webUrl"];
  setPreviewUrl: Dispatch<SetStateAction<AppBuilder["webUrl"]>>;
  previewUrl: AppBuilder["webUrl"];
  setAppPreview: Dispatch<SetStateAction<boolean>>;
}

export const FragmentSelector = ({
  webUrl,
  setPreviewUrl,
  setAppPreview,
  previewUrl,
}: Props) => {
  return (
    <div
      className={cn(
        "w-[200px] cursor-pointer flex justify-between items-center p-4 border rounded-xl",
        previewUrl === webUrl && "bg-primary text-white"
      )}
      onClick={() => {
        if (previewUrl === webUrl) {
          setPreviewUrl(undefined);
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

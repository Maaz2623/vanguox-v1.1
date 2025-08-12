import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { AppBuilder } from "../tools";

interface Props {
  webUrl: AppBuilder["webUrl"];
  setPreviewUrl: Dispatch<SetStateAction<AppBuilder["webUrl"]>>;
  previewUrl: AppBuilder["webUrl"];
  setAppPreview: Dispatch<SetStateAction<boolean>>;
  setFiles: Dispatch<SetStateAction<AppBuilder["files"]>>;
  files: AppBuilder["files"];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const FragmentSelector = ({
  webUrl,
  setPreviewUrl,
  setAppPreview,
  setFiles,
  files,
  setOpen,
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
          setFiles(undefined);
          setOpen(false);
        } else {
          setFiles(files);
          setOpen(true);
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

import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai-elements/web-preview";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRightFromSquareIcon,
  CodeIcon,
  EyeIcon,
  XIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { AppBuilder } from "../tools";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  url: string;
  setAppPreview: (open: boolean) => void;
  setPreviewUrl: Dispatch<SetStateAction<AppBuilder["webUrl"]>>;
  files: AppBuilder["files"];
}

export const AIWebPreview = ({
  url,
  setAppPreview,
  setPreviewUrl,
  files,
}: Props) => {
  const [viewType, setViewType] = useState<"preview" | "code">("preview");

  return (
    <WebPreview defaultUrl={url} className="rounded-none border-none">
      <WebPreviewNavigation className="">
        <Button
          variant={`outline`}
          size={`icon`}
          className="size-8"
          onClick={() => {
            setAppPreview(false);
            setPreviewUrl(undefined);
          }}
        >
          <XIcon />
        </Button>
        <WebPreviewUrl src={url} />
        <Button
          asChild
          variant={`outline`}
          size={`icon`}
          className="size-8"
          onClick={() => {
            setAppPreview(false);
            setPreviewUrl(undefined);
          }}
        >
          <Link href={url} target="_blank">
            <ArrowUpRightFromSquareIcon />
          </Link>
        </Button>
      </WebPreviewNavigation>
      <div className="w-full flex p-1">
        <div className="bg-neutral-200 p-1 rounded-lg">
          <Button
            className={cn(
              "bg-transparent text-muted-foreground shadow-none  hover:bg-transparent!",
              viewType === "preview" && "text-black bg-white hover:bg-white"
            )}
            onClick={() => setViewType("preview")}
          >
            <EyeIcon />
            Preview
          </Button>
          <Button
            className={cn(
              "bg-transparent text-muted-foreground shadow-none  hover:bg-transparent!",
              viewType === "code" && "text-black bg-white hover:bg-white"
            )}
            onClick={() => setViewType("code")}
          >
            <CodeIcon />
            Code
          </Button>
        </div>
      </div>
      {viewType === "preview" ? (
        <WebPreviewBody src={url} />
      ) : (
        <div >{JSON.stringify(files)}</div>
      )}
    </WebPreview>
  );
};

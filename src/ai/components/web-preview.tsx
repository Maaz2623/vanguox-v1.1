import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai-elements/web-preview";
import { Button } from "@/components/ui/button";
import { ArrowUpRightFromSquareIcon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { AppBuilder } from "../tools";
import Link from "next/link";

interface Props {
  url: string;
  setAppPreview: (open: boolean) => void;
  setPreviewUrl: Dispatch<SetStateAction<AppBuilder["webUrl"]>>;
}

export const AIWebPreview = ({ url, setAppPreview, setPreviewUrl }: Props) => {
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
      <WebPreviewBody src={url} className="bg-green-500" />
    </WebPreview>
  );
};

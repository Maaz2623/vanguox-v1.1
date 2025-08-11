import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai-elements/web-preview";

interface Props {
  url: string;
}

export const AIWebPreview = ({ url }: Props) => {
  return (
    <WebPreview defaultUrl={url} className="rounded-none border-none">
      <WebPreviewNavigation className="">
        <WebPreviewUrl src={url} />
      </WebPreviewNavigation>
      <WebPreviewBody src={url} className="bg-green-500" />
    </WebPreview>
  );
};

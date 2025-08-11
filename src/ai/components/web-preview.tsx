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
    <WebPreview defaultUrl={url}>
      <WebPreviewNavigation>
        <WebPreviewUrl src={url} />
      </WebPreviewNavigation>
      <WebPreviewBody src={url} />
    </WebPreview>
  );
};

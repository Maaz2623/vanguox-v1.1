import {
  WebPreview,
  WebPreviewBody,
  WebPreviewConsole,
} from "@/components/ai-elements/web-preview";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRightFromSquareIcon,
  ChevronDown,
  ChevronRight,
  CodeIcon,
  EyeIcon,
  FileIcon,
  FolderIcon,
  XIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { AppBuilder } from "../tools";
import Link from "next/link";
import { cn, normalizeLang } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  url: string;
  setAppPreview: (open: boolean) => void;
  setPreviewUrl: Dispatch<SetStateAction<AppBuilder["webUrl"]>>;
  files: AppBuilder["files"];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AIWebPreview = ({
  url,
  setAppPreview,
  setPreviewUrl,
  files,
  open,
  setOpen,
}: Props) => {
  const [viewType, setViewType] = useState<"preview" | "code">("preview");
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setPreviewUrl(undefined);
          setAppPreview(false);
        }
      }}
    >
      <SheetContent side="right" className="w-[80vw]! max-w-[1000px]! p-0!">
        <VisuallyHidden>
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>This action cannot be undone.</SheetDescription>
          </SheetHeader>
        </VisuallyHidden>
        <WebPreview defaultUrl={url} className="rounded-none border-none">
          <div className="w-full flex py-3 px-4 justify-between border-b items-center">
            <div className="bg-neutral-200 p-1 rounded-lg">
              <Button
                className={cn(
                  "bg-transparent text-xs h-7 text-muted-foreground shadow-none hover:bg-transparent!",
                  viewType === "preview" && "text-black bg-white hover:bg-white"
                )}
                onClick={() => setViewType("preview")}
              >
                <EyeIcon />
                Preview
              </Button>
              <Button
                className={cn(
                  "bg-transparent text-xs h-7 text-muted-foreground shadow-none hover:bg-transparent!",
                  viewType === "code" && "text-black bg-white hover:bg-white"
                )}
                onClick={() => setViewType("code")}
              >
                <CodeIcon />
                Code
              </Button>
            </div>
            <div className="flex">
              <Button
                asChild
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAppPreview(false);
                  setPreviewUrl(undefined);
                }}
              >
                <Link href={url} target="_blank">
                  <ArrowUpRightFromSquareIcon />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAppPreview(false);
                  setPreviewUrl(undefined);
                }}
              >
                <XIcon />
              </Button>
            </div>
          </div>
          {viewType === "preview" ? (
            <WebPreviewBody src={url} />
          ) : (
            <Files files={files} />
          )}
          {viewType === "preview" && <WebPreviewConsole />}
        </WebPreview>
      </SheetContent>
    </Sheet>
  );
};

type FileType = {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: { file?: string; [key: string]: any };
  source: string;
};

const Files = ({ files }: { files?: FileType[] }) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  if (!files) return <div>No files</div>;

  const tree = buildFileTree(files as { meta: { file: string } }[]);

  return (
    <div className="flex h-full gap-x-2">
      <div className="w-[30%] h-full border-r p-2">
        <FileTree
          selectedFile={selectedFile}
          tree={tree}
          onFileSelect={(filePath) => {
            const file = files.find((f) => f.meta.file === filePath);
            if (file) setSelectedFile(file);
          }}
        />
      </div>
      <div className="w-[70%] h-full">
        {selectedFile ? (
          <ScrollArea className="h-full w-full overflow-auto">
            <div className="min-w-full z-50">
              <CodeBlock
                showLineNumbers
                className="bg-transparent border-none py-2 pb-40 pr-20 text-lg"
                language={normalizeLang(selectedFile.lang)}
                lang={selectedFile.lang}
                code={selectedFile.source}
              ></CodeBlock>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="text-muted-foreground">Select a file to view</div>
        )}
      </div>
    </div>
  );
};

function buildFileTree(files: { meta: { file: string } }[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root: any = {};

  files.forEach((f) => {
    const parts = f.meta.file.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      current = current[part] ?? {};
    });
  });

  return root;
}

function FileTree({
  tree,
  onFileSelect,
  selectedFile,
  parentPath = "",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tree: Record<string, any>;
  selectedFile: FileType | null;
  onFileSelect: (filePath: string) => void;
  parentPath?: string;
}) {
  return (
    <div className="space-y-2">
      {Object.entries(tree).map(([name, value]) => {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        return value === null ? (
          <Button
            variant="ghost"
            key={name}
            className={cn(
              "flex cursor-pointer w-full justify-start items-center gap-1 pl-4",
              selectedFile?.meta.file === fullPath && "bg-muted"
            )}
            onClick={() => onFileSelect(fullPath)}
          >
            <FileIcon className="size-5 shrink-0" />
            {name}
          </Button>
        ) : (
          <FolderNode
            key={name}
            name={name}
            selectedFile={selectedFile}
            childrenTree={value}
            onFileSelect={onFileSelect}
            parentPath={fullPath}
          />
        );
      })}
    </div>
  );
}

function FolderNode({
  name,
  childrenTree,
  selectedFile,
  onFileSelect,
  parentPath,
}: {
  name: string;
  selectedFile: FileType | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childrenTree: Record<string, any>;
  onFileSelect: (filePath: string) => void;
  parentPath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full justify-start items-center gap-x-1"
        >
          {open ? (
            <ChevronDown className="size-4.5" />
          ) : (
            <ChevronRight className="size-4.5" />
          )}
          <div className="flex gap-x-1 items-center truncate">
            <FolderIcon />
            {name}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {open && (
          <div className="ml-5 border-l pl-2">
            <FileTree
              selectedFile={selectedFile}
              tree={childrenTree}
              onFileSelect={onFileSelect}
              parentPath={parentPath}
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

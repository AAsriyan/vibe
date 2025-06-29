"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { FileExplorer } from "@/components/file-explorer";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment } from "@/generated/prisma";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { FragmentWeb } from "../components/fragment-web";
import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";

interface ProjectViewProps {
  projectId: string;
}

export const ProjectView = ({ projectId }: ProjectViewProps) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId,
    })
  );

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className="flex flex-col min-h-0"
        >
          <Tabs
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code")}
            className="h-full gap-y-0"
            defaultValue="preview"
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-9 p-0 border rounded-md">
                <TabsTrigger value="preview">
                  <EyeIcon />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size="sm">
                  <Link href={`/pricing`}>
                    <CrownIcon /> Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {!!activeFragment && (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

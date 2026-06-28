'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { useRouter } from '@/core/i18n/navigation';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  Tabs as TabsComponent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { Tab } from '@/shared/types/blocks/common';

export function Tabs({
  tabs,
  size,
}: {
  tabs: Tab[];
  size?: 'sm' | 'md' | 'lg';
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tabName, setTabName] = useState(
    tabs?.find((tab) => tab.is_active)?.name || ''
  );

  useEffect(() => {
    setTabName(tabs?.find((tab) => tab.is_active)?.name || '');
  }, [tabs]);

  useEffect(() => {
    if (tabName) {
      const currentTab =
        tabs?.find((tab) => tab.name === tabName) || ({} as Tab);
      const activeTab = tabs?.find((tab) => tab.is_active);
      if (currentTab.url && currentTab.name !== activeTab?.name) {
        startTransition(() => {
          router.push(currentTab.url || '');
        });
      }
    }
  }, [router, startTransition, tabName, tabs]);

  return (
    <div className="relative mb-8">
      <ScrollArea className="w-full lg:max-w-none">
        <div className="flex items-center space-x-2">
          <TabsComponent value={tabName} onValueChange={setTabName}>
            <TabsList className={cn(size === 'sm' && 'h-8')}>
              {tabs.map((tab, idx) => (
                <TabsTrigger
                  key={idx}
                  value={tab.name || ''}
                  disabled={isPending}
                >
                  <span className="flex items-center gap-2">
                    {isPending && tabName === (tab.name || '') ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    {tab.title}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </TabsComponent>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

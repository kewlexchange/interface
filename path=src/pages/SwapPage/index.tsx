import { Tabs, Tab } from '@nextui-org/react';
import {
  Radar,
  ReplaceAll,
  Fan,
  // … diğer icon'lar …
} from 'lucide-react';

export default function SwapPage() {
  return (
    <div className="p-4 bg-neutral-50">
      <Tabs
        disableAnimation
        radius="full"
        classNames={{
          base: "w-full",
          tabList: [
            "bg-white/20 dark:bg-gray-800/20",
            "backdrop-blur-md",
            "p-1",
            "rounded-full",
            "flex justify-center gap-2"
          ].join(" "),
          // Tam daire butonlar:
          tab: [
            "flex flex-col items-center justify-center",
            "w-12 h-12",                    // eşit genişlik-yükseklik
            "rounded-full",                 // daire
            "text-neutral-700 dark:text-neutral-300",
            "transition-colors duration-200",
            "hover:bg-white/30 dark:hover:bg-gray-700/30",
            "data-[selected=true]:bg-gradient-to-tr",
            "data-[selected=true]:from-secondary",
            "data-[selected=true]:to-primary",
            "data-[selected=true]:text-white",
            "relative overflow-hidden"
          ].join(" "),
          tabContent: "relative z-10",
          panel: "mt-6"
        }}
        aria-label="Swap Tabs"
      >
        <Tab key="fusion" title={
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 bg-white/40 rounded-full">
              <Radar className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-semibold">Fusion</span>
          </div>
        }>
          {/* TRADE_TAB */}
        </Tab>

        <Tab key="swap" title={
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 bg-white/40 rounded-full">
              <ReplaceAll className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-semibold">Swap</span>
          </div>
        }>
          {/* SWAP_TAB */}
        </Tab>

        <Tab key="fan" title={
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 bg-white/40 rounded-full">
              <Fan className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-semibold">FAN</span>
          </div>
        }>
          {/* FAN_TAB */}
        </Tab>

        <Tab key="pools" title={
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 bg-white/40 rounded-full">
              <span className="material-symbols-outlined text-secondary">waves</span>
            </div>
            <span className="text-[10px] font-semibold">Pools</span>
          </div>
        }>
          {/* POOL_TAB */}
        </Tab>
      </Tabs>
    </div>
  );
} 
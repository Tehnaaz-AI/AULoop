import { AnimatePresence, motion } from "framer-motion";
import { BellRing } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useStore } from "../store/useStore.js";

export default function ToastStack() {
  const notifications = useStore((state) => state.notifications);
  const { pathname } = useLocation();

  if (["/chat", "/add"].includes(pathname) || pathname.startsWith("/edit")) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 hidden w-80 space-y-2 xl:block">
      <AnimatePresence>
        {notifications.slice(0, 2).map((note) => (
          <motion.div
            key={note}
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass flex items-center gap-3 rounded-[8px] p-3 shadow-soft"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-campus text-white">
              <BellRing size={18} />
            </span>
            <p className="text-sm font-semibold">{note}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

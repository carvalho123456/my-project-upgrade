import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";


const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-ocean-deep/40 text-primary-foreground shadow-elevated flex items-center justify-center backdrop-blur-md border border-ocean-pale/20 hover:bg-ocean-deep/60 transition"
          aria-label="Voltar ao topo"
        >
          <span className="h-3 w-3 rounded-full bg-current" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;

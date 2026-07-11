"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function UploadSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
      >
        <Heart className="h-10 w-10 fill-primary text-primary" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-semibold">Thank you for celebrating with us</h2>
        <p className="text-muted-foreground">
          Your memories have been shared with the bride and groom.
        </p>
      </motion.div>
    </motion.div>
  );
}

'use client';

import React from 'react'
import { motion } from 'framer-motion';

const Docs = () => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 lg:p-6"
    >
        <div></div>

    </motion.div>
  )
}

export default Docs

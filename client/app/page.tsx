"use client";

import HeaderFooter from "@/components/header_footer";
import { motion } from "framer-motion";

export default function Home() {

  return (
    <HeaderFooter>
      <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
        <div className="absolute inset-y-0 left-0 h-full w-px bg-white/10">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 h-full w-px bg-white/10">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-white/10">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </div>

        <div className="px-4 py-10 md:py-20">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-white md:text-4xl lg:text-7xl">
            {"Launch your website in hours, not days"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>

          {/* Animated paragraph with light gray text */}
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.8,
            }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-white/60"
          >
            With AI, you can launch your website in hours, not days. Try our best
            in class, state of the art, cutting edge AI tools to get your website
            up.
          </motion.p>

          {/* Animated buttons */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button className="w-60 transform rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-700">
              Explore Now
            </button>
            <button className="w-60 transform rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10">
              Contact Support
            </button>
          </motion.div>

          {/* Animated image container with glass effect */}
          {/* <motion.div */}
            {/* initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 1.2,
            }}
            className="relative z-10 mt-20 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 shadow-lg"
          > */}
            {/* <div className="w-full overflow-hidden rounded-xl border border-white/20">
              <Image
                src="https://images.unsplash.com/photo-1732008278594-3f3272927445?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Landing page preview"
                className="aspect-[16/9] h-auto w-full object-cover"
                height={1000}
                width={1000}
              />
            </div> */}
          {/* </motion.div> */}
        </div>
      </div>
    </HeaderFooter>
  );
}
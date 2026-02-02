"use client";

import { useState, useRef, useEffect } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";

export default function Home() {
  const [location, setLocation] = useState<string | number>(0);
  const renditionRef = useRef<any>(null);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("epub-location");
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // Save location when it changes
  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    localStorage.setItem("epub-location", loc);
  };

  const customStyles: typeof ReactReaderStyle = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      display: "none",
    },
  };

  const goNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const goPrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  return (
    <div className="bg-[#f5f5f0] h-dvh py-2 px-2 md:py-4 md:px-4">
      <div className="mx-auto max-w-[1200px] h-full flex flex-col">
        <div className="flex-1 bg-white shadow-lg rounded-sm overflow-hidden" style={{ height: "85vh" }}>
          <ReactReader
            url="/COTE-Y3V3.epub"
            location={location}
            locationChanged={handleLocationChange}
            readerStyles={customStyles}
            getRendition={(rendition) => {
              renditionRef.current = rendition;

              // Apply custom styles
              rendition.themes.default({
                body: {
                  "font-family": "Georgia, serif !important",
                  "font-size": "1.25rem !important",
                  "line-height": "1.8 !important",
                  color: "#1a1a1a !important",
                  padding: "1rem 0.75rem !important",
                },
                p: {
                  "margin-bottom": "1.5rem !important",
                  "text-align": "justify !important",
                },
                "h1, h2, h3, h4, h5, h6": {
                  "font-family": "Georgia, serif !important",
                  "margin-top": "2rem !important",
                  "margin-bottom": "1rem !important",
                  "font-weight": "bold !important",
                },
              });

              // Auto-replace "saya" with "aku" and "anda" with "kamu" in displayed content
              rendition.hooks.content.register((contents: any) => {
                const replaceText = (node: Node) => {
                  if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent) {
                      // Replace "Saya" (capital) with "Aku"
                      node.textContent = node.textContent.replace(/Saya/g, "Aku");
                      // Replace "saya" (lowercase) with "aku"
                      node.textContent = node.textContent.replace(/saya/g, "aku");
                      // Replace "Anda" (capital) with "Kamu"
                      node.textContent = node.textContent.replace(/Anda/g, "Kamu");
                      // Replace "anda" (lowercase) with "kamu"
                      node.textContent = node.textContent.replace(/anda/g, "kamu");
                    }
                  } else {
                    node.childNodes.forEach(replaceText);
                  }
                };

                replaceText(contents.document.body);
              });
            }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={goPrev}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-6-6l6-6" />
            </svg>
            Previous
          </button>
          <button
            onClick={goNext}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18l6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

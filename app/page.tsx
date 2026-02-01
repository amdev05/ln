"use client";

import { useState, useRef } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";

export default function Home() {
  const [location, setLocation] = useState<string | number>(0);
  const renditionRef = useRef<any>(null);

  const customStyles: ReactReaderStyle = {
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
    <div className="bg-[#f5f5f0] py-4 px-2 md:py-8 md:px-4">
      <div className="mx-auto max-w-[700px]">
        <div className="bg-white shadow-lg rounded-sm overflow-hidden" style={{ height: "85vh" }}>
          <ReactReader
            url="/COTE-Y3V3.epub"
            location={location}
            locationChanged={(loc: string) => setLocation(loc)}
            readerStyles={customStyles}
            getRendition={(rendition) => {
              renditionRef.current = rendition;
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
            }}
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={goPrev} className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg transition-colors">
            ← Previous
          </button>
          <button onClick={goNext} className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

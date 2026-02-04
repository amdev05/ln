"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactReader, ReactReaderStyle } from "react-reader";

const EPUB_FILES: Record<string, { name: string; path: string }> = {
  y0v0: { name: "Year 0 Volume 0", path: "/COTE-Y0V0.epub" },
  y3v3: { name: "Year 3 Volume 3", path: "/COTE-Y3V3.epub" },
};

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const epub = EPUB_FILES[id];

  const [location, setLocation] = useState<string | number>(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const renditionRef = useRef<any>(null);
  const isRestoringScroll = useRef(false);

  useEffect(() => {
    if (!epub) {
      router.push("/");
      return;
    }
    // Use sessionStorage so it only persists during the same tab session (refresh)
    // When accessing from home (new navigation), it starts fresh
    const savedLocation = sessionStorage.getItem(`epub-location-${id}`);
    const savedScroll = sessionStorage.getItem(`epub-scroll-${id}`);
    if (savedLocation) {
      setLocation(savedLocation);
    }
    if (savedScroll) {
      setScrollPosition(parseInt(savedScroll, 10));
      isRestoringScroll.current = true;
    }
  }, [id, epub, router]);

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    sessionStorage.setItem(`epub-location-${id}`, loc);
  };

  const saveScrollPosition = () => {
    if (renditionRef.current && !isRestoringScroll.current) {
      const contents = renditionRef.current?.getContents();
      if (contents && contents.length > 0) {
        const doc = contents[0].document;
        const scrollTop = doc?.documentElement?.scrollTop || doc?.body?.scrollTop || 0;
        sessionStorage.setItem(`epub-scroll-${id}`, scrollTop.toString());
      }
    }
  };

  const customStyles: typeof ReactReaderStyle = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      display: "none",
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      transition: undefined,
    },
  };

  const goNext = () => {
    if (renditionRef.current) {
      saveScrollPosition();
      renditionRef.current.next();
      // Clear scroll position for new chapter
      sessionStorage.setItem(`epub-scroll-${id}`, "0");
    }
  };

  const goPrev = () => {
    if (renditionRef.current) {
      saveScrollPosition();
      renditionRef.current.prev();
      // Scroll to top after going to previous chapter
      setTimeout(() => {
        const contents = renditionRef.current?.getContents();
        if (contents && contents.length > 0) {
          const doc = contents[0].document;
          if (doc?.documentElement) {
            doc.documentElement.scrollTop = 0;
            if (doc.body) {
              doc.body.scrollTop = 0;
            }
          }
        }
        // Clear scroll position for new chapter
        sessionStorage.setItem(`epub-scroll-${id}`, "0");
      }, 100);
    }
  };

  if (!epub) return null;

  return (
    <div className="bg-[#f5f5f0] h-dvh py-2 px-2 md:py-4 md:px-4">
      <div className="mx-auto max-w-200 pb-14 h-full">
        <div className="h-full shadow-lg rounded-sm overflow-hidden epub-contain">
          <ReactReader
            url={epub.path}
            location={location}
            locationChanged={handleLocationChange}
            readerStyles={customStyles}
            epubOptions={{
              flow: "scrolled",
            }}
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

              rendition.hooks.content.register((contents: any) => {
                let isReplacing = false;

                const replaceText = (node: Node) => {
                  if (isReplacing) return;

                  if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent) {
                      const original = node.textContent;
                      let modified = original;

                      modified = modified.replace(/\bSaya\b/g, "Aku");
                      modified = modified.replace(/\bsaya\b/g, "aku");
                      modified = modified.replace(/\bAnda\b/g, "Kamu");
                      modified = modified.replace(/\banda\b/g, "kamu");

                      if (modified !== original) {
                        isReplacing = true;
                        node.textContent = modified;
                        isReplacing = false;
                      }
                    }
                  } else if (node.childNodes) {
                    node.childNodes.forEach(replaceText);
                  }
                };

                replaceText(contents.document.body);

                const observer = new MutationObserver((mutations) => {
                  if (isReplacing) return;

                  mutations.forEach((mutation) => {
                    if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
                      replaceText(mutation.target);
                    } else if (mutation.type === "childList") {
                      mutation.addedNodes.forEach((node) => {
                        replaceText(node);
                      });
                    }
                  });
                });

                observer.observe(contents.document.body, {
                  childList: true,
                  subtree: true,
                  characterData: true,
                });

                // Restore scroll position after content is loaded
                if (isRestoringScroll.current && scrollPosition > 0) {
                  setTimeout(() => {
                    const doc = contents.document;
                    if (doc?.documentElement) {
                      doc.documentElement.scrollTop = scrollPosition;
                      if (doc.body) {
                        doc.body.scrollTop = scrollPosition;
                      }
                    }
                    isRestoringScroll.current = false;
                  }, 200);
                }

                // Save scroll position on scroll
                const handleScroll = () => {
                  saveScrollPosition();
                };
                contents.document.addEventListener("scroll", handleScroll);
              });
            }}
          />
        </div>
      </div>
      <div className="fixed p-2 z-10 bottom-0 left-0 right-0">
        <div className="max-w-200 mx-auto flex gap-2 mt-2">
          <button
            onClick={goPrev}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-6-6l6-6" />
            </svg>
            Previous
          </button>
          <button onClick={() => router.push("/")} className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-sm shadow-lg transition-colors">
            Home
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

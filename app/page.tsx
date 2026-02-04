"use client";

import Link from "next/link";

const EPUB_FILES = [
  { id: "y0v0", name: "Year 0 Volume 0", path: "/COTE-Y0V0.epub" },
  { id: "y3v3", name: "Year 3 Volume 3", path: "/COTE-Y3V3.epub" },
];

export default function Home() {
  return (
    <div className="bg-[#f5f5f0] min-h-screen py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">EPUB Reader</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {EPUB_FILES.map((epub) => (
            <Link key={epub.id} href={`/read/${epub.id}`} className="bg-white hover:bg-gray-50 p-6 rounded-sm shadow-lg transition-colors cursor-pointer block">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{epub.name}</h2>
              <p className="text-gray-600">Click to read</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

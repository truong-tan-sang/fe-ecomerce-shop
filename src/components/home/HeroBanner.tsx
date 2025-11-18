import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-3 md:gap-4">
      {/* Large image - left 70% */}
      <div className="relative w-full md:w-[70%] aspect-[16/9] md:aspect-[3/2] overflow-hidden bg-gray-100">
        <Image
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
          alt="Featured 1"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 70vw"
          priority
        />
      </div>

      {/* Two smaller images - right 30% stacked */}
      <div className="w-full md:w-[30%] flex flex-row md:flex-col gap-3 md:gap-4">
        <div className="relative w-1/2 md:w-full md:h-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80"
            alt="Featured 2"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 30vw"
          />
        </div>
        <div className="relative w-1/2 md:w-full md:h-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
            alt="Featured 3"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 30vw"
          />
        </div>
      </div>
    </div>
  );
}

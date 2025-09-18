import Accordion from "./Accordion.jsx";

export default function ProductOverview({ overview }) {


    return (
        <Accordion title="פרטי מוצר" defaultOpen={true}>
            <div className="flex flex-col gap-6 w-full">
                <div className="space-y-6">
                    {/* טקסט */}
                    {overview?.text && (
                        <div
                            className="text-[#141414] text-right leading-relaxed space-y-2"
                            dangerouslySetInnerHTML={{ __html: overview.text }}
                        />
                    )}

                    {/* תמונות */}
                    {overview?.images?.length > 0 && (
                        <div className="flex flex-col items-end gap-4">
                            {overview.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`overview-${i}`}
                                    className="rounded-lg object-contain ml-auto"
                                    style={{ maxWidth: "400px", height: "auto" }}
                                    onError={(e) =>
                                        console.warn("Image failed to load:", img)
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {/* וידאו */}
                    {overview?.videos?.length > 0 && (
                        <div className="flex flex-col items-end">
                            {overview.videos.map((vid, i) => (
                                <video
                                    key={i}
                                    controls
                                    className="rounded-lg ml-auto"
                                    style={{ maxWidth: "600px", height: "auto" }}
                                    onError={() =>
                                        console.warn("Video failed to load:", vid)
                                    }
                                >
                                    <source src={vid} type="video/mp4" />
                                    הדפדפן שלך לא תומך בניגון וידאו
                                </video>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Accordion>
    );
}

export default function CludoLayout() {
    const houses = [
        {
            animal: "mustard",
            name: "House of Mustard",
            head: "Queen Claudia Delino (Von Hellman)",
            seat: "Highcliff",
            other: "King Consort Roger Von Hellman, Grand Secretariat Lionel Delino, Genderal Krieger",
            image: "/mustard.png",
            color: "#F59E0B" // amber-500
        },
        {
            animal: "green",
            name: "House of Green",
            head: "Lord Earnest Bergen",
            seat: "Brackenholme",
            image: "/green.png",
            color: "#226d44" // stone-400
        },
        {
            animal: "plum",
            name: "House of Plum",
            head: "Lady Averil Oshika",
            seat: "Stormdale",
            image: "/plum.png",
            color: "#af08c5" // yellow-600
        },
        {
            animal: "peacock",
            name: "House of Peacock",
            head: "Lord Daniel Eber",
            seat: "Redmire",
            image: "/peacock.png",
            color: "#5f4efa" // red-500
        },
        {
            animal: "white",
            name: "House of White",
            head: "Lord Reginald Bouc",
            seat: "Haggard",
            image: "/white.png",
            color: "#fdfdff" // zinc-400
        },
        {
            animal: "scarlett",
            name: "House of Scarlett",
            head: "Aymon Rattigan",
            seat: "Vermire",
            image: "/scarlett.png",
            color: "#EF4444" // red-500
        }
    ];

    return (
        <div>
            <div className="container">
                <div className="row row-cols-2 g-5">
                    {houses.map((house, index) => (
                        <div key={index} className="card-wrapper-centerright">
                            <div className="home-card-wrapper category-people">
                                <div className="home-card-glow"></div>
                                <div className="home-card-inner">
                                    <div className="relative mb-6 flex justify-center items-center" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                        <img src={house.image} alt={house.animal} className="home-card-image" style={{ width: '40%', height: 'auto', display: 'block', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} />
                                    </div>
                                    <div className="home-card-content" style={{ gap: '1rem' }}>
                                        <div style={{ height: '1px', width: '100%', background: `linear-gradient(to right, transparent, ${house.color}80, transparent)` }} />
                                        {/* <h3 style={{ color: house.color, letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{house.animal}</h3> */}
                                        <h2 className="home-card-title" style={{ margin: 0 }}>{house.name}</h2>
                                        {/* <div className="detailBox" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.25rem' }}>
                                            <div className="row1">
                                                <p className="houseDetail" style={{ margin: '0 0 0.25rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Head: <span style={{ color: '#f8fafc' }}>{house.head}</span></p>
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Seat: <span style={{ color: '#f8fafc' }}>{house.seat}</span></p>
                                            </div>
                                            <div className="row2">
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Other People: <span style={{ color: '#f8fafc' }}>{house.other}</span></p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
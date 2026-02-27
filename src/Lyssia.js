export default function Lyssia() {
    const houses = [
        {
            animal: "Lions",
            name: "House Delino",
            head: "Queen Claudia Delino (Von Hellman)",
            seat: "Highcliff",
            other: "King Consort Roger Von Hellman, Grand Secretariat Lionel Delino, Genderal Krieger",
            image: "/Lion.png",
            color: "#F59E0B" // amber-500
        },
        {
            animal: "Wolves",
            name: "House Villnueve",
            head: "Princess Cruella Villnueve (Deville)",
            seat: "Shadowhaven",
            other: "Samantha Villnueve, General Jasper, General Horace",
            image: "/Wolf.png",
            color: "#CBD5E1" // slate-300
        },
        {
            animal: "Bears",
            name: "House Bergen",
            head: "Lord Earnest Bergen",
            seat: "Brackenholme",
            image: "/Bear.png",
            color: "#226d44" // stone-400
        },
        {
            animal: "Stags",
            name: "House",
            head: "Lady Averil Oshika",
            seat: "Stormdale",
            image: "/Stag.png",
            color: "#af08c5" // yellow-600
        },
        {
            animal: "Foxes",
            name: "House Zorro",
            head: "Lord Fennec Zorro",
            seat: "Hedgemoor",
            image: "/Fox.png",
            color: "#F97316" // orange-500
        },
        {
            animal: "Boars",
            name: "House",
            head: "Lord Daniel Eber",
            seat: "Redmire",
            image: "/Boar.png",
            color: "#5f4efa" // red-500
        },
        {
            animal: "Rams",
            name: "House",
            head: "Lord Reginald Bouc",
            seat: "Haggard",
            image: "/Ram.png",
            color: "#fdfdff" // zinc-400
        },
        {
            animal: "Rats",
            name: "House Rattigan",
            head: "Aymon Rattigan",
            seat: "Vermire",
            image: "/Rat.png",
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
                                        <h3 style={{ color: house.color, letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{house.animal}</h3>
                                        <h2 className="home-card-title" style={{ margin: 0 }}>{house.name}</h2>
                                        <div className="detailBox" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.25rem' }}>
                                            <div className="row1">
                                                <p className="houseDetail" style={{ margin: '0 0 0.25rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Head: <span style={{ color: '#f8fafc' }}>{house.head}</span></p>
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Seat: <span style={{ color: '#f8fafc' }}>{house.seat}</span></p>
                                            </div>
                                            <div className="row2">
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Other People: <span style={{ color: '#f8fafc' }}>{house.other}</span></p>
                                            </div>
                                        </div>
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
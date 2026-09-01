export default function StoriaLayout() {
    const houses = [
        {
            animal: "dragon",
            name: "House Pendragon",
            head: "Leo Pendragon",
            seat: "Dragonskeep",
            image: "/pendragon.png",
            color: "#f50b0b",
            region: "The Highlands"
        },
        {
            animal: "Wolves",
            name: "House Lefay",
            head: "Valmont Lefay",
            seat: "Greystone Keep",
            image: "/lefay.png",
            color: "#0351b1" ,
            region: "The Outlands"
        },
        {
            animal: "stag",
            name: "House Tremaine",
            head: "Ralph Tremaine",
            seat: "Gadleigh Castle",
            image: "/tremaine.png",
            color: "#226d44",
            region: "The Bridge" 
        },
        {
            animal: "axe",
            name: "House Belfrey",
            head: "Claude Belfrey",
            seat: "Howlester Fort",
            image: "/belfrey.png",
            color: "#fceb00",
            region: "Eastmarch"
        },
        {
            animal: "heart",
            name: "House Gothel",
            head: "Eloise Gothel",
            seat: "Blackspire",
            image: "/gothel.png",
            color: "#030100",
            region: "Westreach"
        },
        {
            animal: "sun",
            name: "House Mergen",
            head: "Randolph Mergen",
            seat: "Solara",
            image: "/mergen.png",
            color: "#fbfbff",
            region: "Agrabah" 
        },
        {
            animal: "moon",
            name: "House Swaly",
            head: "Maude Swaly",
            seat: "Himeji Castle",
            image: "/swaly.png",
            color: "#6f0ba8",
            region: "The Frostwood"
        },
        {
            animal: "fish",
            name: "House Gowen",
            head: "Evelyn Gowen",
            seat: "Longdale Castle",
            image: "/gowen.png",
            color: "#703a08",
            region: "The Riverward"
        },
        {
            animal: "flower",
            name: "House Olophant",
            head: "Reginald Olophant",
            seat: "Scatterby Castle",
            image: "/olophant.png",
            color: "#ec87cb",
            region: "The Storm Coast"
        },
        {
            animal: "dove",
            name: "House Aldridge",
            head: "Helena Aldridge",
            seat: "Bellton Keep",
            image: "/aldridge.png",
            color: "#703a08",
            region: "The Greenheart"
        },
        {
            animal: "raven",
            name: "House Ganondorf (Former)",
            head: "Phineas Ganondorf",
            seat: "Hyrule Manor",
            image: "/ganondorf.png",
            color: "#174e23",
            region: "The Greenheart"
        },
        {
            animal: "trident",
            name: "House Atlantica",
            head: "Triton Atlantica",
            seat: "Atlantis",
            image: "/atlantica.png",
            color: "#1ba095",
            region: "The Sea"
        }
    ];
    return(
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
                                        <h2 className="home-card-title" style={{ margin: 0 }}>{house.name}</h2>
                                        <div className="detailBox" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.25rem' }}>
                                            <div className="row1">
                                                <p className="houseDetail" style={{ margin: '0 0 0.25rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Head: <span style={{ color: '#f8fafc' }}>{house.head}</span></p>
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Seat: <span style={{ color: '#f8fafc' }}>{house.seat}</span></p>
                                            </div>
                                            <div className="row2">
                                                <p className="houseRegion" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Region: <span style={{ color: '#f8fafc' }}>{house.region}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>  
            
                                <div style={{ margin: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <img src="/storiafinalcopy.png" alt="map" className="home-card-image" style={{ width: '80%', height: 'auto', display: 'block', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} />
                                </div>
                                    
        </div>
    );
}
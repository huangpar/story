import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';
import './home.css';

const categories = [
    {
        id: 1,
        title: 'Politics',
        cssClass: 'category-politics',
        path: '/politics',
    },
    {
        id: 2,
        title: 'Entertainment',
        cssClass: 'category-entertainment',
        path: '/entertainment',
    },
    {
        id: 3,
        title: 'People',
        cssClass: 'category-people',
        path: '/people',
    },
    {
        id: 4,
        title: 'Education',
        cssClass: 'category-education',
        path: '/education',
    },
];

export function Home() {
    return (
        <div className="home">
            <main className="home">
                <div className="bg-layer">
                    <div className="bg-wash"></div>
                    <div className="orb orb-amber"></div>
                    <div className="orb orb-purple"></div>
                </div>
                <h1 className="header">
                    <div className="header-center">
                        <div className="deco"></div>
                        <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                        <div className="deco"></div>
                    </div>

                </h1>
                <div className="container" style={{ marginTop: '50px' }}>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                        {categories.map((category) => (
                            <div key={category.id} className="col">
                                <Link to={category.path} style={{ textDecoration: 'none' }}>
                                    <div className={`home-card-wrapper ${category.cssClass}`}>
                                        {/* Premium glow effect */}
                                        <div className="home-card-glow"></div>

                                        {/* Main card */}
                                        <div className="home-card-inner">
                                            <div className="home-card-content">
                                                {/* Luxury icon circle */}
                                                <div className="home-card-icon-circle">
                                                    <div className="home-card-icon-glow"></div>
                                                    <Star className="home-card-icon" />
                                                </div>

                                                {/* Title */}
                                                <h2 className="home-card-title">
                                                    {category.title}
                                                </h2>

                                                {/* Elegant divider */}
                                                <div className="home-card-divider">
                                                    <div className="divider-line divider-line-left"></div>
                                                    <Star className="divider-star" />
                                                    <div className="divider-line divider-line-right"></div>
                                                </div>

                                                {/* Hover text */}
                                                <p className="home-card-enter">
                                                    Enter
                                                </p>
                                            </div>

                                            {/* Corner accents */}
                                            <div className="corner-accent corner-tr"></div>
                                            <div className="corner-accent corner-bl"></div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
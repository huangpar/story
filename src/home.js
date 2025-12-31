import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';

export function Home() {
    return (
        <div className="home">
            <main className="home">
                <h1 className="header"> 
                    <div className="header-center">
                        <Sparkles size={35} color="#EAB308" />
                        <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                        <Sparkles size={35} color="#EC4899" />
                    </div>
                    <Link to="/add" className="addPerson">
                        <Users className="users" size={30} color="#ffffffff"/>
                    </Link>
                </h1>
                <div className="container">
                    <div className="row row-cols-1 row-cols-md-4 g-3">
                        <div className="col p-3 card-wrapper-left">
                            <Link to="/politics">
                                <div className="card rotate-left">
                                    <div className="card-body">
                                        <div className="circle"><Sparkles className="sparkle" /></div>
                                        <h5 className="card-title">Politics</h5>
                                        <div className="divider">
                                            <div className="dash"></div>
                                            <div className="diamond">✦</div>
                                            <div className="dash"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="col p-3 card-wrapper-centerleft">
                            <Link to="/entertainment">
                                <div className="card rotate-centerleft">
                                    <div className="card-body">
                                        <div className="circle"><Sparkles className="sparkle"/></div>
                                        <h5 className="card-title">Entertainment</h5>
                                        <div className="divider">
                                            <div className="dash"></div>
                                            <div className="diamond">✦</div>
                                            <div className="dash"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="col p-3 card-wrapper-centerright">
                            <Link to="/people">
                                <div className="card rotate-centerright">
                                    <div className="card-body">
                                        <div className="circle"><Sparkles className="sparkle"/></div>
                                        <h5 className="card-title">People</h5>
                                        <div className="divider">
                                            <div className="dash"></div>
                                            <div className="diamond">✦</div>
                                            <div className="dash"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="col p-3 card-wrapper-right">
                            <Link to="/education">
                                <div className="card rotate-right">
                                    <div className="card-body">
                                        <div className="circle"><Sparkles className="sparkle"/></div>
                                        <h5 className="card-title">Education</h5>
                                        <div className="divider">
                                            <div className="dash"></div>
                                            <div className="diamond">✦</div>
                                            <div className="dash"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
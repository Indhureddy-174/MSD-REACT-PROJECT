import React, { useEffect, useState } from "react";
import Button from "./components/Button.jsx";
import "./App.css";

/*
  Full conversion of original HTML -> React.
  - Put images in public/images/ (login.jpg, signup.jpg, info.jpg, buyer-dashboard.jpg,
    seller-dashboard.jpg, profile.jpg, area.jpg, integration.jpg, contact.jpg)
*/

export default function App() {
  // ---------- App state ----------
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("users")) || {};
    } catch {
      return {};
    }
  });

  const [currentUser, setCurrentUser] = useState(() => sessionStorage.getItem("user") || "");
  const [currentRole, setCurrentRole] = useState(() => sessionStorage.getItem("role") || "");
  const [section, setSection] = useState(() => {
    const u = sessionStorage.getItem("user");
    const r = sessionStorage.getItem("role");
    if (u && r === "buyer") return "buyer-dashboard";
    if (u && r === "seller") return "seller-dashboard";
    return "login";
  });

  // Buyer state
  const [buyerLocation, setBuyerLocation] = useState("");
  const [buyerMaxPrice, setBuyerMaxPrice] = useState("");
  const [buyerPropertyType, setBuyerPropertyType] = useState("");
  const [searchResultsText, setSearchResultsText] = useState("");

  // Favorites: object mapping username -> array
  const [favoritesObj, setFavoritesObj] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || {};
    } catch {
      return {};
    }
  });
  const [favoriteList, setFavoriteList] = useState([]);

  // Seller listings: per-user stored under localStorage 'listings'
  const [listingsObj, setListingsObj] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("listings")) || {};
    } catch {
      return {};
    }
  });
  const [listingsForUser, setListingsForUser] = useState(() => ["2BHK Apartment in Hyderabad"]);

  // Seller fields
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [propertyImage, setPropertyImage] = useState(null);
  const [propertyLocation, setPropertyLocation] = useState("");

  // Area
  const [areaType, setAreaType] = useState("Urban");
  const [areaResult, setAreaResult] = useState("");

  // load favorites & listings when user changes
  useEffect(() => {
    if (currentUser) {
      const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
      setFavoritesObj(favs);
      setFavoriteList(favs[currentUser] ? [...favs[currentUser]] : []);
      const all = JSON.parse(localStorage.getItem("listings") || "{}");
      setListingsObj(all);
      setListingsForUser(all[currentUser] ? [...all[currentUser]] : ["2BHK Apartment in Hyderabad"]);
    } else {
      setFavoriteList([]);
      setListingsForUser(["2BHK Apartment in Hyderabad"]);
    }
  }, [currentUser]);

  // keep users saved when changed
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // keep favorites saved when favoritesObj changes
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favoritesObj));
    if (currentUser) setFavoriteList(favoritesObj[currentUser] ? [...favoritesObj[currentUser]] : []);
  }, [favoritesObj]);

  // keep listings saved when listingsObj changes
  useEffect(() => {
    localStorage.setItem("listings", JSON.stringify(listingsObj));
    if (currentUser) setListingsForUser(listingsObj[currentUser] ? [...listingsObj[currentUser]] : ["2BHK Apartment in Hyderabad"]);
  }, [listingsObj]);

  // ---------- AUTH ----------
  // Signup (mimics original: overwrites if same username)
  const signup = (username, password, role) => {
    username = (username || "").trim();
    password = (password || "").trim();
    role = role || "buyer";
    if (!username || !password) {
      alert("Please enter all details.");
      return;
    }
    const next = { ...users, [username]: { password, role } };
    setUsers(next);
    localStorage.setItem("users", JSON.stringify(next));
    alert("Signup successful! Please login.");
    setSection("login");
  };

  // Login
  const login = (username, password) => {
    username = (username || "").trim();
    password = (password || "").trim();
    const userObj = users[username];
    if (userObj && userObj.password === password) {
      sessionStorage.setItem("user", username);
      sessionStorage.setItem("role", userObj.role);
      setCurrentUser(username);
      setCurrentRole(userObj.role);
      if (userObj.role === "buyer") setSection("buyer-dashboard");
      else if (userObj.role === "seller") setSection("seller-dashboard");
      else setSection("info");
      // load favorites & listings automatically via effect
    } else {
      alert("Invalid username or password.");
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setCurrentUser("");
    setCurrentRole("");
    setSection("login");
    setBuyerLocation("");
    setBuyerMaxPrice("");
    setBuyerPropertyType("");
    setSearchResultsText("");
  };

  // ---------- NAV ----------
  const navigate = (target) => {
    setSection(target);
    if (target === "profile") loadFavorites();
  };

  // ---------- AREA ----------
  const registerArea = () => {
    setAreaResult(`✅ Registered for updates in ${areaType} areas.`);
  };

  // ---------- FAVORITES ----------
  const addFavoriteProperty = (propertyName) => {
    if (!currentUser) {
      alert("Please login to save favorites.");
      return;
    }
    const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
    if (!favs[currentUser]) favs[currentUser] = [];
    if (favs[currentUser].indexOf(propertyName) === -1) {
      favs[currentUser].push(propertyName);
      setFavoritesObj(favs);
      alert("Added to favorites.");
    } else {
      // already present
    }
  };

  const saveFavorite = () => {
    if (!currentUser) {
      alert("Please login to save favorites.");
      return;
    }
    const location = buyerLocation.trim();
    const pType = buyerPropertyType || "Sample Property";
    const favoriteName = `${pType} in ${location || "specified location"}`;
    const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
    if (!favs[currentUser]) favs[currentUser] = [];
    if (favs[currentUser].indexOf(favoriteName) === -1) {
      favs[currentUser].push(favoriteName);
      setFavoritesObj(favs);
      alert("Property saved to favorites.");
    } else {
      alert("This property is already in your favorites.");
    }
  };

  const loadFavorites = () => {
    if (!currentUser) return;
    const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
    setFavoriteList(favs[currentUser] ? [...favs[currentUser]] : []);
  };

  // ---------- BUYER SEARCH ----------
  const searchProperties = () => {
    const location = buyerLocation.trim();
    const maxPrice = buyerMaxPrice;
    const pType = buyerPropertyType;
    if (pType === "Plot") {
      addFavoriteProperty("Plot in " + (location || "specified location"));
      setSearchResultsText("Plot property added to favorites automatically.");
      loadFavorites();
      return;
    }
    if (!location && !maxPrice && !pType) {
      setSearchResultsText("Please enter search criteria.");
      return;
    }
    // Dummy search
    const results = [
      `${pType || "Any"} property in ${location || "any location"} under ₹${maxPrice || "any price"}`,
      "3BHK House in Mumbai - ₹50,00,000",
      "2BHK Apartment in Hyderabad - ₹35,00,000"
    ];
    setSearchResultsText(results.join("\n"));
  };

  const sendEnquiry = () => {
    alert("Enquiry sent to the seller. They will contact you soon.");
  };

  // ---------- SELLER LISTINGS ----------
  const loadSellerListings = () => {
    const all = JSON.parse(localStorage.getItem("listings") || "{}");
    setListingsObj(all);
    if (currentUser && all[currentUser]) setListingsForUser([...all[currentUser]]);
    else setListingsForUser(["2BHK Apartment in Hyderabad"]);
  };

  const addProperty = () => {
    const title = propertyTitle.trim();
    const description = propertyDescription.trim();
    const price = propertyPrice.trim();
    const type = propertyType;
    const location = propertyLocation.trim();
    if (!title || !description || !price || !type || !location) {
      alert("Please fill all property details.");
      return;
    }
    const listingStr = `${title} in ${location}`;
    const all = JSON.parse(localStorage.getItem("listings") || "{}");
    if (!currentUser) {
      alert("Please login as seller to add properties.");
      return;
    }
    if (!all[currentUser]) all[currentUser] = [];
    all[currentUser].push(listingStr);
    localStorage.setItem("listings", JSON.stringify(all));
    setListingsObj(all);
    setListingsForUser([...all[currentUser]]);
    alert("Property added successfully!");
    // clear fields
    setPropertyTitle("");
    setPropertyDescription("");
    setPropertyPrice("");
    setPropertyType("");
    setPropertyImage(null);
    setPropertyLocation("");
  };

  const updateListing = (index) => {
    const row = listingsForUser[index];
    const newTitle = prompt("Update property title and location:", row);
    if (newTitle && newTitle.trim() !== "") {
      const next = [...listingsForUser];
      next[index] = newTitle.trim();
      const all = JSON.parse(localStorage.getItem("listings") || "{}");
      all[currentUser] = next;
      localStorage.setItem("listings", JSON.stringify(all));
      setListingsForUser(next);
      setListingsObj(all);
    }
  };

  const deleteListing = (index) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    const next = [...listingsForUser];
    next.splice(index, 1);
    const all = JSON.parse(localStorage.getItem("listings") || "{}");
    all[currentUser] = next;
    localStorage.setItem("listings", JSON.stringify(all));
    setListingsForUser(next);
    setListingsObj(all);
    alert("Listing deleted.");
  };

  // ---------- SMALL PRESENTATIONAL COMPONENTS IN-LINE ----------
  const Navbar = () => (
    <nav id="navbar" className={currentUser ? "" : "hidden"}>
      <div className="logo">🏠 Real Estate</div>
      <div className="nav-links" id="nav-links">
        <a href="#!" onClick={(e) => { e.preventDefault(); navigate("info"); }}>Info</a>
        {currentRole === "buyer" && <a href="#!" onClick={(e) => { e.preventDefault(); navigate("buyer-dashboard"); }}>Buyer Dashboard</a>}
        {currentRole === "seller" && <a href="#!" onClick={(e) => { e.preventDefault(); navigate("seller-dashboard"); }}>Seller Dashboard</a>}
        <a href="#!" onClick={(e) => { e.preventDefault(); navigate("profile"); }}>Profile</a>
        <a href="#!" onClick={(e) => { e.preventDefault(); navigate("area"); }}>Area</a>
        <a href="#!" onClick={(e) => { e.preventDefault(); navigate("integration"); }}>Integration</a>
        <a href="#!" onClick={(e) => { e.preventDefault(); navigate("contact"); }}>Contact Seller</a>
        <a href="#!" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
      </div>
    </nav>
  );

  const LoginCard = () => {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    return (
      <div id="login">
        <div className="card">
          <h2>Login</h2>
          <input type="text" id="username" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} />
          <input type="password" id="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <Button onClick={() => login(user, pass)}>Login</Button>
          <p>Don't have an account? <a href="#!" onClick={(e) => { e.preventDefault(); setSection("signup"); }}>Sign Up</a></p>
          <img src="/images/login.jpg" alt="Login" />
        </div>
      </div>
    );
  };

  const SignupCard = () => {
    const [newUser, setNewUser] = useState("");
    const [newPass, setNewPass] = useState("");
    const [newRole, setNewRole] = useState("buyer");
    return (
      <div id="signup">
        <div className="card">
          <h2>Sign Up</h2>
          <input type="text" id="new-username" placeholder="Choose Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
          <input type="password" id="new-password" placeholder="Choose Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <select id="new-role" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          <Button onClick={() => signup(newUser, newPass, newRole)}>Sign Up</Button>
          <p>Already have an account? <a href="#!" onClick={(e) => { e.preventDefault(); setSection("login"); }}>Login</a></p>
          <img src="/images/signup.jpg" alt="Sign Up" />
        </div>
      </div>
    );
  };

  const InfoCard = () => (
    <div id="info">
      <div className="card">
        <h2>ℹ️ Real Estate Information</h2>
        <h3>🗺️ Land Types</h3>
        <ul>
          <li><strong>Residential Land:</strong> For homes, apartments, and communities.</li>
          <li><strong>Commercial Land:</strong> For shops, offices, and business centers.</li>
          <li><strong>Agricultural Land:</strong> Farms, crops, and rural development.</li>
        </ul>
        <h3>🏘️ Property Categories</h3>
        <ul>
          <li>Houses & Villas</li>
          <li>Apartments/Flats</li>
          <li>Shops & Offices</li>
          <li>Plots</li>
        </ul>
        <h3>🛠️ How It Works</h3>
        <ol>
          <li><strong>Login:</strong> Secure login for buyers and sellers.</li>
          <li><strong>View Properties:</strong> Browse and shortlist listings.</li>
          <li><strong>Contact Sellers:</strong> Communicate directly for deals.</li>
          <li><strong>Area Registration:</strong> Subscribe to area alerts.</li>
          <li><strong>Manage Listings:</strong> Sellers can edit and track properties.</li>
        </ol>
        <img src="/images/info.jpg" alt="Info" />
      </div>
    </div>
  );

  const BuyerDashboard = () => (
    <div id="buyer-dashboard">
      <div className="card">
        <h2>Welcome Buyer 👨‍💼</h2>
        <img src="/images/buyer-dashboard.jpg" alt="Buyer Dashboard" />
        <p>Explore properties, save favorites, and connect with sellers instantly.</p>

        <h3>🔎 Search Properties</h3>
        <input type="text" id="buyer-location" placeholder="Location" value={buyerLocation} onChange={(e) => setBuyerLocation(e.target.value)} />
        <input type="number" id="buyer-maxprice" placeholder="Max Price" value={buyerMaxPrice} onChange={(e) => setBuyerMaxPrice(e.target.value)} />
        <select id="buyer-property-type" value={buyerPropertyType} onChange={(e) => setBuyerPropertyType(e.target.value)}>
          <option value="">Property Type</option>
          <option value="House">House</option>
          <option value="Plot">Plot</option>
          <option value="Apartment">Apartment</option>
          <option value="Commercial">Commercial</option>
          <option value="Agricultural">Agricultural</option>
        </select>
        <Button onClick={searchProperties}>Search</Button>

        <div id="search-results" style={{ whiteSpace: "pre-line", marginTop: 10 }}>{searchResultsText}</div>

        <h3>⭐ Featured Listings</h3>
        <p>View top-rated and trending properties in your area.</p>

        <h3>❤️ Save Favorite Properties</h3>
        <Button onClick={saveFavorite}>Save to Favorites</Button>
        <p>Saved properties will appear in your profile.</p>

        <h3>📞 Contact Seller</h3>
        <Button onClick={sendEnquiry}>Send Enquiry</Button>

        <h3>🔔 Notifications</h3>
        <ul>
          <li>New property added in your area.</li>
          <li>Price dropped for your saved property.</li>
          <li>Seller replied to your enquiry.</li>
        </ul>
      </div>
    </div>
  );

  const SellerDashboard = () => (
    <div id="seller-dashboard">
      <div className="card">
        <h2>Seller Dashboard 👩‍💼</h2>
        <img src="/images/seller-dashboard.jpg" alt="Seller Dashboard" />
        <p>Manage your property listings, respond to buyers, and track performance.</p>

        <h3>🏡 Insert New Property</h3>
        <input type="text" id="property-title" placeholder="Title" value={propertyTitle} onChange={(e) => setPropertyTitle(e.target.value)} />
        <textarea id="property-description" placeholder="Description" value={propertyDescription} onChange={(e) => setPropertyDescription(e.target.value)} />
        <input type="number" id="property-price" placeholder="Price" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} />
        <select id="property-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="">Property Type</option>
          <option value="House">House</option>
          <option value="Plot">Plot</option>
          <option value="Apartment">Apartment</option>
          <option value="Commercial">Commercial</option>
          <option value="Agricultural">Agricultural</option>
        </select>
        <input type="file" id="property-image" onChange={(e) => setPropertyImage(e.target.files?.[0] || null)} />
        <input type="text" id="property-location" placeholder="Location" value={propertyLocation} onChange={(e) => setPropertyLocation(e.target.value)} />
        <Button onClick={addProperty}>Add Property</Button>

        <h3>⚙️ Manage Listings</h3>
        <table>
          <thead><tr><th>Property</th><th>Action</th></tr></thead>
          <tbody id="listings-body">
            {listingsForUser && listingsForUser.length > 0 ? listingsForUser.map((prop, idx) => (
              <tr key={idx}>
                <td>{prop}</td>
                <td>
                  <Button onClick={() => updateListing(idx)}>Update</Button>
                  <Button onClick={() => deleteListing(idx)}>Delete</Button>
                </td>
              </tr>
            )) : <tr><td colSpan={2}>No listings yet.</td></tr>}
          </tbody>
        </table>

        <h3>📩 Buyer Enquiries</h3>
        <ul>
          <li>Ravi Kumar: Interested in 2BHK Apartment.</li>
          <li>Anjali Sharma: Asked for price negotiation.</li>
        </ul>

        <h3>📊 Sales Analytics</h3>
        <p>Views: 120 | Buyer Interests: 15 | Successful Deals: 3</p>
      </div>
    </div>
  );

  const ProfileCard = () => (
    <div id="profile">
      <div className="card">
        <h2>Your Profile</h2>
        <img src="/images/profile.jpg" alt="Profile" />
        <p><strong>Username:</strong> <span id="profile-username">{currentUser || "—"}</span></p>
        <p><strong>Role:</strong> <span id="profile-role">{currentRole || "—"}</span></p>
        <h3>Saved Favorites:</h3>
        <ul id="favorite-properties">
          {favoriteList && favoriteList.length > 0 ? favoriteList.map((f, i) => (<li key={i}>{f}</li>)) : <li>No favorites yet.</li>}
        </ul>
      </div>
    </div>
  );

  const AreaCard = () => (
    <div id="area">
      <div className="card">
        <h2>Area Type Registration</h2>
        <label htmlFor="area-select">Choose an area type:</label>
        <select id="area-select" value={areaType} onChange={(e) => setAreaType(e.target.value)}>
          <option value="Urban">Urban</option>
          <option value="Suburban">Suburban</option>
          <option value="Rural">Rural</option>
        </select>
        <Button onClick={registerArea}>Register Area</Button>
        <p id="area-result">{areaResult}</p>
        <img src="/images/area.jpg" alt="Area Registration" />
      </div>
    </div>
  );

  const IntegrationCard = () => (
    <div id="integration">
      <div className="card">
        <h2>🔗 System Integrations</h2>
        <h3>🗺️ Google Maps API</h3>
        <p>View property location and nearby amenities.</p>
        <iframe
          title="google-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5091639999996!2d78.38256721487758!3d17.447753488042797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93e01c9f62ed%3A0x9a6c2b7b4c7c9ad!2sHyderabad!5e0!3m2!1sen!2sin!4v1663333333333"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
        />
        <h3>💳 Payment Gateway</h3>
        <p>Secure payments through Razorpay, Stripe, etc.</p>
        <h3>📢 SMS/Email Notifications</h3>
        <p>Get real-time updates for listings, offers, and appointments.</p>
        <h3>📂 Real-Time Listings</h3>
        <p>Automatic property data sync from trusted platforms.</p>
        <img src="/images/integration.jpg" alt="Integration" />
      </div>
    </div>
  );

  const ContactCard = () => (
    <div id="contact">
      <div className="card">
        <h2>Contact Seller</h2>
        <p><strong>Name:</strong> John Realtor</p>
        <p><strong>Email:</strong> johnrealtor@example.com</p>
        <p><strong>Phone:</strong> +91-9876543210</p>
        <img src="/images/contact.jpg" alt="Contact Seller" />
      </div>
    </div>
  );

  // ---------- RENDER ----------
  return (
    <>
      <Navbar />

      <div className="container">
        {!currentUser && section === "login" && <LoginCard />}
        {!currentUser && section === "signup" && <SignupCard />}

        {section === "info" && <InfoCard />}

        {section === "buyer-dashboard" && currentRole === "buyer" && <BuyerDashboard />}
        {section === "seller-dashboard" && currentRole === "seller" && <SellerDashboard />}

        {section === "profile" && <ProfileCard />}
        {section === "area" && <AreaCard />}
        {section === "integration" && <IntegrationCard />}
        {section === "contact" && <ContactCard />}
      </div>
      {/* ✅ Copyright Footer */}
      <footer
  style={{
    textAlign: "center",
    marginTop: "20px",
    padding: "10px",
    fontSize: "14px",
    color: "white",
    fontWeight: "bold",
  }}
>
  © {new Date().getFullYear()} Real Estate Management System. All rights reserved.
</footer>

      </>
  );
}


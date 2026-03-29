from flask import *
from flask_cors import *
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)
api = "https://www.omdbapi.com/?t="
key = "&apikey=7de076f4"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///movies.db"
db = SQLAlchemy(app)

CORS(app)


@app.route('/',methods=['GET'])
def home():
    from home_DB import Movie
    movies = Movie.query.all()
    res = []
    for m in movies:
        res.append({"name":m.name,"year":m.year,"poster":m.poster})
    return jsonify(res)


@app.route('/<name>',methods = ['GET'])
def get_movie(name):
    from home_DB import Movie
    res = requests.get(api + name + key)
    data = res.json()

    if data.get("Response") == "False":
        return jsonify({"error": data.get("Error", "Movie not found")}), 404

    existing = Movie.query.filter_by(name=data.get("Title", name)).first()
    if not existing:
        mov = Movie(data["Title"],data["Year"],data["Poster"])
        mov.add_movie()
        
    from home_DB import Rating
    rating_entry = Rating.query.filter_by(name=data.get("Title", name)).first()
    user_rating = rating_entry.stars if rating_entry else 0
        
    return jsonify({
        "Title":data.get("Title"),"actors":data.get("Actors"),"director":data.get("Director"),
        "year":data.get("Year"),"poster":data.get("Poster"),"title":data.get("Title"),
        "plot":data.get("Plot"),"imdbRating":data.get("imdbRating"),"genre":data.get("Genre"),
        "userRating": user_rating
    })


@app.route('/watch_later/<name>',methods = ["POST"])
def watch_later(name):
    from home_DB import WatchLater
    res = requests.get(api+name+key)
    data = res.json()
    if data.get("Response") == "False":
        return jsonify({"error": data.get("Error", "Movie not found")}), 404
    
    existing = WatchLater.query.filter_by(name=data.get("Title", name)).first()
    if not existing:
        mov = WatchLater(data["Title"],data["Year"],data["Poster"])
        mov.add_movie()
    return jsonify({"message":"Movie added to wishlist"})
    

@app.route('/watch_later', methods=['GET'])
def get_watch_later():
    from home_DB import WatchLater
    movies = WatchLater.query.all()
    res = []
    for m in movies:
        res.append({"name":m.name, "year":m.year, "poster":m.poster})
    return jsonify(res)

@app.route('/search_api', methods=['GET'])
def search_api():
    query = request.args.get('q', '').strip()
    media_type = request.args.get('type', '')
    genre = request.args.get('genre', '').lower()
    
    import random
    import math
    import concurrent.futures

    if not query:
        words = ["the", "man", "star", "world", "day", "love", "time", "boy", "girl", "black", "red", "life", "super", "hero"]
        query = random.choice(words)
        
    filtered_results = []
    seen_ids = set()
    target_count = 15

    def fetch_page(p):
        url = f"https://www.omdbapi.com/?s={query}&page={p}&apikey=7de076f4"
        if media_type:
            url += f"&type={media_type}"
        try:
            return requests.get(url, timeout=3).json()
        except:
            return {}

    def get_detail(item):
        imdb_id = item.get("imdbID")
        if not imdb_id:
            return None
            
        if not genre:
            return {
                "name": item.get("Title"),
                "year": item.get("Year"),
                "poster": item.get("Poster"),
                "type": item.get("Type"),
                "imdbID": imdb_id
            }
        
        detail_url = f"https://www.omdbapi.com/?i={imdb_id}&apikey=7de076f4"
        try:
            detail_data = requests.get(detail_url, timeout=3).json()
            if detail_data.get("Response") != "False":
                item_genres = [g.strip().lower() for g in detail_data.get("Genre", "").split(",")]
                if genre in item_genres:
                    return {
                        "name": item.get("Title"),
                        "year": item.get("Year"),
                        "poster": item.get("Poster"),
                        "type": item.get("Type"),
                        "imdbID": imdb_id
                    }
        except:
            pass
        return None

    # Fetch page 1
    first_page_data = fetch_page(1)
    if first_page_data.get("Response") == "False":
        return jsonify([])

    total_results = int(first_page_data.get("totalResults", 0))
    all_search_items = first_page_data.get("Search", [])
    
    # Calculate how many extra pages to fetch. 
    # Fetching up to 10 total pages gives us 100 items which is usually enough to find 30 matching a genre.
    total_pages = math.ceil(total_results / 10.0)
    pages_to_fetch = min(total_pages, 10) 
    
    if pages_to_fetch > 1:
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_page = {executor.submit(fetch_page, p): p for p in range(2, pages_to_fetch + 1)}
            for future in concurrent.futures.as_completed(future_to_page):
                data = future.result()
                if data.get("Response") != "False":
                    all_search_items.extend(data.get("Search", []))
                    
    unique_items = []
    for item in all_search_items:
        imdb_id = item.get("imdbID")
        if imdb_id and imdb_id not in seen_ids:
            seen_ids.add(imdb_id)
            unique_items.append(item)
            
    # Concurrently fetch details for all accumulated unique items
    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
        futures = [executor.submit(get_detail, item) for item in unique_items]
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                filtered_results.append(res)
                if len(filtered_results) >= target_count:
                    break
                    
    return jsonify(filtered_results)

@app.route('/rate/<name>', methods=['POST'])
def rate_movie(name):
    from home_DB import Rating
    req_data = request.json or {}
    stars = req_data.get("stars", 0)
    
    res = requests.get(api + name + key)
    data = res.json()
    if data.get("Response") == "False":
        return jsonify({"error": data.get("Error", "Movie not found")}), 404
        
    title = data.get("Title", name)
    year = data.get("Year", "N/A")
    poster = data.get("Poster", "N/A")
    
    try:
        year_int = int(year[:4])
    except:
        year_int = 0

    existing = Rating.query.filter_by(name=title).first()
    if existing:
        existing.stars = stars
        db.session.commit()
    else:
        new_rating = Rating(title, year_int, poster, stars)
        new_rating.save()
        
    return jsonify({"message": "Rated successfully", "stars": stars})

@app.route('/ratings', methods=['GET'])
def get_ratings():
    from home_DB import Rating
    stars_filter = request.args.get('stars', type=int)
    
    if stars_filter:
        ratings = Rating.query.filter_by(stars=stars_filter).all()
    else:
        ratings = Rating.query.all()
        
    res = []
    for r in ratings:
        res.append({"name": r.name, "year": r.year, "poster": r.poster, "stars": r.stars})
    return jsonify(res)

@app.route('/mood/<mood>', methods=['GET'])
def mood_movies(mood):
    import random
    import concurrent.futures
    
    mood_map = {
        "happy": {"genres": ["comedy", "family", "animation"], "terms": ["fun", "happy", "comedy", "laugh", "smile", "joy"]},
        "sad": {"genres": ["drama"], "terms": ["life", "loss", "rain", "alone", "heart", "broken"]},
        "thrilled": {"genres": ["action", "thriller"], "terms": ["mission", "fight", "chase", "rush", "fast", "fury"]},
        "romantic": {"genres": ["romance"], "terms": ["love", "kiss", "wedding", "heart", "romance", "passion"]},
        "nostalgic": {"genres": ["adventure", "family"], "terms": ["dream", "magic", "wonder", "boy", "girl", "home"]},
        "mindblown": {"genres": ["sci-fi", "mystery"], "terms": ["space", "mind", "future", "time", "matrix", "quantum"]},
        "scared": {"genres": ["horror"], "terms": ["horror", "dead", "dark", "ghost", "night", "evil"]},
    }
    
    config = mood_map.get(mood.lower(), mood_map["happy"])
    chosen_genre = random.choice(config["genres"])
    chosen_terms = random.sample(config["terms"], min(3, len(config["terms"])))
    
    all_items = []
    seen_ids = set()
    
    def fetch_term(term):
        url = f"https://www.omdbapi.com/?s={term}&type=movie&apikey=7de076f4"
        try:
            data = requests.get(url, timeout=3).json()
            if data.get("Response") != "False":
                return data.get("Search", [])
        except:
            pass
        return []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(fetch_term, t) for t in chosen_terms]
        for f in concurrent.futures.as_completed(futures):
            for item in f.result():
                iid = item.get("imdbID")
                if iid and iid not in seen_ids and item.get("Poster") != "N/A":
                    seen_ids.add(iid)
                    all_items.append(item)
    
    random.shuffle(all_items)
    
    # If genre filtering needed, do detail lookups (limited to save API calls)
    results = []
    
    def check_genre(item):
        detail_url = f"https://www.omdbapi.com/?i={item['imdbID']}&apikey=7de076f4"
        try:
            d = requests.get(detail_url, timeout=3).json()
            if d.get("Response") != "False":
                item_genres = [g.strip().lower() for g in d.get("Genre", "").split(",")]
                if chosen_genre in item_genres:
                    return {
                        "name": d.get("Title"), "year": d.get("Year"), 
                        "poster": d.get("Poster"), "imdbRating": d.get("imdbRating"),
                        "genre": d.get("Genre"), "plot": d.get("Plot", "")[:120]
                    }
        except:
            pass
        return None
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(check_genre, item) for item in all_items[:25]]
        for f in concurrent.futures.as_completed(futures):
            r = f.result()
            if r:
                results.append(r)
                if len(results) >= 10:
                    break
    
    # If not enough genre matches, fill with unfiltered results
    if len(results) < 4:
        for item in all_items:
            if len(results) >= 10:
                break
            entry = {"name": item.get("Title"), "year": item.get("Year"), "poster": item.get("Poster")}
            if entry not in results:
                results.append(entry)
    
    return jsonify({"mood": mood, "genre": chosen_genre, "results": results})

@app.route('/versus/matchups', methods=['GET'])
def get_matchups():
    import random
    words = ["war", "love", "night", "day", "star", "man", "blood", "fire", "dark", "light", "super", "hero"]
    query = random.choice(words)
    page = random.randint(1, 4)
    
    url = f"https://www.omdbapi.com/?s={query}&page={page}&type=movie&apikey=7de076f4"
    res = requests.get(url, timeout=5)
    data = res.json()
    
    movies = []
    if data.get("Response") != "False":
        for item in data.get("Search", []):
            if item.get("Poster") != "N/A":
                movies.append(item)
                
    random.shuffle(movies)
    return jsonify(movies)

@app.route('/versus/vote', methods=['POST'])
def versus_vote():
    from home_DB import VersusStat
    req = request.json
    winner = req.get("winner")
    loser = req.get("loser")
    
    w_stat = VersusStat.query.filter_by(imdb_id=winner["imdbID"]).first()
    if not w_stat:
        w_stat = VersusStat(imdb_id=winner["imdbID"], name=winner["Title"] if "Title" in winner else winner["name"], poster=winner["Poster"], wins=0, losses=0)
        db.session.add(w_stat)
    w_stat.wins += 1
    
    l_stat = VersusStat.query.filter_by(imdb_id=loser["imdbID"]).first()
    if not l_stat:
        l_stat = VersusStat(imdb_id=loser["imdbID"], name=loser["Title"] if "Title" in loser else loser["name"], poster=loser["Poster"], wins=0, losses=0)
        db.session.add(l_stat)
    l_stat.losses += 1
    
    db.session.commit()
    
    return jsonify({
        "winner_stats": {"wins": w_stat.wins, "losses": w_stat.losses},
        "loser_stats": {"wins": l_stat.wins, "losses": l_stat.losses}
    })

@app.route('/versus/leaderboard', methods=['GET'])
def versus_leaderboard():
    from home_DB import VersusStat
    stats = VersusStat.query.order_by(VersusStat.wins.desc()).limit(15).all()
    res = []
    for s in stats:
        total = s.wins + s.losses
        win_rate = (s.wins / total * 100) if total > 0 else 0
        res.append({
            "imdb_id": s.imdb_id,
            "name": s.name,
            "poster": s.poster,
            "wins": s.wins,
            "losses": s.losses,
            "win_rate": round(win_rate, 1)
        })
    return jsonify(res)


with app.app_context():
    from home_DB import WatchLater, Rating, VersusStat
    db.create_all()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
